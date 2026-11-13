import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Run a task command using the `task` CLI tool.
 *
 * @param {string} taskFile - Path to the Taskfile (tasks.json or any task-compatible file)
 * @param {string} [specificTask] - Optional specific task to run. If omitted,
 *                                   runs `task --file {taskFile}` which lists all tasks.
 * @returns {Promise<string>} The stdout of the task command
 */
export async function runTaskCommand(
  taskFile: string,
  specificTask?: string
): Promise<string> {
  let command = `task --file ${taskFile}`;
  if (specificTask) {
    command = `${command} ${specificTask}`;
  }

  try {
    const result = await execAsync(command);
    return result.stdout || "";
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    if (err.stdout && err.stdout.trim()) {
      return err.stdout.trim();
    }
    throw new Error(err.stderr || err.message || "task command failed");
  }
}
