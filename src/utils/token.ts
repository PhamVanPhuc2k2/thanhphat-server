import jwt from "jsonwebtoken";
import { env } from "../configs/env";
import { AUTH } from "../configs/auth.constants";

export const signAccessToken = (payload: object) => {
  return jwt.sign(payload, env.SECRET_ACCESS_TOKEN, {
    expiresIn: AUTH.ACCESS_TOKEN_EXPIRY,
  });
};

export const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, env.SECRET_REFRESH_TOKEN, {
    expiresIn: AUTH.REFRESH_TOKEN_EXPIRY,
  });
};
