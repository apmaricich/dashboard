const MLX_ENDPOINT = "http://localhost:11235";

export interface MlxStatus {
  running: boolean;
  model: string | null;
  bytesResident: number;
  bytesOnDisk: number;
  state: "ready" | "unloaded";
  contextLength: number | null;
  quantization: string | null;
  architecture: string | null;
  numLayers: number | null;
  capabilities: string[];
}

interface MlxModelMeta {
  architecture?: string;
  num_layers?: number;
  quantization?: string;
  context_length?: number;
  kv_quant?: string;
}

interface MlxModelInfo {
  id: string;
  loaded: boolean;
  bytes_resident: number;
  bytes_on_disk: number;
  context_length: number;
  capabilities: string[];
  meta?: MlxModelMeta;
}

/**
 * Fetch MLX models with timeout support.
 * Uses AbortController to enforce timeout and prevent hanging requests.
 */
async function fetchMlxModels(timeoutMs = 5000): Promise<MlxModelInfo[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${MLX_ENDPOINT}/v1/models`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`MLX API returned ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`MLX API request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get MLX-serve status.
 * Returns a status object even when the API is unreachable.
 */
export async function getMlxStatus(): Promise<MlxStatus> {
  try {
    const models = await fetchMlxModels();
    const loadedModel = models.find((m) => m.loaded);
    
    if (!loadedModel) {
      return {
        running: true,
        model: null,
        bytesResident: 0,
        bytesOnDisk: 0,
        state: "unloaded",
        contextLength: null,
        quantization: null,
        architecture: null,
        numLayers: null,
        capabilities: [],
      };
    }

    return {
      running: true,
      model: loadedModel.id,
      bytesResident: loadedModel.bytes_resident,
      bytesOnDisk: loadedModel.bytes_on_disk,
      state: "ready",
      contextLength: loadedModel.context_length || null,
      quantization: loadedModel.meta?.quantization || null,
      architecture: loadedModel.meta?.architecture || null,
      numLayers: loadedModel.meta?.num_layers || null,
      capabilities: loadedModel.capabilities || [],
    };
  } catch (error) {
    // Log detailed error for debugging, return safe default
    console.error(`MLX-serve status error: ${error}`);
    return {
      running: false,
      model: null,
      bytesResident: 0,
      bytesOnDisk: 0,
      state: "unloaded",
      contextLength: null,
      quantization: null,
      architecture: null,
      numLayers: null,
      capabilities: [],
    };
  }
}
