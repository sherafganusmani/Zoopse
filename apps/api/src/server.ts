import { createApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db/client";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Campus Attendance API listening on ${env.PORT}`);
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});
