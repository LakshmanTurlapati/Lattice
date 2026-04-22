import { describe, expect, it } from "vitest";
import { z } from "zod";

import { artifact } from "../src/artifacts/artifact.js";
import { output } from "../src/outputs/contracts.js";
import type { PolicySpec } from "../src/policy/policy.js";
import type { ProviderAdapter } from "../src/providers/provider.js";
import { createAI } from "../src/runtime/create-ai.js";

describe("createAI runtime facade", () => {
  it("runs a fixture provider adapter and validates typed outputs", async () => {
    const supportCase = artifact.text("support case");
    const adapter = {
      id: "fixture",
      kind: "provider-adapter",
      execute: async (request) => {
        expect(request.task).toBe("Resolve support case");
        expect(request.artifacts).toEqual([supportCase]);
        expect(request.outputs).toEqual(["answer", "action", "evidence", "generated"]);
        expect(request.policy).toEqual({
          maxCostUsd: 2,
          latency: "interactive",
          noLogging: true,
        });

        return {
          rawOutputs: {
            answer: "Refund approved.",
            action: { kind: "refund", reason: "billing mismatch" },
            evidence: [{ artifactId: "artifact:text:case" }],
            generated: [
              {
                id: "artifact:file:receipt",
                kind: "file",
                source: "generated",
              },
            ],
          },
          artifactRefs: [
            {
              id: "artifact:file:receipt",
              kind: "file",
              source: "generated",
            },
          ],
        };
      },
    } satisfies ProviderAdapter;
    const ai = createAI({
      providers: [adapter],
      defaults: {
        policy: {
          maxCostUsd: 10,
          latency: "interactive",
          noLogging: false,
        },
      },
    });

    const result = await ai.run({
      task: "Resolve support case",
      artifacts: [supportCase],
      outputs: {
        answer: "text",
        action: z.object({
          kind: z.literal("refund"),
          reason: z.string(),
        }),
        evidence: output.citations(),
        generated: output.artifacts(),
      },
      policy: {
        maxCostUsd: 2,
        noLogging: true,
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.outputs.answer).toBe("Refund approved.");
      expect(result.outputs.action.reason).toBe("billing mismatch");
      expect(result.artifacts).toEqual([
        {
          id: "artifact:file:receipt",
          kind: "file",
          source: "generated",
        },
      ]);
      expect(result.plan.kind).toBe("plan-stub");
    }
  });

  it("returns validation failures instead of throwing", async () => {
    const adapter = {
      id: "fixture",
      kind: "provider-adapter",
      execute: async () => ({
        rawOutputs: {
          answer: 42,
        },
      }),
    } satisfies ProviderAdapter;
    const result = await createAI({ providers: [adapter] }).run({
      task: "Resolve support case",
      outputs: {
        answer: "text",
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
      expect(result.plan.kind).toBe("plan-stub");
    }
  });

  it("returns execution unavailable when no executable adapter is configured", async () => {
    const result = await createAI({ providers: ["fixture"] }).run({
      task: "Resolve support case",
      outputs: {
        answer: "text",
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("execution_unavailable");
      expect(result.error.message).toBe(
        "No Phase 1 provider adapter with execute() is configured.",
      );
    }
  });

  it("passes the merged policy and signal to the fixture adapter", async () => {
    const defaultPolicy = {
      maxCostUsd: 10,
      privacy: "sensitive",
      noUpload: true,
    } satisfies PolicySpec;
    const runPolicy = {
      maxCostUsd: 1,
      latency: "batch",
    } satisfies PolicySpec;
    const controller = new AbortController();
    const adapter = {
      id: "fixture",
      kind: "provider-adapter",
      execute: async (request) => {
        expect(request.policy).toEqual({
          maxCostUsd: 1,
          privacy: "sensitive",
          noUpload: true,
          latency: "batch",
        });
        expect(request.signal).toBe(controller.signal);

        return {
          rawOutputs: {
            answer: "ok",
          },
        };
      },
    } satisfies ProviderAdapter;

    const result = await createAI({
      providers: [adapter],
      defaults: {
        policy: defaultPolicy,
      },
    }).run({
      task: "Resolve support case",
      outputs: {
        answer: "text",
      },
      policy: runPolicy,
      signal: controller.signal,
    });

    expect(result.ok).toBe(true);
  });

  it("throws an abort error before provider execution when the signal is already aborted", async () => {
    let executed = false;
    const controller = new AbortController();
    controller.abort();
    const adapter = {
      id: "fixture",
      kind: "provider-adapter",
      execute: async () => {
        executed = true;
        return {
          rawOutputs: {
            answer: "ok",
          },
        };
      },
    } satisfies ProviderAdapter;

    await expect(
      createAI({ providers: [adapter] }).run({
        task: "Resolve support case",
        outputs: {
          answer: "text",
        },
        signal: controller.signal,
      }),
    ).rejects.toThrow(/Run aborted before execution/);
    expect(executed).toBe(false);
  });
});
