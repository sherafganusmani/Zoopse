import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../http/api-response";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      throw new ApiError(422, "VALIDATION_ERROR", "Request validation failed", parsed.error.flatten());
    }
    req[source] = parsed.data;
    next();
  };
}
