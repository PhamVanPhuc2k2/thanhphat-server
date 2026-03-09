export const AUTH = {
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60, // seconds (Redis EX)
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // milliseconds (cookie maxAge)
};
