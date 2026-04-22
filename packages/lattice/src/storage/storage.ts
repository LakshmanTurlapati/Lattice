export interface StorageLike {
  readonly kind: "storage";
  readonly put?: (key: string, value: unknown) => Promise<void>;
  readonly get?: (key: string) => Promise<unknown>;
}
