export { artifact } from "./artifacts/artifact.js";
export { output } from "./outputs/contracts.js";
export { createAI } from "./runtime/create-ai.js";

export type { AI, RunIntent } from "./runtime/create-ai.js";
export type {
  ArtifactInput,
  ArtifactKind,
  ArtifactRef,
  ExecutionPlanStub,
  InferOutput,
  InferOutputMap,
  LatticeConfig,
  LatticeRunError,
  NormalizedLatticeConfig,
  OutputContract,
  OutputContractMap,
  PolicySpec,
  ProviderAdapter,
  ProviderRef,
  ProviderRunRequest,
  ProviderRunResponse,
  RunFailure,
  RunResult,
  RunSuccess,
  SessionRef,
  StorageLike,
  TracerLike,
  ValidationIssue,
} from "./runtime/public-types.js";

export const latticeVersion = "0.0.0";
