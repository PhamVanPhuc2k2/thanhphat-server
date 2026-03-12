import { CreateOrderType, ListOrderQuery, UpdateOrderStatusType } from "./order.types";
import Order from "./order.models";
import Variant from "../variant/variant.models";
import { ApiError } from "../../utils/apiError";
import { escapeRegex } from "../../utils/escapeRegex";
import mongoose from "mongoose";
import { sendNewOrderNotification } from "../../utils/telegramNotify";

const generateOrderCode = (): string => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TP${y}${m}${d}-${rand}`;
};

export const orderService = {
  /**
   * Tạo đơn hàng mới
   * - Kiểm tra variant tồn tại & đủ stock
   * - Tính totalAmount phía server (không tin client)
   * - Trừ stock variant
   */
  create: async (data: CreateOrderType) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { customer, items, paymentMethod } = data;
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const variant = await Variant.findById(item.variantId).session(session);
        if (!variant) {
          throw ApiError.NotFound(`Biến thể sản phẩm "${item.variantName}" không tồn tại`);
        }
        if (!variant.isActive) {
          throw ApiError.BadRequest(`Biến thể "${item.variantName}" hiện không khả dụng`);
        }
        if (variant.stock < item.quantity) {
          throw ApiError.BadRequest(
            `Sản phẩm "${item.variantName}" chỉ còn ${variant.stock} sản phẩm trong kho`,
          );
        }

        // Lấy giá phía server (không tin giá client gửi lên)
        const unitPrice = variant.discountPrice && variant.discountPrice > 0
          ? variant.discountPrice
          : variant.price;
        const lineTotal = unitPrice * item.quantity;
        totalAmount += lineTotal;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          variantName: item.variantName,
          price: unitPrice,
          quantity: item.quantity,
          image: item.image,
        });

        // Trừ stock
        await Variant.findByIdAndUpdate(
          item.variantId,
          { $inc: { stock: -item.quantity } },
          { session },
        );
      }

      const orderCode = generateOrderCode();
      const [order] = await Order.create(
        [
          {
            orderCode,
            customer,
            items: orderItems,
            totalAmount,
            paymentMethod: paymentMethod || "COD",
            status: "pending",
          },
        ],
        { session },
      );

      await session.commitTransaction();

      // Gửi thông báo Telegram (fire-and-forget, không block response)
      sendNewOrderNotification({
        orderCode: order.orderCode,
        customer: order.customer,
        items: order.items.map((i) => ({
          name: i.name,
          variantName: i.variantName,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: order.totalAmount,
      }).catch(() => {}); // lỗi thông báo không ảnh hưởng đến đơn hàng

      return { order };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * - Kiểm tra flow hợp lệ
   * - Hoàn stock nếu huỷ đơn
   */
  updateStatus: async (id: string, data: UpdateOrderStatusType) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(id).session(session);
      if (!order) throw ApiError.NotFound("Đơn hàng không tồn tại");

      const { status, cancelReason } = data;

      // Kiểm tra flow trạng thái hợp lệ
      const validTransitions: Record<string, string[]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["shipping", "cancelled"],
        shipping: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      };

      const allowedNext = validTransitions[order.status] || [];
      if (!allowedNext.includes(status)) {
        throw ApiError.BadRequest(
          `Không thể chuyển trạng thái từ "${order.status}" sang "${status}"`,
        );
      }

      // Hoàn stock nếu huỷ đơn
      if (status === "cancelled") {
        if (!cancelReason) {
          throw ApiError.BadRequest("Vui lòng nhập lý do huỷ đơn");
        }
        for (const item of order.items) {
          await Variant.findByIdAndUpdate(
            item.variantId,
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
        order.cancelReason = cancelReason;
      }

      order.status = status;
      await order.save({ session });

      await session.commitTransaction();
      return { order };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Danh sách đơn hàng (admin)
   */
  list: async (query: ListOrderQuery) => {
    const { page = 1, limit = 10, status, search, fromDate, toDate } = query;
    const filter: any = {};

    if (status) filter.status = status;

    if (search) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { orderCode: { $regex: safeSearch, $options: "i" } },
        { "customer.name": { $regex: safeSearch, $options: "i" } },
        { "customer.phone": { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Chi tiết đơn hàng
   */
  detail: async (id: string) => {
    const order = await Order.findById(id).select("-__v");
    if (!order) throw ApiError.NotFound("Đơn hàng không tồn tại");
    return { order };
  },

  /**
   * Tra cứu đơn hàng theo orderCode + phone (public)
   */
  track: async (orderCode: string, phone: string) => {
    const order = await Order.findOne({
      orderCode: orderCode.trim(),
      "customer.phone": phone.trim(),
    }).select("-__v");
    if (!order)
      throw ApiError.NotFound(
        "Không tìm thấy đơn hàng với thông tin đã cung cấp",
      );
    return { order };
  },

  /**
   * Xoá đơn hàng (chỉ đơn đã huỷ hoặc đã hoàn thành)
   */
  delete: async (id: string) => {
    const order = await Order.findById(id);
    if (!order) throw ApiError.NotFound("Đơn hàng không tồn tại");
    if (!["cancelled", "completed"].includes(order.status)) {
      throw ApiError.BadRequest(
        "Chỉ có thể xoá đơn hàng đã huỷ hoặc đã hoàn thành",
      );
    }
    await Order.findByIdAndDelete(id);
    return { id };
  },
};
