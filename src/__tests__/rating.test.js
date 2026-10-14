import { describe, expect, it } from "vitest";
import { clampRating, formatRating, starFills } from "../utils/rating";

describe("nota em quartos de estrela", () => {
  it("pinta cada estrela pela parte da nota que cabe nela", () => {
    expect(starFills(3.75)).toEqual([1, 1, 1, 0.75, 0]);
    expect(starFills(0.25)).toEqual([0.25, 0, 0, 0, 0]);
    expect(starFills(null)).toEqual([0, 0, 0, 0, 0]);
  });

  it("arredonda para o quarto mais próximo entre 0,25 e 5", () => {
    expect(clampRating(3.8)).toBe(3.75);
    expect(clampRating(0)).toBe(0.25);
    expect(clampRating(6)).toBe(5);
  });

  it("escreve o número no formato do idioma", () => {
    expect(formatRating(3.75, "pt")).toBe("3,75");
    expect(formatRating(3.75, "en")).toBe("3.75");
    expect(formatRating(4, "pt")).toBe("4");
    expect(formatRating(null, "pt")).toBe("");
  });
});
