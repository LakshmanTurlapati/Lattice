import { describe, expect, it } from "vitest";

import { mergePolicy, type PolicySpec } from "../src/policy/policy.js";
import type {
  ProviderAdapter,
  ProviderRef,
} from "../src/providers/provider.js";

describe("phase 1 runtime contracts", () => {
  it("accepts opaque provider refs and adapters", async () => {
    const providerRef = {
      id: "fixture",
      kind: "provider-ref",
    } satisfies ProviderRef;

    const adapter = {
      id: "fixture-adapter",
      kind: "provider-adapter",
      execute: async (request) => {
        expect(request).toMatchObject({
          task: "Extract the answer",
          outputs: ["answer"],
        });

        return {
          rawOutputs: {
            answer: "ok",
          },
        };
      },
    } satisfies ProviderAdapter;

    await expect(
      adapter.execute?.({
        task: "Extract the answer",
        artifacts: [],
        outputs: ["answer"],
        policy: { maxCostUsd: 1 },
      }),
    ).resolves.toEqual({
      rawOutputs: {
        answer: "ok",
      },
    });

    expect(providerRef).toEqual({
      id: "fixture",
      kind: "provider-ref",
    });
  });

  it("shallow-merges policy defaults and run overrides", () => {
    const defaultPolicy: PolicySpec = {
      maxCostUsd: 10,
      latency: "interactive",
      privacy: "sensitive",
      providerAllowList: ["fixture"],
      providerDenyList: ["legacy"],
      noUpload: true,
      noPublicUrl: true,
      noLogging: false,
      metadata: {
        scope: "default",
      },
    };

    const runPolicy: PolicySpec = {
      maxCostUsd: 2,
      noLogging: true,
      metadata: {
        scope: "run",
      },
    };

    expect(mergePolicy(defaultPolicy, runPolicy)).toEqual({
      maxCostUsd: 2,
      latency: "interactive",
      privacy: "sensitive",
      providerAllowList: ["fixture"],
      providerDenyList: ["legacy"],
      noUpload: true,
      noPublicUrl: true,
      noLogging: true,
      metadata: {
        scope: "run",
      },
    });
    expect(mergePolicy()).toBeUndefined();
  });
});
