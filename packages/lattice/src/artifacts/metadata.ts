import mime from "mime";

import type { ArtifactKind, ArtifactOptions, ArtifactSize } from "./artifact.js";

export interface InferMediaTypeOptions
  extends Pick<ArtifactOptions, "mediaType"> {
  readonly kind: ArtifactKind;
  readonly defaultMediaType?: string;
}

const textEncoder = new TextEncoder();

export function inferMediaType(
  value: unknown,
  options: InferMediaTypeOptions,
): string | undefined {
  if (options.mediaType !== undefined) {
    return options.mediaType;
  }

  if (isBlobLike(value) && value.type !== "") {
    return value.type;
  }

  if (typeof value === "string") {
    return mime.getType(value) ?? options.defaultMediaType;
  }

  return options.defaultMediaType;
}

export function measureArtifactValue(
  value: unknown,
  kind: ArtifactKind,
): ArtifactSize | undefined {
  if (kind === "text" && typeof value === "string") {
    return measureString(value);
  }

  if (kind === "json") {
    const serialized = JSON.stringify(value);

    return serialized === undefined ? undefined : measureString(serialized);
  }

  if (isBlobLike(value)) {
    return {
      bytes: value.size,
    };
  }

  return undefined;
}

function measureString(value: string): ArtifactSize {
  return {
    characters: value.length,
    bytes: textEncoder.encode(value).byteLength,
  };
}

function isBlobLike(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}
