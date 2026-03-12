import {
  createAdminTypes,
  listAdminType,
  loginAdminTypes,
  Me,
  RefreshTokenPayload,
  updateAdminTypes,
  ChangePasswordTypes,
  UpdateProfileTypes,
  ToggleStatusTypes,
  AuditAction,
} from "./admin.types";
import Admin from "./admin.models";
import AdminAuditLog from "./adminAuditLog.models";
import { ApiError } from "../../utils/apiError";
import { comparePassword, hashPassword } from "../../utils/handlePassword";
import { signAccessToken, signRefreshToken } from "../../utils/token";
import jwt from "jsonwebtoken";
import { env } from "../../configs/env";
import { redis } from "../../configs/redis";
import { AUTH } from "../../configs/auth.constants";
import { listAdminQuery } from "../../utils/query/listAdmin.query";

// ===== Audit Log Helper =====
const logAudit = async (
  adminId: string,
  action: AuditAction,
  options?: { targetId?: string; details?: string; ip?: string },
) => {
  try {
    await AdminAuditLog.create({
      adminId,
      action,
      targetId: options?.targetId || null,
      details: options?.details || null,
      ip: options?.ip || null,
    });
  } catch {
    // Audit log failure should not break main flow
    console.error(`Failed to log audit: ${action} by ${adminId}`);
  }
};

export const adminService = {
  create: async (data: createAdminTypes, performedBy: string, ip?: string) => {
    const { email, password } = data;
    const checkAdmin = await Admin.findOne({ email });
    if (checkAdmin) throw ApiError.Conflict("Email đã được đăng ký");
    const hashed = await hashPassword(password);
    const doc = { ...data, password: hashed };
    const admin = await Admin.create(doc);

    await logAudit(performedBy, "create_admin", {
      targetId: admin._id.toString(),
      details: `Tạo admin: ${admin.email}`,
      ip,
    });

    return { admin };
  },

  login: async (data: loginAdminTypes, ip?: string) => {
    const { email, password } = data;
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) throw ApiError.BadRequest("Tài khoản hoặc mật khẩu không chính xác");

    // #15: Check isActive on login
    if (!admin.isActive)
      throw ApiError.Forbidden("Tài khoản đã bị vô hiệu hóa");

    const compared = await comparePassword(password, admin.password);
    if (!compared)
      throw ApiError.BadRequest("Tài khoản hoặc mật khẩu không chính xác");

    const payload = {
      _id: admin._id,
      role: admin.role,
      name: admin.name,
    };
    const resAdmin = {
      _id: admin._id,
      name: admin.name,
      role: admin.role,
      email: admin.email,
    };
    const access_token = signAccessToken(payload);
    const refresh_token = signRefreshToken({ _id: payload._id });

    await logAudit(admin._id.toString(), "login", { ip });

    return {
      admin: resAdmin,
      access_token,
      refresh_token,
    };
  },

  // #9: Reduced from 2 queries to 1
  update: async (
    id: string,
    data: updateAdminTypes,
    performedBy: string,
    ip?: string,
  ) => {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedAdmin) throw ApiError.NotFound("Admin không tồn tại");

    await logAudit(performedBy, "update_admin", {
      targetId: id,
      details: `Cập nhật admin: ${updatedAdmin.email}`,
      ip,
    });

    return { updatedAdmin };
  },

  // #1: Authorization check is now in controller via requireRole middleware
  // #2: Self-delete prevention is in controller
  // #10: Reduced from 2 queries to 1
  delete: async (id: string, performedBy: string, ip?: string) => {
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) throw ApiError.NotFound("Admin không tồn tại");

    // Also clean up their refresh token
    await redis.del(`refresh:${id}`);

    await logAudit(performedBy, "delete_admin", {
      targetId: id,
      details: `Xóa admin: ${deletedAdmin.email}`,
      ip,
    });

    return { deletedAdmin: id };
  },

  list: async (query: listAdminType) => {
    const parserQuery = listAdminQuery(query);
    const { filter, options } = parserQuery;
    const list = await Admin.find(filter)
      .sort(options.sort)
      .limit(options.limit)
      .skip(options.skip);
    const total = await Admin.countDocuments(filter);
    return {
      admins: list,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  },

  detail: async (id: string) => {
    const admin = await Admin.findById(id);
    if (!admin) throw ApiError.NotFound("Admin không tồn tại");
    return { admin };
  },

  refresh: async (refreshToken: string) => {
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        env.SECRET_REFRESH_TOKEN,
      ) as RefreshTokenPayload;
    } catch {
      throw ApiError.UnAuthorized(
        "Refresh token không hợp lệ hoặc đã hết hạn",
      );
    }
    const savedToken = await redis.get(`refresh:${decoded._id}`);
    if (refreshToken !== savedToken)
      throw ApiError.UnAuthorized(
        "Refresh token không hợp lệ hoặc đã hết hạn",
      );

    const admin = await Admin.findById(decoded._id);
    if (!admin) throw ApiError.NotFound("Admin không tồn tại");

    // #15: Also check isActive on refresh
    if (!admin.isActive)
      throw ApiError.Forbidden("Tài khoản đã bị vô hiệu hóa");

    const payload = {
      _id: admin._id,
      role: admin.role,
      name: admin.name,
    };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken({ _id: admin._id });
    await redis.set(`refresh:${admin._id}`, newRefreshToken, {
      EX: AUTH.REFRESH_TOKEN_TTL,
    });
    return { newAccessToken, newRefreshToken };
  },

  me: async (admin: Me) => {
    const { _id } = admin;
    const me = await Admin.findById(_id).select(
      "-createdAt -updatedAt -__v -isActive",
    );
    if (!me) throw ApiError.NotFound("Admin không tồn tại");
    return { me };
  },

  // #12: Change password (requires current password)
  changePassword: async (
    adminId: string,
    data: ChangePasswordTypes,
    ip?: string,
  ) => {
    const { currentPassword, newPassword } = data;
    const admin = await Admin.findById(adminId).select("+password");
    if (!admin) throw ApiError.NotFound("Admin không tồn tại");

    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) throw ApiError.BadRequest("Mật khẩu hiện tại không đúng");

    admin.password = await hashPassword(newPassword);
    await admin.save();

    // Invalidate refresh token to force re-login
    await redis.del(`refresh:${adminId}`);

    await logAudit(adminId, "change_password", { ip });

    return { message: "Đổi mật khẩu thành công" };
  },

  // #13: Admin self-update profile
  updateProfile: async (
    adminId: string,
    data: UpdateProfileTypes,
    ip?: string,
  ) => {
    if (data.email) {
      const existing = await Admin.findOne({
        email: data.email,
        _id: { $ne: adminId },
      });
      if (existing) throw ApiError.Conflict("Email đã được sử dụng");
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedAdmin) throw ApiError.NotFound("Admin không tồn tại");

    await logAudit(adminId, "update_profile", {
      details: `Cập nhật profile`,
      ip,
    });

    return { admin: updatedAdmin };
  },

  // #14: Toggle active/inactive status
  toggleStatus: async (
    id: string,
    data: ToggleStatusTypes,
    performedBy: string,
    ip?: string,
  ) => {
    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: data.isActive },
      { new: true },
    );
    if (!admin) throw ApiError.NotFound("Admin không tồn tại");

    // If deactivating, invalidate their session
    if (!data.isActive) {
      await redis.del(`refresh:${id}`);
    }

    await logAudit(performedBy, "toggle_status", {
      targetId: id,
      details: `${data.isActive ? "Kích hoạt" : "Vô hiệu hóa"} admin: ${admin.email}`,
      ip,
    });

    return { admin };
  },

  // #17: Force logout (super-admin)
  forceLogout: async (id: string, performedBy: string, ip?: string) => {
    const admin = await Admin.findById(id);
    if (!admin) throw ApiError.NotFound("Admin không tồn tại");

    await redis.del(`refresh:${id}`);

    await logAudit(performedBy, "force_logout", {
      targetId: id,
      details: `Force logout admin: ${admin.email}`,
      ip,
    });

    return { message: `Đã đăng xuất admin: ${admin.email}` };
  },
};
