import { Request, Response } from "express";
import Order from "../order/order.models";
import Product from "../product/product.models";
import Admin from "../admin/admin.models";
import Article from "../article/article.models";
import { StatusCodes } from "http-status-codes";

export const dashboardController = {
  stats: async (_req: Request, res: Response) => {
    const [
      totalProducts,
      totalOrders,
      totalAdmins,
      totalArticles,
      pendingOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Admin.countDocuments(),
      Article.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderCode customer.name totalAmount status createdAt"),
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    return res.status(StatusCodes.OK).json({
      totalProducts,
      totalOrders,
      totalAdmins,
      totalArticles,
      pendingOrders,
      totalRevenue,
      recentOrders,
    });
  },
};
