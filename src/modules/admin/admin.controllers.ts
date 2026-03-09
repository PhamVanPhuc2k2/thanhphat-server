import { Request, Response } from "express";
import { adminService } from "./admin.services";
import { ApiError } from "../../utils/apiError";
import { redis } from "../../configs/redis";
import { getRefreshCookieOptions } from "../../utils/cookieOptions";
import { AUTH } from "../../configs/auth.constants";

export const adminController = {
  create: async (req: Request, res: Response) => {
    const data = req.body;
    const performedBy = res.locals.admin._id;
    const ip = req.ip;
    const admin = await adminService.create(data, performedBy, ip);
    return res.status(201).json(admin);
  },

  login: async (req: Request, res: Response) => {
    const data = req.body;
    const ip = req.ip;
    const admin = await adminService.login(data, ip);
    const { refresh_token, ...others } = admin;

    res.cookie("refresh_token", refresh_token, getRefreshCookieOptions());

    await redis.set(`refresh:${others.admin._id}`, refresh_token, {
      EX: AUTH.REFRESH_TOKEN_TTL,
    });
    return res.status(200).json(others);
  },

  // #1 + #2: Authorization via requireRole middleware in routes
  // Self-delete prevention check
  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const performedBy = res.locals.admin._id;
    const ip = req.ip;
    const updatedAdmin = await adminService.update(id, data, performedBy, ip);
    return res.status(200).json(updatedAdmin);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const currentAdminId = res.locals.admin._id;

    // #2: Prevent self-deletion
    if (id === currentAdminId.toString()) {
      throw ApiError.BadRequest("Không thể xóa chính tài khoản của bạn");
    }

    const ip = req.ip;
    const deletedAdmin = await adminService.delete(id, currentAdminId, ip);
    return res.status(200).json(deletedAdmin);
  },

  list: async (req: Request, res: Response) => {
    const query = res.locals.query;
    const listAdmin = await adminService.list(query);
    return res.status(200).json(listAdmin);
  },

  detail: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const admin = await adminService.detail(id);
    return res.status(200).json(admin);
  },

  refresh: async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) throw ApiError.UnAuthorized("Không có refresh token");

    const resultRefresh = await adminService.refresh(refreshToken);
    const { newRefreshToken, newAccessToken } = resultRefresh;

    res.cookie("refresh_token", newRefreshToken, getRefreshCookieOptions());

    return res.status(200).json({ newAccessToken });
  },

  me: async (req: Request, res: Response) => {
    const admin = res.locals.admin;
    const me = await adminService.me(admin);
    return res.status(200).json(me);
  },

  logout: async (req: Request, res: Response) => {
    const admin = res.locals.admin;
    const { _id } = admin;

    // #3: Use same cookie options as login for consistent clearing
    res.clearCookie("refresh_token", getRefreshCookieOptions());

    await redis.del(`refresh:${_id}`);
    return res.status(200).json({ id: _id });
  },

  // #12: Change password
  changePassword: async (req: Request, res: Response) => {
    const adminId = res.locals.admin._id;
    const data = req.body;
    const ip = req.ip;
    const result = await adminService.changePassword(adminId, data, ip);

    // Clear cookie since refresh token is invalidated
    res.clearCookie("refresh_token", getRefreshCookieOptions());

    return res.status(200).json(result);
  },

  // #13: Update own profile
  updateProfile: async (req: Request, res: Response) => {
    const adminId = res.locals.admin._id;
    const data = req.body;
    const ip = req.ip;
    const result = await adminService.updateProfile(adminId, data, ip);
    return res.status(200).json(result);
  },

  // #14: Toggle status
  toggleStatus: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const performedBy = res.locals.admin._id;
    const ip = req.ip;
    const result = await adminService.toggleStatus(id, data, performedBy, ip);
    return res.status(200).json(result);
  },

  // #17: Force logout
  forceLogout: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const performedBy = res.locals.admin._id;
    const ip = req.ip;
    const result = await adminService.forceLogout(id, performedBy, ip);
    return res.status(200).json(result);
  },
};
