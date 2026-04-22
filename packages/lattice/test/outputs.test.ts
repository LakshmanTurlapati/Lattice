import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

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
        generated: [
          {
            id: "artifact:file:generated",
            kind: "file",
            source: "generated",
          },
        ],
      },
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.isArray(result.outputs.evidence)).toBe(true);
      expect(Array.isArray(result.outputs.generated)).toBe(true);
    }
  });
});
