import { TypeGuardsUtils } from "../type-guards.utils";

describe("TypeGuardsUtils", () => {
  describe("truncateStringByKB", () => {
    it("returns same string when within limit", () => {
      const input = "hello";
      const out = TypeGuardsUtils.truncateStringByKB(input, 1);
      expect(out).toBe("hello");
    });

    it("truncates long string respecting multibyte", () => {
      const input = "áéíóú".repeat(1000);
      const out = TypeGuardsUtils.truncateStringByKB(input, 1);
      expect(out.length).toBeLessThan(input.length);
      // should not include replacement characters
      expect(out).not.toMatch(/\uFFFD/);
    });
  });

  describe("getErrorMessage", () => {
    it("returns error.message truncated", () => {
      const err = new Error("x".repeat(5000));
      const msg = TypeGuardsUtils.getErrorMessage(err);
      expect(msg.length).toBeLessThan(5000);
      expect(typeof msg).toBe("string");
    });

    it("returns string as is", () => {
      expect(TypeGuardsUtils.getErrorMessage("oops")).toBe("oops");
    });

    it("returns unknown for non-error object", () => {
      expect(TypeGuardsUtils.getErrorMessage({})).toBe(
        "Unknown error occurred",
      );
      expect(TypeGuardsUtils.getErrorMessage(null)).toBe(
        "Unknown error occurred",
      );
    });
  });

  describe("getAllErrorToString", () => {
    it("stringifies Error via toString and truncates", () => {
      const err = new Error("boom" + "y".repeat(5000));
      const s = TypeGuardsUtils.getAllErrorToString(err);
      expect(typeof s).toBe("string");
      expect(s.length).toBeLessThan(6000);
    });

    it("stringifies arbitrary values", () => {
      expect(TypeGuardsUtils.getAllErrorToString(123)).toBe("123");
      expect(TypeGuardsUtils.getAllErrorToString({ a: 1 })).toContain(
        "[object Object]",
      );
    });
  });
});
