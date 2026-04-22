import type { PolicySpec } from "../policy/policy.js";
import { inferMediaType, measureArtifactValue } from "./metadata.js";

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

export type ArtifactPrivacy = NonNullable<PolicySpec["privacy"]>;

export interface ArtifactSize {
  readonly bytes?: number;
  readonly characters?: number;
  readonly pages?: number;
  readonly width?: number;
  readonly height?: number;
  readonly durationMs?: number;
}

export interface ArtifactFingerprint {
  readonly algorithm: "sha256";
  readonly value: string;
}

export interface ArtifactStorageRef {
  readonly storeId: string;
  readonly key: string;
}

export interface ArtifactOptions {
  readonly id?: string;
  readonly mediaType?: string;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
  readonly privacy?: ArtifactPrivacy;
  readonly size?: ArtifactSize;
  readonly fingerprint?: ArtifactFingerprint;
  readonly storage?: ArtifactStorageRef;
}

export interface ArtifactToolResultOptions extends ArtifactOptions {
  readonly toolName: string;
  readonly callId?: string;
}

export interface ArtifactRef {
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

  image(value: Blob | File | string, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("image", "file", value, options);
  },

  audio(value: Blob | File | string, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("audio", "file", value, options);
  },

  document(value: Blob | File | string, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("document", "file", value, options);
  },

  url(value: string | URL, options: ArtifactOptions = {}): ArtifactInput {
    return createArtifact("url", "url", value.toString(), options);
  },

  toolResult(value: unknown, options: ArtifactToolResultOptions): ArtifactInput {
    return createArtifact(
      "tool-result",
      "tool",
      value,
      {
        ...options,
        metadata: {
          ...options.metadata,
          toolName: options.toolName,
          ...(options.callId !== undefined ? { callId: options.callId } : {}),
        },
      },
      "application/json",
    );
  },
};

function createArtifact(
  kind: ArtifactKind,
  source: ArtifactSource,
  value: unknown,
  options: ArtifactOptions,
  defaultMediaType?: string,
): ArtifactInput {
  const mediaType = inferMediaType(value, {
    kind,
    ...(options.mediaType !== undefined ? { mediaType: options.mediaType } : {}),
    ...(defaultMediaType !== undefined ? { defaultMediaType } : {}),
  });
  const size = options.size ?? measureArtifactValue(value, kind);

  return {
    id: options.id ?? createArtifactId(kind),
    kind,
    source,
    value,
    privacy: options.privacy ?? "standard",
    ...(mediaType !== undefined ? { mediaType } : {}),
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.metadata !== undefined ? { metadata: options.metadata } : {}),
    ...(size !== undefined ? { size } : {}),
    ...(options.fingerprint !== undefined ? { fingerprint: options.fingerprint } : {}),
    ...(options.storage !== undefined ? { storage: options.storage } : {}),
  };
}

function createArtifactId(kind: ArtifactKind): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `artifact:${kind}:${crypto.randomUUID()}`;
  }

  return `artifact:${kind}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}
