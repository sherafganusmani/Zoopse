import { permissions as permissionKeys, roles as roleNames } from "@campus/shared";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { permissions, roles } from "./schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined
});

const db = drizzle(pool);

async function main() {
  await db
    .insert(roles)
    .values(roleNames.map((name) => ({ name, description: `${name.replaceAll("_", " ")} role` })))
    .onConflictDoNothing();

  await db
    .insert(permissions)
    .values(permissionKeys.map((key) => ({ key, description: `${key} permission` })))
    .onConflictDoNothing();
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
