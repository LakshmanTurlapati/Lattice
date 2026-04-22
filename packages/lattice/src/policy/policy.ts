export interface PolicySpec {
  readonly maxCostUsd?: number;
  readonly latency?: "interactive" | "batch";
  readonly privacy?: "standard" | "sensitive" | "restricted";
  readonly providerAllowList?: readonly string[];
  readonly providerDenyList?: readonly string[];
  readonly noUpload?: boolean;
  readonly noPublicUrl?: boolean;
  readonly noLogging?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export function mergePolicy(
  defaultPolicy?: PolicySpec,
  runPolicy?: PolicySpec,
): PolicySpec | undefined {
  if (defaultPolicy === undefined && runPolicy === undefined) {
    return undefined;
  }

  return {
    ...defaultPolicy,
    ...runPolicy,
  };
}
