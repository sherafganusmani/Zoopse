import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../http/api-response";

type AccessTokenPayload = {
  sub: string;
  collegeId: string | null;
  role: string;
  permissions: string[];
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new ApiError(401, "AUTH_REQUIRED", "Authentication is required");
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = {
      id: payload.sub,
      collegeId: payload.collegeId,
      role: payload.role,
      permissions: payload.permissions
    };
    next();
  } catch {
    throw new ApiError(401, "TOKEN_INVALID", "Access token is invalid or expired");
  }
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.permissions.includes(permission)) {
      throw new ApiError(403, "FORBIDDEN", `Permission ${permission} is required`);
    }
    next();
  };
}
