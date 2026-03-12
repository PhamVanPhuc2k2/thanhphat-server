import z from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGO_URL: z.string().min(1),
  CORS_ORIGINS: z.string(),
  FRONTEND_BASE_URL: z.string(),
  SECRET_ACCESS_TOKEN: z.string(),
  SECRET_REFRESH_TOKEN: z.string(),
  CLOUD_NAME: z.string(),
  CLOUD_KEY: z.string(),
  CLOUD_SECRET: z.string(),
  REDIS_URL: z.string(),
});

export const env = schema.parse(process.env);
