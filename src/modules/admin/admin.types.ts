import { JwtPayload } from "jsonwebtoken";

export interface createAdminTypes {
  name: string;
  email: string;
  password: string;
  role: "super-admin" | "admin";
  isActive: boolean;
}
export interface loginAdminTypes {
  email: string;
  password: string;
}
export interface updateAdminTypes {
  name?: string;
  password?: string;
  role?: "super-admin" | "admin";
  isActive?: boolean;
}
export interface listAdminType {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
export interface RefreshTokenPayload extends JwtPayload {
  _id: string;
}
export interface Me {
  _id: string;
  name: string;
  role: "super-admin" | "admin";
}
export interface ChangePasswordTypes {
  currentPassword: string;
  newPassword: string;
}
export interface UpdateProfileTypes {
  name?: string;
  email?: string;
}
export interface ToggleStatusTypes {
  isActive: boolean;
}
export type AuditAction =
  | "login"
  | "logout"
  | "create_admin"
  | "update_admin"
  | "delete_admin"
  | "change_password"
  | "update_profile"
  | "toggle_status"
  | "force_logout";

