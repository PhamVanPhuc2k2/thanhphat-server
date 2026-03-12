import { z } from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

const customerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  phone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional(),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  note: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  name: z.string().min(1),
  variantName: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  image: z.string().optional(),
});

export const createOrderSchema = z.object({
  body: z.object({
    customer: customerSchema,
    items: z.array(orderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
    paymentMethod: z.enum(["COD"]).optional(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["confirmed", "shipping", "completed", "cancelled"]),
    cancelReason: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const getOrderSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const trackOrderSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    orderCode: z.string().min(1, "Mã đơn hàng không được để trống"),
    phone: z
      .string()
      .min(9, "Số điện thoại không hợp lệ")
      .max(15, "Số điện thoại không hợp lệ"),
  }),
});

export const listOrderSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    status: z
      .enum(["pending", "confirmed", "shipping", "completed", "cancelled"])
      .optional(),
    search: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  }),
});
