import type { ArtifactInput } from "../artifacts/artifact.js";
import type { ProviderAdapter, ProviderRunRequest, ProviderRunResponse } from "./provider.js";
import { defaultCapabilityForProvider } from "../routing/catalog.js";

export interface FakeProviderOptions {
  readonly id?: string;
  readonly modelId?: string;
  readonly response?:
    | ProviderRunResponse
    | ((request: ProviderRunRequest) => ProviderRunResponse | Promise<ProviderRunResponse>);
  readonly artifacts?: readonly ArtifactInput[];
}

export function createFakeProvider(options: FakeProviderOptions = {}): ProviderAdapter {
  const id = options.id ?? "fake";
  const modelId = options.modelId ?? `${id}:deterministic`;
  const capability = {
    ...defaultCapabilityForProvider(id),
    modelId,
    inputModalities: ["text", "json", "image", "audio", "document", "file", "url", "tool"] as const,
    outputModalities: ["text", "json"] as const,
    toolUse: true,
  };

  return {
    id,
    kind: "provider-adapter",
    capabilities: [capability],
    async execute(request) {
      if (typeof options.response === "function") {
        return options.response(request);
      }

      if (options.response !== undefined) {
        return options.response;
      }

      return {
        rawOutputs: Object.fromEntries(
          request.outputs.map((name) => [name, defaultOutputForName(name)]),
        ),
        ...(options.artifacts !== undefined ? { artifactRefs: options.artifacts } : {}),
      };
    },
  };
}

function defaultOutputForName(name: string): unknown {
  if (/action|json|data|decision/u.test(name)) {
    return {
      kind: "clarify",
      reason: "fake provider default structured response",
    };
  }

  if (/citations|evidence/u.test(name)) {
    return [];
  }

  if (/generated|artifacts/u.test(name)) {
    return [];
  }

  return `Fake response for ${name}.`;
}
