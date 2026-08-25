import { describe, expect, it } from "vitest";
import { postScanDestination } from "./scanCompletion";

describe("postScanDestination", () => {
  it("keeps completed scans in the Command Center instead of opening an evidence drawer", () => {
    expect(postScanDestination()).toBe("/");
  });
});
