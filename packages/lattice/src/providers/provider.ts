export interface ProviderRef {
  readonly id: string;
  readonly kind?: "provider-ref";
}

export interface ProviderRunRequest {
  readonly task: string;
  readonly artifacts: readonly unknown[];
  readonly outputs: readonly string[];
  readonly policy?: unknown;
  readonly signal?: AbortSignal;
}

export interface ProviderRunResponse {
  readonly rawOutputs: Record<string, unknown>;
  readonly artifactRefs?: readonly unknown[];
}

export interface ProviderAdapter {
  readonly id: string;
  readonly kind: "provider-adapter";
  readonly execute?: (request: ProviderRunRequest) => Promise<ProviderRunResponse>;
}

export type ProviderRegistryInput = readonly (ProviderRef | ProviderAdapter | string)[];
