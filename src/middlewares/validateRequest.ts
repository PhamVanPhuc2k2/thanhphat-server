import { NextFunction, Request, Response } from "express";
import z, { ZodObject } from "zod";
import { ApiError } from "../utils/apiError";

export const ZodEmptyObject = z.object({}).optional();

export const validateRequest = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      throw ApiError.BadRequest(
        `Validation error: ${details.map((i) => i.path).join(", ")}`,
        details,
      );
    }
    res.locals.query = result.data.query;
    next();
  };
};
