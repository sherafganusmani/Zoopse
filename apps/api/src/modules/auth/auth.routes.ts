import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { permissions, rolePermissions, roles, users } from "@campus/db";
import { env } from "../../config/env";
import { db } from "../../db/client";
import { ApiError, ok } from "../../http/api-response";
import { validate } from "../../middlewares/validate";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  collegeCode: z.string().trim().optional()
});

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.email, req.body.email.toLowerCase())).limit(1);

  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "USER_INACTIVE", "User is not active");
  }

  const [role] = await db.select().from(roles).where(eq(roles.id, user.roleId)).limit(1);
  const permissionRows = await db
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, user.roleId));

  const accessToken = jwt.sign(
    {
      sub: user.id,
      collegeId: user.collegeId,
      role: role?.name,
      permissions: permissionRows.map((permission) => permission.key)
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL }
  );

  const refreshToken = jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL });

  return ok(req, res, {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      collegeId: user.collegeId
    }
  });
});
