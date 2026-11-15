import { describe, it, expect } from "vitest";
import { resolveTemplate } from "../src/lib/template";

describe("resolveTemplate", () => {
  it("returns a static string unchanged when no variables are present", () => {
    expect(resolveTemplate("Hello, World!", {})).toBe("Hello, World!");
  });

  it("replaces a single variable", () => {
    expect(resolveTemplate("Hello, ${name}!", { name: "Alice" })).toBe("Hello, Alice!");
  });

  it("replaces multiple variables", () => {
    expect(
      resolveTemplate("Hello, ${name} from ${city}!", { name: "Alice", city: "NYC" })
    ).toBe("Hello, Alice from NYC!");
  });

  it("resolves unknown variables to empty strings", () => {
    expect(resolveTemplate("Hello, ${unknown}!", {})).toBe("Hello, !");
  });

  it("handles a mix of known and unknown variables", () => {
    expect(
      resolveTemplate("Hello, ${name} from ${city}!", { name: "Alice" })
    ).toBe("Hello, Alice from !");
  });

  it("replaces variables appearing multiple times", () => {
    expect(
      resolveTemplate("${x} and ${x} and ${x}", { x: "A" })
    ).toBe("A and A and A");
  });

  it("returns the same empty string when the template is empty", () => {
    expect(resolveTemplate("", { a: "b" })).toBe("");
  });

  it("replaces a template that is only a variable", () => {
    expect(resolveTemplate("${greeting}", { greeting: "Hi" })).toBe("Hi");
  });

  it("leaves dollar signs without braces unchanged", () => {
    expect(resolveTemplate("$name", { name: "Alice" })).toBe("$name");
  });

  it("leaves a dollar sign with an unclosed brace unchanged", () => {
    expect(resolveTemplate("Hello, ${name!", { name: "Alice" })).toBe("Hello, ${name!");
  });
});