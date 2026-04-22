import type { ArtifactInput, ArtifactRef } from "../artifacts/artifact.js";
import { artifact, toArtifactRef } from "../artifacts/artifact.js";
import type { PolicySpec } from "../policy/policy.js";
import type {
  ProviderPackagedArtifactPlan,
  ProviderPackagingPlan,
  SelectedRoute,
} from "../plan/plan.js";
import type { ProviderTransportMode } from "./provider.js";

export interface ProviderPackagingResult {
  readonly plan: ProviderPackagingPlan;
  readonly packagedArtifacts: readonly ArtifactRef[];
  readonly blocked: readonly string[];
}

export function packageArtifactsForProvider(input: {
  readonly artifacts: readonly ArtifactInput[];
  readonly route?: SelectedRoute;
  readonly policy?: PolicySpec;
}): ProviderPackagingResult {
  const route = input.route;

  if (route === undefined) {
    return {
      plan: {
        providerId: "none",
        modelId: "none",
        artifacts: [],
        warnings: ["No selected route; provider packaging skipped."],
      },
      packagedArtifacts: [],
      blocked: [],
    };
  }

  const packaged: ProviderPackagedArtifactPlan[] = [];
  const packagedArtifacts: ArtifactRef[] = [];
  const warnings: string[] = [];
  const blocked: string[] = [];

  for (const inputArtifact of input.artifacts) {
    const choice = chooseTransport(inputArtifact, route.fileTransport, input.policy);

    if (choice.blocked !== undefined) {
      blocked.push(choice.blocked);
      warnings.push(choice.blocked);
      continue;
    }

    packaged.push({
      artifactId: inputArtifact.id,
      transport: choice.transport,
      ...(inputArtifact.mediaType !== undefined ? { mediaType: inputArtifact.mediaType } : {}),
      lineageTransform: "provider-packaging",
      warnings: choice.warnings,
    });

    packagedArtifacts.push(
      toArtifactRef(
        artifact.derive({
          id: `${inputArtifact.id}:packaged:${route.providerId}:${route.modelId}`,
          kind: inputArtifact.kind,
          source: choice.transport === "provider-upload" ? "provider-upload" : "generated",
          parents: [inputArtifact],
          transform: {
            kind: "provider-packaging",
            name: `${route.providerId}:${choice.transport}`,
            metadata: {
              providerId: route.providerId,
              modelId: route.modelId,
              transport: choice.transport,
            },
          },
          metadata: {
            providerId: route.providerId,
            modelId: route.modelId,
            transport: choice.transport,
          },
          ...(inputArtifact.mediaType !== undefined ? { mediaType: inputArtifact.mediaType } : {}),
          privacy: inputArtifact.privacy,
        }),
      ),
    );
  }

  return {
    plan: {
      providerId: route.providerId,
      modelId: route.modelId,
      artifacts: packaged,
      warnings,
    },
    packagedArtifacts,
    blocked,
  };
}

function chooseTransport(
  inputArtifact: ArtifactInput,
  supported: readonly ProviderTransportMode[],
  policy?: PolicySpec,
): {
  readonly transport: ProviderTransportMode;
  readonly warnings: readonly string[];
  readonly blocked?: string;
} {
  const warnings: string[] = [];
  const preferred = preferredTransports(inputArtifact);

  for (const transport of preferred) {
    if (!supported.includes(transport)) {
      continue;
    }

    if (policy?.noUpload === true && transport === "provider-upload") {
      continue;
    }

    if (policy?.noPublicUrl === true && transport === "url") {
      continue;
    }

    if (
      inputArtifact.privacy === "restricted" &&
      (transport === "provider-upload" || transport === "url" || transport === "base64")
    ) {
      continue;
    }

    if (transport === "base64") {
      warnings.push(`Artifact ${inputArtifact.id} will be encoded as base64.`);
    }

    return { transport, warnings };
  }

  return {
    transport: "inline",
    warnings,
    blocked: `No policy-safe transport for artifact ${inputArtifact.id}.`,
  };
}

function preferredTransports(inputArtifact: ArtifactInput): readonly ProviderTransportMode[] {
  switch (inputArtifact.kind) {
    case "text":
      return ["inline", "extracted-text"];
    case "json":
    case "tool-result":
      return ["json", "inline"];
    case "url":
      return ["url", "inline"];
    case "document":
      return ["extracted-text", "provider-upload", "base64", "url"];
    case "audio":
      return ["transcript", "provider-upload", "base64", "url"];
    case "image":
    case "file":
    case "video":
      return ["provider-upload", "base64", "url"];
  }
}
