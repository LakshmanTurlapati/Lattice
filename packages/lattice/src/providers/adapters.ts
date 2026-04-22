import type { UsageRecord } from "../plan/plan.js";
import type { ProviderAdapter, ProviderRunResponse } from "./provider.js";
import { defaultCapabilityForProvider } from "../routing/catalog.js";

export interface OpenAICompatibleProviderOptions {
  readonly id?: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly fetch?: typeof fetch;
}

export interface SdkLikeProviderOptions {
  readonly id?: string;
  readonly model: string;
  readonly generate: (input: {
    readonly task: string;
    readonly outputNames: readonly string[];
  }) => Promise<ProviderRunResponse> | ProviderRunResponse;
}

export function createOpenAICompatibleProvider(
  options: OpenAICompatibleProviderOptions,
): ProviderAdapter {
  const id = options.id ?? "openai-compatible";
  const fetchImpl = options.fetch ?? fetch;

  return {
    id,
    kind: "provider-adapter",
    capabilities: [
      {
        ...defaultCapabilityForProvider(id),
        modelId: options.model,
        fileTransport: ["inline", "json", "url", "base64", "extracted-text", "transcript"],
      },
    ],
    async execute(request) {
      const init: RequestInit = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.apiKey !== undefined ? { authorization: `Bearer ${options.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: options.model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: request.task,
                },
                {
                  type: "text",
                  text: JSON.stringify({
                    contextPack: request.contextPack === undefined
                      ? undefined
                      : {
                          id: request.contextPack.id,
                          tokenBudget: request.contextPack.tokenBudget,
                          estimatedTokens: request.contextPack.estimatedTokens,
                          included: request.contextPack.included,
                          summarized: request.contextPack.summarized,
                          archived: request.contextPack.archived,
                          omitted: request.contextPack.omitted,
                          warnings: request.contextPack.warnings,
                        },
                  }),
                },
                ...request.artifacts.map((inputArtifact) => ({
                  type: "text",
                  text: JSON.stringify({
                    artifactId: inputArtifact.id,
                    kind: inputArtifact.kind,
                    mediaType: inputArtifact.mediaType,
                    privacy: inputArtifact.privacy,
                    transport: request.providerPackaging?.artifacts.find(
                      (item) => item.artifactId === inputArtifact.id,
                    )?.transport ?? request.plan?.providerPackaging?.artifacts.find(
                      (item) => item.artifactId === inputArtifact.id,
                    )?.transport,
                    value:
                      typeof inputArtifact.value === "string" && inputArtifact.kind !== "url"
                        ? inputArtifact.value
                        : undefined,
                    url:
                      inputArtifact.kind === "url" && typeof inputArtifact.value === "string"
                        ? inputArtifact.value
                        : undefined,
                  }),
                })),
              ],
            },
          ],
        }),
        ...(request.signal !== undefined ? { signal: request.signal } : {}),
      };
      const response = await fetchImpl(`${options.baseUrl.replace(/\/$/u, "")}/chat/completions`, init);

      if (!response.ok) {
        throw new Error(`OpenAI-compatible provider failed with ${response.status}.`);
      }

      const body = await response.json() as {
        choices?: readonly { message?: { content?: unknown } }[];
        usage?: unknown;
      };
      const text = String(body.choices?.[0]?.message?.content ?? "");
      const usage = normalizeUsage(body.usage);

      return {
        rawOutputs: Object.fromEntries(request.outputs.map((name) => [name, text])),
        ...(usage !== undefined ? { usage } : {}),
        rawResponse: body,
      };
    },
  };
}

function normalizeUsage(usage: unknown): UsageRecord | undefined {
  if (typeof usage !== "object" || usage === null) {
    return undefined;
  }

  const record = usage as Record<string, unknown>;
  const inputTokens = numberField(record, "prompt_tokens") ?? numberField(record, "input_tokens");
  const outputTokens =
    numberField(record, "completion_tokens") ?? numberField(record, "output_tokens");
  const totalTokens = numberField(record, "total_tokens");

  return {
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
    ...(totalTokens !== undefined ? { totalTokens } : {}),
  };
}

function numberField(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];

  return typeof value === "number" ? value : undefined;
}

export function createOpenAIProvider(options: OpenAICompatibleProviderOptions): ProviderAdapter {
  return createOpenAICompatibleProvider({
    ...options,
    id: options.id ?? "openai",
    baseUrl: options.baseUrl,
  });
}

export function createAISdkProvider(options: SdkLikeProviderOptions): ProviderAdapter {
  const id = options.id ?? "ai-sdk";

  return {
    id,
    kind: "provider-adapter",
    capabilities: [
      {
        ...defaultCapabilityForProvider(id),
        modelId: options.model,
        toolUse: true,
        streaming: true,
      },
    ],
    execute: async (request) =>
      options.generate({
        task: request.task,
        outputNames: request.outputs,
      }),
  };
}
