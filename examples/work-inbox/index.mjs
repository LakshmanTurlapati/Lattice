import { readFile } from "node:fs/promises";

import {
  artifact,
  createAI,
  createFakeProvider,
  createMemorySessionStore,
  createReplayEnvelope,
  output,
  replayOffline,
} from "../../packages/lattice/dist/index.js";

const actionSchema = {
  "~standard": {
    version: 1,
    vendor: "work-inbox-fixture",
    validate(value) {
      const valid =
        typeof value === "object" &&
        value !== null &&
        ["refund", "replace", "escalate", "clarify"].includes(value.kind) &&
        typeof value.reason === "string" &&
        ["normal", "urgent"].includes(value.priority);

      return valid
        ? { value }
        : { issues: [{ message: "Expected a work-inbox action object." }] };
    },
  },
};

const sessionStore = createMemorySessionStore();
const ai = createAI({
  sessions: sessionStore,
  providers: [
    createFakeProvider({
      id: "work-inbox-fixture",
      response: {
        rawOutputs: {
          answer:
            "Approve a replacement and escalate billing review because the package photo and policy excerpt conflict.",
          action: {
            kind: "replace",
            reason: "Photo evidence shows damage while the policy excerpt allows replacement before refund.",
            priority: "normal",
          },
          evidence: [
            { artifactId: "artifact:text:message", label: "customer message" },
            { artifactId: "artifact:image:package-photo", label: "visual evidence" },
            { artifactId: "artifact:document:return-policy", label: "policy excerpt" },
          ],
          generated: [],
        },
      },
    }),
  ],
});

const artifacts = [
  artifact.text(await readFixture("message.txt"), {
    id: "artifact:text:message",
    label: "Customer message",
  }),
  artifact.image("examples/work-inbox/fixtures/package-photo.txt", {
    id: "artifact:image:package-photo",
    label: "Package photo fixture",
    mediaType: "image/png",
  }),
  artifact.audio("examples/work-inbox/fixtures/call-transcript.txt", {
    id: "artifact:audio:call-transcript",
    label: "Call recording transcript fixture",
    mediaType: "text/plain",
    privacy: "sensitive",
  }),
  artifact.document("examples/work-inbox/fixtures/return-policy.pdf.txt", {
    id: "artifact:document:return-policy",
    label: "Return policy PDF text fixture",
    mediaType: "application/pdf",
  }),
];

const intent = {
  task: "Resolve this work-inbox case. Return a concise answer and an action object.",
  session: ai.session("showcase-case-1"),
  artifacts,
  outputs: {
    answer: "text",
    action: actionSchema,
    evidence: output.citations(),
    generated: output.artifacts(),
  },
  policy: {
    privacy: "sensitive",
    maxCostUsd: 0.01,
    noLogging: true,
  },
};

const plan = await ai.plan(intent);
console.log("Selected route:", plan.route.selected);
console.log("Context pack:", plan.context);
console.log("Packaging warnings:", plan.providerPackaging?.warnings ?? []);

const result = await ai.run(intent);
console.log("Run result:", JSON.stringify(result, null, 2));

if (result.ok) {
  const replay = createReplayEnvelope(result);
  const offline = await replayOffline(replay);
  console.log("Offline replay:", JSON.stringify(offline.outputs, null, 2));
}

async function readFixture(name) {
  return readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
}
