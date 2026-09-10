#!/usr/bin/env -S npx tsx
/**
 * One-off script to create the first (or an additional) owner account.
 *
 * Usage (from apps/api, which is where DATABASE_URL lives):
 *   npm run seed-admin --workspace=apps/api -- <username> <password>
 *
 * Loads apps/api/.env.local if present, otherwise expects DATABASE_URL and
 * BCRYPT_ROUNDS to already be set in the environment.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

function loadDotEnvLocal() {
  const envPath = path.join(__dirname, "..", "apps", "api", ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadDotEnvLocal();

  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: seed-admin <username> <password>");
    process.exit(1);
  }
  if (username.length < 3 || username.length > 50) {
    console.error("Username must be between 3 and 50 characters");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL (set it in apps/api/.env.local or the environment)");
    process.exit(1);
  }

  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
  const saltRounds = Number.isNaN(rounds) ? 12 : Math.max(8, Math.min(rounds, 14));
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const sql = neon(databaseUrl);
  const existing = await sql`select id from users where username = ${username} limit 1`;
  if (existing.length > 0) {
    console.error(`User "${username}" already exists`);
    process.exit(1);
  }

  const rows = await sql`
    insert into users (username, password_hash)
    values (${username}, ${passwordHash})
    returning id, username, created_at
  `;

  console.log("Created owner account:", rows[0]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
