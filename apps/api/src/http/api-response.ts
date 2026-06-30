import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        collegeId: string | null;
        role: string;
        permissions: string[];
      };
    }
  }
}

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  req.requestId = req.header("x-request-id") ?? randomUUID();
  next();
}

export function ok<T>(req: Request, res: Response, data: T, status = 200, pagination?: { page: number; pageSize: number; total: number }) {
  return res.status(status).json({
    success: true,
    data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      ...pagination
    }
  });
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const apiError = error instanceof ApiError ? error : new ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred");
  if (!(error instanceof ApiError)) {
    console.error({ requestId: req.requestId, error });
  }

  return res.status(apiError.status).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }
  });
}
