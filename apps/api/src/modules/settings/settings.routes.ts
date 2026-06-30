import { Router } from "express";
import { z } from "zod";
import { settings } from "@campus/db";
import { db } from "../../db/client";
import { ok } from "../../http/api-response";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";

export const settingsRouter = Router();

const settingSchema = z.object({
  collegeId: z.string().uuid().optional(),
  key: z.string().min(2).max(120),
  value: z.unknown(),
  isEncrypted: z.boolean().default(false)
});

settingsRouter.use(requireAuth);

settingsRouter.get("/", requirePermission("settings.manage"), async (req, res) => {
  const rows = await db.select().from(settings);
  return ok(req, res, rows);
});

settingsRouter.put("/:key", validate(z.object({ key: z.string().min(2).max(120) }), "params"), validate(settingSchema), requirePermission("settings.manage"), async (req, res) => {
  const value = {
    collegeId: req.body.collegeId ?? req.user?.collegeId,
    key: req.params.key,
    value: req.body.value,
    isEncrypted: req.body.isEncrypted
  };

  const [saved] = await db
    .insert(settings)
    .values(value)
    .onConflictDoUpdate({
      target: [settings.collegeId, settings.key],
      set: {
        value: value.value,
        isEncrypted: value.isEncrypted,
        updatedAt: new Date()
      }
    })
    .returning();

  return ok(req, res, saved);
});
