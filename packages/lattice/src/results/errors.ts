export interface ValidationIssue {
  readonly message: string;
  readonly path?: readonly (string | number | symbol)[];
}

export interface ValidationError {
  readonly kind: "validation";
  readonly message: string;
  readonly output?: string;
  readonly issues: readonly ValidationIssue[];
}

export interface ExecutionUnavailableError {
  readonly kind: "execution_unavailable";
  readonly message: string;
}

export type LatticeRunError = ValidationError | ExecutionUnavailableError;
