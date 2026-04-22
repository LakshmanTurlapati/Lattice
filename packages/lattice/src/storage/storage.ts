import type { ArtifactInput, ArtifactRef } from "../artifacts/artifact.js";

export interface ArtifactStore {
  readonly kind: "artifact-store";
  readonly id: string;
  put(artifact: ArtifactInput): Promise<ArtifactRef>;
  get(id: string): Promise<ArtifactRef | undefined>;
  load(id: string): Promise<ArtifactInput | undefined>;
  has(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  list(): Promise<readonly ArtifactRef[]>;
}

export type StorageLike = ArtifactStore;

export interface StoredArtifactPayloadDescriptor {
  readonly kind: "json" | "binary";
  readonly path: string;
}

export interface StoredArtifactEnvelope {
  readonly version: 1;
  readonly ref: ArtifactRef;
  readonly payload?: StoredArtifactPayloadDescriptor;
}
