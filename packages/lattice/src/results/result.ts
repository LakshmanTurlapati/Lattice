import type { ArtifactRef } from "../artifacts/artifact.js";
import type { OutputContractMap } from "../outputs/contracts.js";
import type { InferOutputMap } from "../outputs/infer.js";
import type { ExecutionPlanStub } from "../plan/plan.js";
import type { LatticeRunError } from "./errors.js";

export interface RunSuccess<TOutputs extends OutputContractMap> {
  readonly ok: true;
  readonly outputs: InferOutputMap<TOutputs>;
  readonly artifacts: readonly ArtifactRef[];
  readonly plan: ExecutionPlanStub;
}

export interface RunFailure {
  readonly ok: false;
  readonly error: LatticeRunError;
  readonly raw?: unknown;
  readonly partialOutputs?: Record<string, unknown>;
  readonly plan: ExecutionPlanStub;
}

export type RunResult<TOutputs extends OutputContractMap> =
  | RunSuccess<TOutputs>
  | RunFailure;
