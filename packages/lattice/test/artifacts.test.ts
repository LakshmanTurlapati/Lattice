import { describe, expect, it } from "vitest";

import { artifact } from "../src/artifacts/artifact.js";

describe("artifact constructors", () => {
  it("creates text artifacts with privacy and cheap size metadata", () => {
    expect(
      artifact.text("hello", {
        id: "artifact:text:test",
        privacy: "sensitive",
      }),
    ).toEqual({
      id: "artifact:text:test",
      kind: "text",
      source: "inline",
      mediaType: "text/plain",
      privacy: "sensitive",
      size: {
        characters: 5,
        bytes: 5,
      },
      value: "hello",
    });
  });

  it("creates JSON artifacts with JSON media and serialized size metadata", () => {
    const result = artifact.json({ ok: true });

    expect(result).toMatchObject({
      kind: "json",
      source: "inline",
      mediaType: "application/json",
      privacy: "standard",
      size: {
        characters: 11,
        bytes: 11,
      },
      value: {
        ok: true,
      },
    });
    expect(result.id).toMatch(/^artifact:json:/);
  });

  it("infers media types for path-like file, image, audio, and document artifacts", () => {
    expect(artifact.file("invoice.pdf")).toMatchObject({
      kind: "file",
      source: "file",
      mediaType: "application/pdf",
      privacy: "standard",
      value: "invoice.pdf",
    });
    expect(artifact.image("photo.jpg")).toMatchObject({
      kind: "image",
      source: "file",
      mediaType: "image/jpeg",
      privacy: "standard",
      value: "photo.jpg",
    });
    expect(artifact.audio("call.mp3")).toMatchObject({
      kind: "audio",
      source: "file",
      mediaType: "audio/mpeg",
      privacy: "standard",
      value: "call.mp3",
    });
    expect(artifact.document("manual.pdf")).toMatchObject({
      kind: "document",
      source: "file",
      mediaType: "application/pdf",
      privacy: "standard",
      value: "manual.pdf",
    });
  });

  it("normalizes URL artifacts to string values", () => {
    expect(artifact.url(new URL("https://example.test/a"))).toMatchObject({
      kind: "url",
      source: "url",
      privacy: "standard",
      value: "https://example.test/a",
    });
  });

  it("creates tool result artifacts with tool metadata", () => {
    expect(
      artifact.toolResult(
        { status: "ok" },
        {
          toolName: "lookup",
          callId: "call-1",
        },
      ),
    ).toMatchObject({
      kind: "tool-result",
      source: "tool",
      mediaType: "application/json",
      privacy: "standard",
      metadata: {
        toolName: "lookup",
        callId: "call-1",
      },
      value: {
        status: "ok",
      },
    });
  });
});
