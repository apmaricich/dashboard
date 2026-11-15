import { useState, useEffect, useCallback } from "react";
import { runShellCommand } from "../lib/shell.js";
import type { LayoutVarConfig } from "../config/loader.js";

interface UseLayoutVarsResult {
  values: Record<string, string>;
}

/**
 * Hook that resolves layout template variables by running their shell commands
 * at their configured refresh intervals.
 */
export function useLayoutVars(
  vars: Record<string, LayoutVarConfig>
): UseLayoutVarsResult {
  const [values, setValues] = useState<Record<string, string>>({});

  // Run all vars immediately on mount and set up their intervals
  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];

    // Run each var immediately on mount
    for (const [name, varConfig] of Object.entries(vars)) {
      (async () => {
        try {
          const result = await runShellCommand(varConfig.command);
          setValues((prev) => ({ ...prev, [name]: result }));
        } catch (error) {
          console.error(`Layout var "${name}" failed:`, error);
        }
      })();

      // Then set up recurring interval
      const timer = setInterval(async () => {
        try {
          const result = await runShellCommand(varConfig.command);
          setValues((prev) => ({ ...prev, [name]: result }));
        } catch (error) {
          console.error(`Layout var "${name}" failed:`, error);
          setValues((prev) => ({ ...prev, [name]: "" }));
        }
      }, varConfig.refresh * 1000);
      timers.push(timer);
    }

    return () => {
      for (const timer of timers) {
        clearInterval(timer);
      }
    };
  }, [vars]);

  return { values };
}
