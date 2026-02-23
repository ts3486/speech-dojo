import { execSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");

describe("build smoke", () => {
  it("runs next build successfully", () => {
    const output = execSync("pnpm build", {
      cwd: root,
      env: { ...process.env, CI: "true" },
      timeout: 120_000
    }).toString();

    // Next.js build outputs route information
    expect(output).toMatch(/Route|Generating|Compiled/);
  });
});
