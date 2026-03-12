import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

type AdminRole = "super-admin" | "admin";

export const requireRole = (...roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const adminRole = res.locals.admin?.role;
    if (!adminRole || !roles.includes(adminRole)) {
      return next(ApiError.Forbidden("Bạn không có quyền thực hiện thao tác này"));
    }
    next();
  };
};
