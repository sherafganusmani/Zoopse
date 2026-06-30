import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openApiDocument } from "./docs/openapi";
import { errorHandler, ok, requestContext } from "./http/api-response";
import { attendanceRouter } from "./modules/attendance/attendance.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { directoryRouter } from "./modules/directory/directory.routes";
import { reportsRouter } from "./modules/reports/reports.routes";
import { settingsRouter } from "./modules/settings/settings.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 60_000, limit: 240, standardHeaders: true, legacyHeaders: false }));

  app.get("/health", (req, res) => ok(req, res, { status: "ok" }));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/attendance", attendanceRouter);
  app.use("/api/v1/directory", directoryRouter);
  app.use("/api/v1/reports", reportsRouter);
  app.use("/api/v1/settings", settingsRouter);
  app.use(errorHandler);

  return app;
}
