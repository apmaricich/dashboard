export interface MlxStatusInfo {
  running: boolean;
  models: string[];
  queueLength: number;
}

export async function getMlxStatus(endpoint: string): Promise<MlxStatusInfo> {
  return {
    running: false,
    models: [],
    queueLength: 0,
  };
}
