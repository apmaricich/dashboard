import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import {
  currentLoad,
  mem,
  cpuTemperature,
  graphics,
  fsSize,
  osInfo,
  networkInterfaces,
  battery,
  processes,
} from "systeminformation";

const execAsync = promisify(exec);

/** CPU load and temperature */
export interface CpuInfo {
  /** Overall CPU load percentage (0-100) */
  load: number;
  /** Per-core load percentages */
  cores: number[];
  /** CPU temperature in Celsius (null if not available) */
  temperature: number | null;
}

/** Memory usage */
export interface MemoryInfo {
  /** Total memory in bytes */
  total: number;
  /** Used memory in bytes */
  used: number;
  /** Free memory in bytes */
  free: number;
  /** Available memory (free + reclaimable) in bytes */
  available: number;
  /** Usage percentage */
  percent: number;
}

/** GPU info */
export interface GpuInfo {
  /** GPU utilization percentage (0-100) */
  usage: number;
  gpus: Array<{
    vendor: string;
    name: string;
    cores: number;
    vram: number | null;
    temperature: number | null;
  }>;
}

/** Filesystem usage */
export interface FilesystemInfo {
  filesystems: Array<{
    /** Device name */
    device: string;
    /** Filesystem type */
    type: string;
    /** Mount point */
    mount: string;
    /** Total space in bytes */
    size: number;
    /** Used space in bytes */
    used: number;
    /** Available space in bytes */
    available: number;
    /** Usage percentage */
    percent: number;
  }>;
}

/** OS info */
export interface OsInfo {
  /** Platform (e.g., 'darwin') */
  platform: string;
  /** OS release version */
  release: string;
  /** Hostname */
  hostname: string;
  /** Kernel version */
  kernel: string;
  /** Arch */
  arch: string;
}

/** Network interfaces */
export interface NetworkInfo {
  interfaces: Array<{
    /** Interface name */
    name: string;
    /** MAC address */
    mac: string;
    /** IPv4 address */
    ipv4: string;
    /** IPv6 address */
    ipv6: string;
  }>;
}

/** Process info */
export interface ProcessInfo {
  /** Total running processes */
  total: number;
  /** Running processes */
  running: number;
  /** Sleeping processes */
  sleeping: number;
  /** Top processes by CPU */
  topCpu: Array<{
    name: string;
    pid: number;
    cpu: number;
  }>;
  /** Top processes by memory */
  topMem: Array<{
    name: string;
    pid: number;
    mem: number;
  }>;
}

/** Power/battery info */
export interface PowerInfo {
  /** Has battery */
  hasBattery: boolean;
  /** Battery percentage (null if not on battery) */
  percent: number | null;
  /** Is charging */
  isCharging: boolean;
  /** AC connected */
  acConnected: boolean;
}

/** Complete system metrics snapshot */
export interface SystemMetrics {
  cpu: CpuInfo;
  memory: MemoryInfo;
  gpu: GpuInfo;
  filesystem: FilesystemInfo;
  os: OsInfo;
  network: NetworkInfo;
  power: PowerInfo;
  processes: ProcessInfo;
  uptime: number;
  loadAvg: number[];
}

/**
 * Get GPU usage percentage on macOS.
 * Uses Window Server process CPU usage as a proxy for GPU activity.
 */
async function getGpuUsage(): Promise<number> {
  try {
    // On macOS, GPU work is handled by WindowServer process
    // Use its CPU usage as an approximation for GPU utilization
    const { stdout } = await execAsync(
      "ps -A -o %cpu,command | grep 'WindowServer' | grep -v grep | awk '{print $1}'"
    );
    const usage = parseFloat(stdout.trim());
    return isNaN(usage) ? 0 : Math.round(usage);
  } catch {
    return 0;
  }
}

/**
 * Collect all system metrics.
 * Uses the `systeminformation` package for comprehensive hardware data.
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    // Collect metrics in parallel for speed
    const [
      loadData,
      memData,
      tempData,
      graphicsData,
      gpuUsage,
      fsData,
      osData,
      networkData,
      batteryData,
      processData,
    ] = await Promise.all([
      currentLoad(),
      mem(),
      cpuTemperature().catch(() => ({ main: null, cores: [], max: null })),
      graphics().catch(() => ({ controllers: [] })),
      getGpuUsage(),
      fsSize().catch(() => []),
      osInfo(),
      networkInterfaces().catch(() => []),
      battery().catch(() => ({ hasBattery: false, isCharging: false, percent: 0, acConnected: false })),
      processes().catch(() => ({ all: 0, running: 0, blocked: 0, sleeping: 0, list: [] })),
    ]);

    // Memory percentage
    const memPercent =
      memData.total > 0 ? (memData.used / memData.total) * 100 : 0;

    // Filesystem info
    const fsInfo = fsData.map((fs) => ({
      device: fs.fs,
      type: fs.type,
      mount: fs.mount,
      size: fs.size,
      used: fs.used,
      available: fs.available,
      percent: fs.use,
    }));

    // Top processes by CPU
    const topCpu = [...(processData.list || [])]
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5)
      .map((p) => ({ name: p.name, pid: p.pid, cpu: p.cpu }));

    // Top processes by memory
    const topMem = [...(processData.list || [])]
      .sort((a, b) => b.mem - a.mem)
      .slice(0, 5)
      .map((p) => ({ name: p.name, pid: p.pid, mem: p.mem }));

    // Network interfaces
    const netInterfaces = networkData
      .filter((n) => n.ip4 || n.ip6)
      .slice(0, 5)
      .map((n) => ({
        name: n.iface,
        mac: n.mac,
        ipv4: n.ip4,
        ipv6: n.ip6,
      }));

    return {
      cpu: {
        load: loadData.currentLoad,
        cores: loadData.cpus.map((c) => c.load),
        temperature: tempData.main,
      },
      memory: {
        total: memData.total,
        used: memData.used,
        free: memData.free,
        available: memData.available,
        percent: memPercent,
      },
      gpu: {
        usage: gpuUsage,
        gpus: graphicsData.controllers.map((g) => ({
          vendor: g.vendor,
          name: g.model,
          cores: Number(g.cores) || 0,
          vram: g.vram,
          temperature: null,
        })),
      },
      filesystem: { filesystems: fsInfo },
      os: {
        platform: osData.platform,
        release: osData.release,
        hostname: osData.hostname,
        kernel: osData.kernel,
        arch: osData.arch,
      },
      network: { interfaces: netInterfaces },
      power: {
        hasBattery: batteryData.hasBattery,
        percent: batteryData.hasBattery ? batteryData.percent : null,
        isCharging: batteryData.isCharging,
        acConnected: batteryData.acConnected,
      },
      processes: {
        total: processData.all,
        running: processData.running,
        sleeping: processData.sleeping,
        topCpu,
        topMem,
      },
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
    };
  } catch (error) {
    console.error("Error collecting system metrics:", error);
    throw error;
  }
}
