import assert from "node:assert";
import { describe, it } from "node:test";
import { sanitizeCssIdentifier, sanitizeCssValue } from "../../frontend/components/ui/chart.tsx";

describe("Chart Security Sanitization Unit Tests", () => {
  describe("sanitizeCssIdentifier", () => {
    it("preserves safe alphanumeric, hyphen, and underscore characters", () => {
      assert.strictEqual(sanitizeCssIdentifier("chart-123_abc"), "chart-123_abc");
    });

    it("strips HTML tags and quote characters from CSS identifiers", () => {
      const maliciousInput = "chart-123'\"><script>alert(1)</script>";
      assert.strictEqual(sanitizeCssIdentifier(maliciousInput), "chart-123scriptalert1script");
    });

    it("strips brackets, braces, and semicolons", () => {
      const maliciousInput = "chart[data=1];body{color:red}";
      assert.strictEqual(sanitizeCssIdentifier(maliciousInput), "chartdata1bodycolorred");
    });
  });

  describe("sanitizeCssValue", () => {
    it("preserves legitimate CSS colors and CSS variable references", () => {
      assert.strictEqual(sanitizeCssValue("#ff0000"), "#ff0000");
      assert.strictEqual(sanitizeCssValue("hsl(var(--chart-1))"), "hsl(var(--chart-1))");
      assert.strictEqual(sanitizeCssValue("oklch(0.546 0.215 262.9)"), "oklch(0.546 0.215 262.9)");
    });

    it("strips HTML closing style tags and script injection payloads", () => {
      const maliciousPayload = "</style><script>alert(1)</script>";
      assert.strictEqual(sanitizeCssValue(maliciousPayload), "/stylescriptalert(1)/script");
    });

    it("strips CSS rule breakout characters like semicolons and curly braces", () => {
      const maliciousPayload = "red; body { background: url('https://evil.com/xss') }";
      assert.strictEqual(
        sanitizeCssValue(maliciousPayload),
        "red body  background: https://evil.com/xss)",
      );
    });

    it("strips hazardous CSS function calls like url(), expression(), and javascript()", () => {
      const maliciousPayload = "red; background: url('https://attacker.com/cookie')";
      assert.strictEqual(
        sanitizeCssValue(maliciousPayload),
        "red background: https://attacker.com/cookie)",
      );
    });
  });
});
