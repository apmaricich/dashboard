import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function runShellCommand(
  command: string,
  env?: Record<string, string>
): Promise<string> {
  try {
    const result = await execAsync(command, env ? { env: { ...process.env, ...env } } : undefined);
    return String(result.stdout).trim();
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    if (err.stdout && String(err.stdout).trim()) {
      return String(err.stdout).trim();
    }
    throw new Error(err.stderr || err.message || "Command failed");
  }
}
