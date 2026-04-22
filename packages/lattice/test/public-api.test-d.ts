import { assertType, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { artifact, createAI, output, type RunResult } from "../src/index.js";

test("source public API infers named run outputs", async () => {
  const ai = createAI();
  const session = ai.session("support-case-1");
  expectTypeOf(session.id).toEqualTypeOf<string>();
  expectTypeOf(session.kind).toEqualTypeOf<"session-ref" | undefined>();

  const schema = z.object({
    kind: z.literal("refund"),
    reason: z.string(),
  });
  const result = await ai.run({
    task: "Resolve case",
    session,
    artifacts: [artifact.text("support case")],
    outputs: {
      answer: "text",
      action: schema,
      evidence: output.citations(),
      generated: output.artifacts(),
    },
  });

  assertType<
    RunResult<{
      answer: "text";
      action: typeof schema;
      evidence: ReturnType<typeof output.citations>;
      generated: ReturnType<typeof output.artifacts>;
    }>
  >(result);

  if (result.ok) {
    expectTypeOf(result.outputs.answer).toEqualTypeOf<string>();
    expectTypeOf(result.outputs.action).toEqualTypeOf<{
      kind: "refund";
      reason: string;
    }>();
  }
});
