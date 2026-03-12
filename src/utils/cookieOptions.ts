import { CookieOptions } from "express";
import { env } from "../configs/env";
import { AUTH } from "../configs/auth.constants";

export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: AUTH.COOKIE_MAX_AGE,
});
