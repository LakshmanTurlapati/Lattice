import { expectType } from "tsd";
import { z } from "zod";

import { artifact, createAI, output } from "lattice";
import type { SessionRef } from "lattice";

const schema = z.object({
  kind: z.literal("refund"),
  reason: z.string(),
});

async function verifyPackageTypes(): Promise<void> {
  const ai = createAI();
  const session = ai.session("support-case-1");
  expectType<SessionRef>(session);

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

  if (result.ok) {
    expectType<string>(result.outputs.answer);
    expectType<string>(result.outputs.action.reason);
  }
}

void verifyPackageTypes;
