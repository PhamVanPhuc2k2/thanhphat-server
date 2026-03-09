import { NextFunction, Request, Response } from "express";
import { ApiError } from "./apiError";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Lỗi chưa được xử lý", err);
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ message: err.message, details: err.details });
  }
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: "Lỗi phía server" });
};
