import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../configs/env";
import { ApiError } from "../utils/apiError";

type AdminRole = "super-admin" | "admin";

interface AuthPayload extends JwtPayload {
  _id: string;
  role: AdminRole;
  name: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(ApiError.UnAuthorized("Không có access token"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.SECRET_ACCESS_TOKEN,
    ) as AuthPayload;

    res.locals.admin = {
      _id: decoded._id,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch {
    return next(ApiError.UnAuthorized("Token không hợp lệ hoặc đã hết hạn"));
  }
};
