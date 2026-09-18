import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const sqlPath = fileURLToPath(new URL("../../migrations/001_vertical_slice_01.sql", import.meta.url));
const sql = await readFile(sqlPath, "utf8");
await pool.query(sql);
await pool.end();
console.log(JSON.stringify({ event: "database.migrated", migration: "001_vertical_slice_01" }));
