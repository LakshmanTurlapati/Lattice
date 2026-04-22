import type { StandardSchemaV1 } from "@standard-schema/spec";

import { artifact, type ArtifactInput, type ArtifactRef } from "../artifacts/artifact.js";
import { validateSchemaOutput } from "../outputs/validate.js";
import type { RunEventSink } from "../tracing/tracing.js";

export interface ToolExecutionContext {
  readonly signal?: AbortSignal;
  readonly emit?: RunEventSink;
}

export interface ToolDefinition<TSchema extends StandardSchemaV1 = StandardSchemaV1> {
  readonly kind: "tool";
  readonly name: string;
  readonly description?: string;
  readonly inputSchema: TSchema;
  readonly execute: (
    input: StandardSchemaV1.InferOutput<TSchema>,
    context: ToolExecutionContext,
  ) => Promise<unknown> | unknown;
}

export interface ToolCallResult {
  readonly callId: string;
  readonly toolName: string;
  readonly artifact: ArtifactInput;
}

export function defineTool<TSchema extends StandardSchemaV1>(
  definition: Omit<ToolDefinition<TSchema>, "kind">,
): ToolDefinition<TSchema> {
  return {
    kind: "tool",
    ...definition,
  };
}

export async function runTool<TSchema extends StandardSchemaV1>(
  tool: ToolDefinition<TSchema>,
  input: unknown,
  context: ToolExecutionContext = {},
): Promise<ToolCallResult> {
  const validation = await validateSchemaOutput(tool.name, tool.inputSchema, input);

  if (!validation.ok) {
    throw new Error(`Invalid input for tool "${tool.name}".`);
  }

  const callId = createToolCallId();
  const output = await tool.execute(validation.value, context);

  return {
    callId,
    toolName: tool.name,
    artifact: artifact.toolResult(output, {
      id: `artifact:tool-result:${tool.name}:${callId}`,
      toolName: tool.name,
      callId,
    }),
  };
}

export interface McpLikeClient {
  readonly listTools?: () => Promise<readonly McpToolDescriptor[]> | readonly McpToolDescriptor[];
  readonly callTool: (input: {
    readonly name: string;
    readonly arguments: unknown;
  }) => Promise<unknown> | unknown;
}

export interface McpToolDescriptor {
  readonly name: string;
  readonly description?: string;
  readonly inputSchema: StandardSchemaV1;
}

export async function importMcpTools(
  client: McpLikeClient,
  toolNames?: readonly string[],
): Promise<readonly ToolDefinition[]> {
  const descriptors = await Promise.resolve(client.listTools?.() ?? []);
  const allowed = toolNames === undefined ? undefined : new Set(toolNames);

  return descriptors
    .filter((descriptor) => allowed === undefined || allowed.has(descriptor.name))
    .map((descriptor) =>
      defineTool({
        name: descriptor.name,
        ...(descriptor.description !== undefined
          ? { description: descriptor.description }
          : {}),
        inputSchema: descriptor.inputSchema,
        execute: async (input) =>
          client.callTool({
            name: descriptor.name,
            arguments: input,
          }),
      }),
    );
}

export function toolArtifactRef(result: ToolCallResult): ArtifactRef {
  const { value: _value, ...ref } = result.artifact;

  return ref;
}

function createToolCallId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}:${Math.random().toString(16).slice(2)}`;
}
