import type { ArtifactInput, ArtifactRef } from "../artifacts/artifact.js";
import type { OutputContractMap } from "../outputs/contracts.js";
import { validateOutputMap } from "../outputs/validate.js";
import { createExecutionPlanStub } from "../plan/plan.js";
import { mergePolicy, type PolicySpec } from "../policy/policy.js";
import type { ProviderAdapter, ProviderRunRequest } from "../providers/provider.js";
import type { RunResult } from "../results/result.js";
import type { SessionRef } from "../sessions/session.js";
import {
  normalizeConfig,
  type LatticeConfig,
  type NormalizedLatticeConfig,
} from "./config.js";

export interface RunIntent<TOutputs extends OutputContractMap> {
  readonly task: string;
  readonly artifacts?: readonly ArtifactInput[];
  readonly outputs: TOutputs;
  readonly policy?: PolicySpec;
  readonly session?: SessionRef;
  readonly signal?: AbortSignal;
}

export interface AI {
  session(id: string): SessionRef;
  run<const TOutputs extends OutputContractMap>(
    intent: RunIntent<TOutputs>,
  ): Promise<RunResult<TOutputs>>;
}

export function createAI(config: LatticeConfig = {}): AI {
  const normalized = normalizeConfig(config);

  return {
    session(id: string): SessionRef {
      return {
        id,
        kind: "session-ref",
      };
    },
    run<const TOutputs extends OutputContractMap>(
      intent: RunIntent<TOutputs>,
    ): Promise<RunResult<TOutputs>> {
      return runWithConfig(normalized, intent);
    },
  };
}

async function runWithConfig<const TOutputs extends OutputContractMap>(
  normalized: NormalizedLatticeConfig,
  intent: RunIntent<TOutputs>,
): Promise<RunResult<TOutputs>> {
  if (intent.signal?.aborted === true) {
    throw new DOMException("Run aborted before execution.", "AbortError");
  }

  const plan = createExecutionPlanStub();
  const mergedPolicy = mergePolicy(normalized.defaults.policy, intent.policy);
  const adapter = normalized.providers.find(isExecutableProviderAdapter);

  if (adapter === undefined) {
    return {
      ok: false,
      error: {
        kind: "execution_unavailable",
        message: "No Phase 1 provider adapter with execute() is configured.",
      },
      plan,
    };
  }

  try {
    const request: ProviderRunRequest = {
      task: intent.task,
      artifacts: intent.artifacts ?? [],
      outputs: Object.keys(intent.outputs),
      ...(mergedPolicy !== undefined ? { policy: mergedPolicy } : {}),
      ...(intent.signal !== undefined ? { signal: intent.signal } : {}),
    };
    const response = await adapter.execute(request);
    const validation = await validateOutputMap(intent.outputs, response.rawOutputs, plan);

    if (!validation.ok) {
      return {
        ...validation,
        plan,
      };
    }

    return {
      ...validation,
      artifacts:
        response.artifactRefs !== undefined
          ? (response.artifactRefs as readonly ArtifactRef[])
          : [],
      plan,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        kind: "execution_unavailable",
        message:
          error instanceof Error ? error.message : "Provider adapter execution failed.",
      },
      plan,
    };
  }
}

function isExecutableProviderAdapter(
  provider: NormalizedLatticeConfig["providers"][number],
): provider is ProviderAdapter & Required<Pick<ProviderAdapter, "execute">> {
  return provider.kind === "provider-adapter" && typeof provider.execute === "function";
}
