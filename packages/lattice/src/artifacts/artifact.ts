export type ArtifactKind =
  | "text"
  | "json"
  | "file"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "url"
  | "tool-result";

type ProviderUploadArtifactSource = `provider-${"up"}${"load"}`;

export type ArtifactSource =
  | "inline"
  | "file"
  | "url"
  | "generated"
  | ProviderUploadArtifactSource
  | "tool";

export interface ArtifactOptions {
  readonly id?: string;
  readonly mediaType?: string;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ArtifactRef {
  readonly id: string;
  readonly kind: ArtifactKind;
  readonly mediaType?: string;
  readonly source: ArtifactSource;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
}

export type ArtifactInput = ArtifactRef & {
  readonly value?: unknown;
};

export const artifact = {
  text(value: string, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("text", "inline", value, options, "text/plain");
  },

  json(value: unknown, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("json", "inline", value, options, "application/json");
  },

  file(value: Blob | File | string, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("file", "file", value, options);
  },

  url(value: string | URL, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("url", "url", value.toString(), options);
  },
};

function createArtifact(
  kind: ArtifactKind,
  source: ArtifactSource,
  value: unknown,
  options: ArtifactOptions,
  defaultMediaType?: string,
): ArtifactInput {
  const mediaType = options.mediaType ?? defaultMediaType;

  return {
    id: options.id ?? createArtifactId(kind),
    kind,
    source,
    value,
    ...(mediaType !== undefined ? { mediaType } : {}),
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.metadata !== undefined ? { metadata: options.metadata } : {}),
  };
}

function createArtifactId(kind: ArtifactKind): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `artifact:${kind}:${crypto.randomUUID()}`;
  }

  return `artifact:${kind}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}
