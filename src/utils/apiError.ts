import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(msg = "Dữ liệu xấu", details?: unknown) {
    return new ApiError(StatusCodes.BAD_REQUEST, msg, details);
  }

  static Conflict(msg = "Xung đột dữ liệu", details?: unknown) {
    return new ApiError(StatusCodes.CONFLICT, msg, details);
  }

  static UnAuthorized(msg = "Không có quyền truy cập", details?: unknown) {
    return new ApiError(StatusCodes.UNAUTHORIZED, msg, details);
  }

  static NotFound(msg = "Không tìm thấy dữ liệu", details?: unknown) {
    return new ApiError(StatusCodes.NOT_FOUND, msg, details);
  }

  static Forbidden(msg = "Không có quyền truy cập", details?: unknown) {
    return new ApiError(StatusCodes.FORBIDDEN, msg, details);
  }
}
