import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";

import { output } from "../src/outputs/contracts.js";
import type {
  InferOutput,
  InferOutputMap,
} from "../src/outputs/infer.js";

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
