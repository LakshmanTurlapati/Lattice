export interface ExecutionPlanStub {
  readonly id: string;
  readonly kind: "plan-stub";
  readonly createdAt: string;
  readonly status: "stub";
  readonly stages: readonly [];
  readonly warnings: readonly string[];
}

export function createExecutionPlanStub(
  warnings: readonly string[] = [],
): ExecutionPlanStub {
  return {
    id:
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `plan:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    kind: "plan-stub",
    createdAt: new Date().toISOString(),
    status: "stub",
    stages: [],
    warnings: [...warnings],
  };
}
