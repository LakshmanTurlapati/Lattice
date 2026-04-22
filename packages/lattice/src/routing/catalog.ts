import type {
  CapabilityModality,
  ModelCapability,
  ProviderAdapter,
  ProviderRef,
} from "../providers/provider.js";

export const DEFAULT_CATALOG_VERSION = "lattice:catalog:v1";

export interface CapabilityCatalog {
  readonly version: string;
  readonly models: readonly ModelCapability[];
}

export function createCapabilityCatalog(
  providers: readonly (ProviderRef | ProviderAdapter)[],
): CapabilityCatalog {
  return {
    version: DEFAULT_CATALOG_VERSION,
    models: providers.flatMap((provider) => {
      if (provider.kind === "provider-adapter" && provider.capabilities !== undefined) {
        return provider.capabilities;
      }

      return [defaultCapabilityForProvider(provider.id)];
    }),
  };
}

export function defaultCapabilityForProvider(providerId: string): ModelCapability {
  return {
    providerId,
    modelId: `${providerId}:default`,
    inputModalities: ["text", "json", "image", "audio", "document", "file", "url", "tool"],
    outputModalities: ["text", "json"],
    fileTransport: ["inline", "json", "url", "base64", "extracted-text", "transcript"],
    contextWindow: 16_000,
    structuredOutput: true,
    toolUse: false,
    streaming: false,
    pricing: {
      inputCostPer1M: 0,
      outputCostPer1M: 0,
    },
    latency: "interactive",
    dataPolicy: {
      privacy: ["standard", "sensitive"],
      uploadRetention: "none",
      supportsNoLogging: true,
      supportsNoTraining: true,
    },
    available: true,
  };
}

export function modalRank(modality: CapabilityModality): number {
  const ranks: Record<CapabilityModality, number> = {
    text: 0,
    json: 1,
    image: 2,
    audio: 3,
    document: 4,
    file: 5,
    url: 6,
    video: 7,
    tool: 8,
  };

  return ranks[modality];
}
