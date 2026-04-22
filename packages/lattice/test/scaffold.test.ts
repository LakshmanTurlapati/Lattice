import { describe, expect, it } from "vitest";

import { latticeVersion } from "../src/index.js";

describe("lattice scaffold", () => {
  it("exports the scaffold version", () => {
    expect(latticeVersion).toBe("0.0.0");
  });
});
