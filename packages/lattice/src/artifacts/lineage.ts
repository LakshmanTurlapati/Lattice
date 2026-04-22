import type {
  ArtifactFingerprint,
  ArtifactKind,
  ArtifactPrivacy,
  ArtifactSize,
  ArtifactSource,
  ArtifactStorageRef,
} from "./artifact.js";

export type ArtifactTransformKind =
  | "manual"
  | "generated"
  | "extraction"
  | "chunking"
  | "transcription"
  | "resizing"
  | "provider-packaging"
  | "tool-result"
  | "model-output";

export interface ArtifactTransformDescriptor {
  readonly kind: ArtifactTransformKind;
  readonly name?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ArtifactParentRef {
  readonly id: string;
  readonly kind: ArtifactKind;
  readonly mediaType?: string;
  readonly source: ArtifactSource;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
  readonly privacy: ArtifactPrivacy;
  readonly size?: ArtifactSize;
  readonly fingerprint?: ArtifactFingerprint;
  readonly storage?: ArtifactStorageRef;
  readonly lineage?: ArtifactLineage;
}

export interface ArtifactLineage {
  readonly parents: readonly ArtifactParentRef[];
  readonly transform: ArtifactTransformDescriptor;
}
