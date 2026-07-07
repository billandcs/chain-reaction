import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(join(root, "prisma", "init.sql"), "utf8");
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const filePath = databaseUrl.startsWith("file:")
  ? databaseUrl.slice("file:".length)
  : databaseUrl;
const dbPath = resolve(root, filePath.replace(/^\.\//, ""));

const db = new DatabaseSync(dbPath);
db.exec(sql);
db.close();

console.log(`SQLite database initialized at ${dbPath}`);
