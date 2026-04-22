import type { PolicySpec } from "../policy/policy.js";
import type {
  ProviderAdapter,
  ProviderRef,
  ProviderRegistryInput,
} from "../providers/provider.js";
import type { StorageLike } from "../storage/storage.js";
import type { TracerLike } from "../tracing/tracing.js";

export interface LatticeConfig {
  readonly providers?: ProviderRegistryInput;
  readonly storage?: StorageLike | false;
  readonly defaults?: { readonly policy?: PolicySpec };
  readonly tracing?: TracerLike | false;
}

export type NormalizedProviderEntry = ProviderRef | ProviderAdapter;

export interface NormalizedLatticeConfig {
  readonly providers: readonly NormalizedProviderEntry[];
  readonly storage?: StorageLike;
  readonly defaults: { readonly policy?: PolicySpec };
  readonly tracing?: TracerLike;
}

export function normalizeConfig(config: LatticeConfig = {}): NormalizedLatticeConfig {
  const normalized: {
    providers: readonly NormalizedProviderEntry[];
    defaults: { readonly policy?: PolicySpec };
    storage?: StorageLike;
    tracing?: TracerLike;
  } = {
    providers: normalizeProviders(config.providers),
    defaults: config.defaults ?? {},
  };

  if (config.storage !== undefined && config.storage !== false) {
    normalized.storage = config.storage;
  }

  if (config.tracing !== undefined && config.tracing !== false) {
    normalized.tracing = config.tracing;
  }

  return normalized;
}

function normalizeProviders(
  providers: ProviderRegistryInput = [],
): readonly NormalizedProviderEntry[] {
  return providers.map((provider) => {
    if (typeof provider === "string") {
      return {
        id: provider,
        kind: "provider-ref",
      };
    }

    return provider;
  });
}
