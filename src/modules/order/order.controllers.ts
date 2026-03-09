import { Request, Response } from "express";
import { orderService } from "./order.services";
import { StatusCodes } from "http-status-codes";

export const orderController = {
  create: async (req: Request, res: Response) => {
    const result = await orderService.create(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Đặt hàng thành công",
      data: result,
    });
  },

  updateStatus: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await orderService.updateStatus(id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: result,
    });
  },

  list: async (req: Request, res: Response) => {
    const result = await orderService.list(req.query as any);
    res.status(StatusCodes.OK).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: result,
    });
  },

  detail: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await orderService.detail(id);
    res.status(StatusCodes.OK).json({
      message: "Lấy chi tiết đơn hàng thành công",
      data: result,
    });
  },

  delete: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await orderService.delete(id);
    res.status(StatusCodes.OK).json({
      message: "Xoá đơn hàng thành công",
      data: result,
    });
  },
};
