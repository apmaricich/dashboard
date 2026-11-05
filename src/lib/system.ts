import os from "os";

export interface SystemMetrics {
  cpu: number;
  memory: number;
  uptime: number;
  loadAvg: number[];
}

export function getSystemMetrics(): SystemMetrics {
  return {
    cpu: 0,
    memory: 0,
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
  };
}
