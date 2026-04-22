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
  it("returns typed outputs for valid raw output maps", async () => {
    const plan = createExecutionPlanStub();
    const contracts = {
      answer: "text",
      action: z.object({
        count: z.number(),
      }),
    } as const;

    const result = await validateOutputMap(
      contracts,
      {
        answer: "done",
        action: { count: 2 },
      },
      plan,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.outputs.answer).toBe("done");
      expect(result.outputs.action.count).toBe(2);
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
      expect(result.error.output).toBe("answer");
    }
  });

  it("returns validation failure for invalid schema outputs", async () => {
    const result = await validateOutputMap(
      {
        action: z.object({
          count: z.number(),
        }),
      },
      {
        action: { count: "two" },
      },
      createExecutionPlanStub(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
      expect(result.error.output).toBe("action");
    }
  });
});
