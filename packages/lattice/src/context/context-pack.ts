import type { ArtifactInput, ArtifactRef } from "../artifacts/artifact.js";
import { toArtifactRef } from "../artifacts/artifact.js";
import type {
  ContextPackItemPlan,
  ContextPackPlan,
  SelectedRoute,
} from "../plan/plan.js";
import type { SessionRecord } from "../sessions/session.js";

export type TrustLabel = "developer" | "user" | "tool" | "model-summary";

export interface ContextPack extends ContextPackPlan {
  readonly kind: "context-pack";
}

export interface BuildContextPackInput {
  readonly task: string;
  readonly artifacts: readonly ArtifactInput[];
  readonly route?: SelectedRoute;
  readonly session?: SessionRecord;
  readonly tokenBudget?: number;
}

export interface ContextSummarizer {
  summarize(input: {
    readonly artifacts: readonly ArtifactRef[];
    readonly budgetTokens: number;
  }): Promise<readonly ArtifactRef[]> | readonly ArtifactRef[];
}

export function buildContextPack(input: BuildContextPackInput): ContextPack {
  const routeBudget =
    input.route?.estimates.inputTokens ?? input.route?.inputModalities.length ?? 0;
  const tokenBudget =
    input.tokenBudget ?? Math.max(512, Math.min(input.route?.estimates.inputTokens ?? 4_000, 16_000));
  const remainingBudget = Math.max(512, tokenBudget - estimateTokens(input.task) - routeBudget);
  const included: ContextPackItemPlan[] = [];
  const summarized: ContextPackItemPlan[] = [];
  const archived: ContextPackItemPlan[] = [];
  const omitted: ContextPackItemPlan[] = [];
  const warnings: string[] = [];
  let usedTokens = 0;

  for (const artifact of input.artifacts) {
    const artifactTokens = estimateArtifactTokens(artifact);
    const item: ContextPackItemPlan = {
      artifactId: artifact.id,
      reason: "Run artifact included for provider consideration.",
      estimatedTokens: artifactTokens,
      trust: trustForArtifact(artifact),
    };

    if (usedTokens + artifactTokens <= remainingBudget) {
      included.push(item);
      usedTokens += artifactTokens;
      continue;
    }

    if (artifact.kind === "text" || artifact.kind === "document" || artifact.kind === "json") {
      summarized.push({
        ...item,
        reason: "Artifact exceeded live context budget and needs summary packaging.",
      });
      usedTokens += Math.min(artifactTokens, 256);
      continue;
    }

    omitted.push({
      ...item,
      reason: "Artifact exceeded context budget and cannot be summarized by the default packer.",
    });
    warnings.push(`Artifact ${artifact.id} omitted from live context budget.`);
  }

  for (const turn of input.session?.turns ?? []) {
    const turnTokens = estimateTokens(turn.task);
    const item: ContextPackItemPlan = {
      sessionTurnId: turn.id,
      reason: "Prior session turn retained for continuity.",
      estimatedTokens: turnTokens,
      trust: "user",
    };

    if (usedTokens + turnTokens <= remainingBudget) {
      included.push(item);
      usedTokens += turnTokens;
    } else {
      archived.push({
        ...item,
        reason: "Prior session turn archived because the run budget was exhausted.",
      });
    }
  }

  return {
    id: createContextPackId(),
    kind: "context-pack",
    tokenBudget,
    estimatedTokens: usedTokens,
    included,
    summarized,
    archived,
    omitted,
    warnings,
  };
}

export function estimateArtifactTokens(artifact: ArtifactInput | ArtifactRef): number {
  if (artifact.size?.characters !== undefined) {
    return estimateTokensFromCharacters(artifact.size.characters);
  }

  if (artifact.size?.bytes !== undefined) {
    return estimateTokensFromCharacters(Math.ceil(artifact.size.bytes / 2));
  }

  if ("value" in artifact && typeof artifact.value === "string") {
    return estimateTokens(artifact.value);
  }

  if ("value" in artifact && artifact.value !== undefined) {
    const serialized = JSON.stringify(artifact.value);

    return serialized === undefined ? 64 : estimateTokens(serialized);
  }

  return 64;
}

export function estimateTokens(value: string): number {
  return Math.max(1, estimateTokensFromCharacters(value.length));
}

export function toContextArtifactRefs(
  artifacts: readonly ArtifactInput[],
): readonly ArtifactRef[] {
  return artifacts.map(toArtifactRef);
}

function estimateTokensFromCharacters(characters: number): number {
  return Math.ceil(characters / 4);
}

function trustForArtifact(artifact: ArtifactRef): TrustLabel {
  if (artifact.source === "tool") {
    return "tool";
  }

  if (artifact.source === "generated") {
    return "model-summary";
  }

  return "user";
}

function createContextPackId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `context-pack:${crypto.randomUUID()}`;
  }

  return `context-pack:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}
