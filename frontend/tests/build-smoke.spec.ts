import { execSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");

describe("build smoke", () => {
  it("runs next build successfully", () => {
    const output = execSync("pnpm build", {
      cwd: root,
      env: { ...process.env, CI: "true" }
    }).toString();

    expect(output).toMatch(/Compiled successfully/);
  });
});
