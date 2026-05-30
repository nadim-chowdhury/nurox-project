#!/usr/bin/env node
/**
 * Smoke-check the Docker stack after `pnpm docker:up`.
 * Usage: node scripts/docker-verify.js
 */
const http = require("http");

const checks = [
  { name: "API health", url: "http://localhost:3001/api/health" },
  { name: "Web (login)", url: "http://localhost:3000/en/login" },
];

function fetch(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function waitFor(name, url, maxAttempts = 30, delayMs = 4000) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const code = await fetch(url);
      if (code >= 200 && code < 400) {
        console.log(`✅ ${name} — HTTP ${code}`);
        return true;
      }
      console.log(`⏳ ${name} — HTTP ${code} (attempt ${i}/${maxAttempts})`);
    } catch {
      console.log(`⏳ ${name} — waiting (attempt ${i}/${maxAttempts})`);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  console.error(`❌ ${name} — not ready after ${maxAttempts} attempts`);
  return false;
}

async function main() {
  console.log("\n🔍 NUROX Docker verification\n");
  let ok = true;
  for (const c of checks) {
    const passed = await waitFor(c.name, c.url);
    if (!passed) ok = false;
  }
  if (!ok) {
    console.log("\nTip: run `pnpm docker:logs` and ensure `pnpm docker:up` finished building.\n");
    process.exit(1);
  }
  console.log("\n✅ Stack looks ready. Login: admin@nurox.app / password123\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
