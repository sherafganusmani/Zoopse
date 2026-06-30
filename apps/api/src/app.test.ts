import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("createApp", () => {
  it("creates the Express application", () => {
    expect(createApp()).toBeDefined();
  });
});
