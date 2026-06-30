import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@campus/db";
import { env } from "../config/env";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined,
  max: 20
});

export const db = drizzle(pool, { schema });
