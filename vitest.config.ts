import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "test/**/*.test.ts", "test/**/*.test.tsx"],
    exclude: ["dist/**", "node_modules/**", "**/time.test.ts"],
  },
});