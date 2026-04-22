import type { ArtifactFingerprint } from "../artifacts/artifact.js";

const textEncoder = new TextEncoder();

export async function fingerprintArtifactValue(
  value: unknown,
): Promise<ArtifactFingerprint | undefined> {
  const bytes = await valueToBytes(value);

  if (bytes === undefined) {
    return undefined;
  }

  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(bytes));

  return {
    algorithm: "sha256",
    value: toHex(new Uint8Array(digest)),
  };
}

async function valueToBytes(value: unknown): Promise<Uint8Array | undefined> {
  if (typeof value === "string") {
    return textEncoder.encode(value);
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (isBlobLike(value)) {
    return new Uint8Array(await value.arrayBuffer());
  }

  const serialized = JSON.stringify(value);

  return serialized === undefined ? undefined : textEncoder.encode(serialized);
}

function isBlobLike(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);

  return copy.buffer as ArrayBuffer;
}
