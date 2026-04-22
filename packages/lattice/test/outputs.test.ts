import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import { artifact } from "../src/artifacts/artifact.js";
import { output } from "../src/outputs/contracts.js";
import type {
  InferOutput,
  InferOutputMap,
} from "../src/outputs/infer.js";
import { validateOutputMap } from "../src/outputs/validate.js";
import { createExecutionPlanStub } from "../src/plan/plan.js";

describe("output contract inference", () => {
  it("infers text, schema, and named reference outputs", () => {
    const actionSchema = z.object({
      count: z.number(),
    });

    expectTypeOf<InferOutput<"text">>().toEqualTypeOf<string>();
    expectTypeOf<InferOutput<typeof actionSchema>>().toEqualTypeOf<{
      count: number;
    }>();

    expectTypeOf<
      InferOutputMap<{
        answer: "text";
        citations: ReturnType<typeof output.citations>;
      }>
    >().toEqualTypeOf<{
      readonly answer: string;
      readonly citations: readonly {
        readonly artifactId: string;
        readonly label?: string;
        readonly span?: {
          readonly start?: number;
          readonly end?: number;
        };
        readonly metadata?: Record<string, unknown>;
      }[];
    }>();
  });
});

describe("output validation boundary", () => {
  it("validates text and schema outputs", async () => {
    const plan = createExecutionPlanStub();
    const contracts = {
      answer: "text",
      action: z.object({
        kind: z.literal("refund"),
        reason: z.string(),
      }),
    } as const;

    const result = await validateOutputMap(
      contracts,
      {
        answer: "Approved",
        action: { kind: "refund", reason: "invoice mismatch" },
      },
      plan,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.outputs.answer).toBe("Approved");
      expect(result.outputs.action.kind).toBe("refund");
    }
  });

  it("returns validation failure for missing text outputs", async () => {
    const result = await validateOutputMap(
      { answer: "text" },
      {},
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
      if (result.error.kind === "validation") {
        expect(result.error.output).toBe("answer");
      }
    }
  });

  it("returns validation failure instead of throwing", async () => {
    const rawOutputs = {
      action: { kind: "replace" },
    };
    const result = await validateOutputMap(
      {
        action: z.object({
          kind: z.literal("refund"),
        }),
      },
      rawOutputs,
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
      if (result.error.kind === "validation") {
        expect(result.error.output).toBe("action");
      }
      expect(result.raw).toEqual(rawOutputs);
    }
  });

  it("accepts citations and generated artifact output arrays", async () => {
    const generated = artifact.file("receipt.txt", {
      id: "artifact:file:generated",
    });
    const result = await validateOutputMap(
      {
        answer: "text",
        evidence: output.citations(),
        generated: output.artifacts(),
      },
      {
        answer: "Approved",
        evidence: [
          {
            artifactId: "artifact:text:case",
            label: "case note",
          },
        ],
        generated: [generated],
      },
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.outputs.evidence)).toBe(true);
      expect(Array.isArray(result.outputs.generated)).toBe(true);
    }
  });

  it("strips payloads from valid generated artifact outputs", async () => {
    const generated = artifact.document("manual.pdf", {
      id: "artifact:document:manual",
      label: "manual",
      metadata: {
        pageCount: 12,
      },
    });

    const result = await validateOutputMap(
      {
        generated: output.artifacts({ artifactKind: "document" }),
      },
      {
        generated: [generated],
      },
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.outputs.generated).toEqual([
        {
          id: "artifact:document:manual",
          kind: "document",
          source: "file",
          privacy: "standard",
          mediaType: "application/pdf",
          label: "manual",
          metadata: {
            pageCount: 12,
          },
        },
      ]);
      expect(result.outputs.generated[0]).not.toHaveProperty("value");
    }
  });

  it("rejects invalid generated artifact output items", async () => {
    const result = await validateOutputMap(
      {
        generated: output.artifacts(),
      },
      {
        generated: [
          {
            id: "artifact:document:manual",
            kind: "document",
            source: "file",
          },
        ],
      },
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok && result.error.kind === "validation") {
      expect(result.error.output).toBe("generated");
      expect(result.error.issues).toEqual([
        {
          message: "Expected artifacts output item to be an artifact ref.",
        },
      ]);
    }
  });

  it("rejects generated artifact outputs with the wrong kind", async () => {
    const result = await validateOutputMap(
      {
        generated: output.artifacts({ artifactKind: "document" }),
      },
      {
        generated: [
          artifact.image("package.png", {
            id: "artifact:image:package",
          }),
        ],
      },
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok && result.error.kind === "validation") {
      expect(result.error.output).toBe("generated");
      expect(result.error.issues).toEqual([
        {
          message: 'Expected artifacts output item kind to be "document".',
        },
      ]);
    }
  });
});
