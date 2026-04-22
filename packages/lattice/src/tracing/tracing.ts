export interface TracerLike {
  readonly kind: "tracer";
  readonly span?: <T>(name: string, fn: () => T | Promise<T>) => T | Promise<T>;
}
