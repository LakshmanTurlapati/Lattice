import { expectType } from "tsd";
import { z } from "zod";

import { artifact, createAI, output } from "lattice";

const schema = z.object({
  kind: z.literal("refund"),
  reason: z.string(),
});

async function verifyPackageTypes(): Promise<void> {
  const ai = createAI();
  const result = await ai.run({
    task: "Resolve case",
    artifacts: [artifact.text("support case")],
    outputs: {
      answer: "text",
      action: schema,
      evidence: output.citations(),
      generated: output.artifacts(),
    },
  });

  if (result.ok) {
    expectType<string>(result.outputs.answer);
    expectType<string>(result.outputs.action.reason);
  }
}

void verifyPackageTypes;
