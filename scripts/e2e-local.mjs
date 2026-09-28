/**
 * One-command local E2E: seed local Supabase, then run Playwright with the
 * dev server pointed at local (NOT .env.local, which may target Cloud).
 *
 * Usage:
 *   node scripts/e2e-local.mjs [-- <playwright args>]
 * Examples:
 *   node scripts/e2e-local.mjs
 *   node scripts/e2e-local.mjs -- --project=chromium-authenticated tests/dashboard.spec.ts
 *
 * Requires: local Supabase running (`npx supabase start`), browsers installed.
 * Never touches non-localhost databases (seed-local.mjs enforces this).
 */
import { execSync, spawnSync } from "node:child_process";

const dashdash = process.argv.indexOf("--");
const extraArgs = dashdash === -1 ? [] : process.argv.slice(dashdash + 1);
const playwrightArgs =
  extraArgs.length > 0
    ? extraArgs
    : ["--project=setup", "--project=chromium-authenticated", "tests/auth.spec.ts"];

function readLocalSupabaseEnv() {
  const output = execSync("npx supabase status -o env", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const get = (key) => {
    const match = output.match(new RegExp(`^${key}="([^"]+)"`, "m"));
    return match ? match[1] : "";
  };
  return {
    apiUrl: get("API_URL") || "http://127.0.0.1:54321",
    anonKey: get("ANON_KEY"),
    serviceKey: get("SERVICE_ROLE_KEY"),
  };
}

const local = readLocalSupabaseEnv();
if (!local.serviceKey || !local.anonKey) {
  console.error("Could not read local Supabase keys. Is `npx supabase start` running?");
  process.exit(1);
}

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: local.apiUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: local.anonKey,
  SUPABASE_SERVICE_ROLE_KEY: local.serviceKey,
  E2E_SUPABASE_URL: local.apiUrl,
  E2E_SUPABASE_SERVICE_KEY: local.serviceKey,
  E2E_TEST_EMAIL: "e2e.teacher@test.local",
  E2E_TEST_PASSWORD: "E2eTest1234!",
  E2E_LOGOUT_EMAIL: "e2e.logout@test.local",
  E2E_LOGOUT_PASSWORD: "E2eLogout1234!",
};

console.log("Seeding local Supabase (idempotent, localhost-only)...");
const seed = spawnSync("node", ["tests/seed-local.mjs"], { env, stdio: "inherit" });
if (seed.status !== 0) {
  console.error("Seed failed — aborting E2E run.");
  process.exit(seed.status ?? 1);
}

console.log(`Running: npx playwright test ${playwrightArgs.join(" ")}`);
const run = spawnSync("npx", ["playwright", "test", ...playwrightArgs], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(run.status ?? 1);
