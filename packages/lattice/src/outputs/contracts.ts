import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { ArtifactKind } from "../artifacts/artifact.js";

export type TextOutputContract = "text";

export interface CitationRef {
  readonly artifactId: string;
  readonly label?: string;
  readonly span?: {
    readonly start?: number;
    readonly end?: number;
  };
  readonly metadata?: Record<string, unknown>;
}

export interface CitationsOutputContract {
  readonly kind: "citations";
}

export interface ArtifactRefsOutputContract {
  readonly kind: "artifacts";
  readonly artifactKind?: ArtifactKind | string;
}

export type SchemaOutputContract = StandardSchemaV1;

export type OutputContract =
  | TextOutputContract
  | SchemaOutputContract
  | CitationsOutputContract
  | ArtifactRefsOutputContract;

export type OutputContractMap = Record<string, OutputContract>;

export const output = {
  citations(): CitationsOutputContract {
    return { kind: "citations" };
  },

  artifacts(options: {
    readonly artifactKind?: ArtifactKind | string;
  } = {}): ArtifactRefsOutputContract {
    return { kind: "artifacts", ...options };
  },
};
