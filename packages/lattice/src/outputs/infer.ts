import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { ArtifactRef } from "../artifacts/artifact.js";
import type {
  ArtifactRefsOutputContract,
  CitationRef,
  CitationsOutputContract,
  OutputContractMap,
} from "./contracts.js";

export type InferOutput<C> = C extends "text"
  ? string
  : C extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<C>
    : C extends CitationsOutputContract
      ? readonly CitationRef[]
      : C extends ArtifactRefsOutputContract
        ? readonly ArtifactRef[]
        : never;

export type InferOutputMap<T extends OutputContractMap> = {
  readonly [K in keyof T]: InferOutput<T[K]>;
};
