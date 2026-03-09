import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, "ID không hợp lệ");

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .max(100, "Mật khẩu tối đa 100 ký tự");

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(100).trim(),
    email: z.string().email("Email không hợp lệ"),
    password: passwordSchema,
    role: z.enum(["admin"]),
    isActive: z.boolean(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const loginAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu không được để trống"),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const updateAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    password: passwordSchema.optional(),
    role: z.enum(["admin"]).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: ZodEmptyObject,
});

export const deleteAdminSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: objectIdSchema,
  }),
  query: ZodEmptyObject,
});

export const listAdminSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const getAdminSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: objectIdSchema,
  }),
  query: ZodEmptyObject,
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
    newPassword: passwordSchema,
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).trim().optional(),
      email: z.string().email("Email không hợp lệ").optional(),
    })
    .refine((data) => data.name || data.email, {
      message: "Cần cung cấp ít nhất 1 trường để cập nhật",
    }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const toggleStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: ZodEmptyObject,
});

export const forceLogoutSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: objectIdSchema,
  }),
  query: ZodEmptyObject,
});
