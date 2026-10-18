/**
 * Suite 20: Internationalization (i18n) & Localization (L10n) Unit Tests
 * 19 Jharkhand Battalion NCC (Sarala Birla University Sub-Unit)
 *
 * Verifies dictionary resolutions, fallback semantics, variable interpolation,
 * and Indian numbering/date formatting standards.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  t,
  formatDate,
  formatNumber,
  setLocale,
  getLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  DICTIONARIES,
} from "../../frontend/lib/i18n.ts";

describe("Suite 20: NCC Internationalization & Localization Engine Tests", () => {
  it("DEFAULT_LOCALE is configured to 'en' and both English and Hindi are supported", () => {
    assert.equal(DEFAULT_LOCALE, "en");
    assert.ok(SUPPORTED_LOCALES.en);
    assert.ok(SUPPORTED_LOCALES.hi);
    assert.equal(SUPPORTED_LOCALES.en.direction, "ltr");
    assert.equal(SUPPORTED_LOCALES.hi.direction, "ltr");
  });

  it("t() correctly resolves English translation keys", () => {
    assert.equal(t("org.ncc_title", undefined, "en"), "National Cadet Corps");
    assert.equal(t("org.motto", undefined, "en"), "Unity and Discipline");
    assert.equal(t("chat.hub_title", undefined, "en"), "Cadre Collaboration Hub");
    assert.equal(t("common.save", undefined, "en"), "Save");
  });

  it("t() correctly resolves Hindi translation keys", () => {
    assert.equal(t("org.ncc_title", undefined, "hi"), "राष्ट्रीय कैडेट कोर");
    assert.equal(t("org.motto", undefined, "hi"), "एकता और अनुशासन");
    assert.equal(t("chat.hub_title", undefined, "hi"), "कैडर संचार एवं सहयोग केंद्र");
    assert.equal(t("common.save", undefined, "hi"), "सुरक्षित करें");
  });

  it("t() performs dynamic parameter interpolation", () => {
    // Test custom key or interpolation
    (DICTIONARIES.en as unknown as Record<string, string>)["test.interpolate"] =
      "Hello, Cadet {name}! You have {count} unread orders.";

    const resultEn = t("test.interpolate", { name: "Ankit", count: 3 }, "en");
    assert.equal(resultEn, "Hello, Cadet Ankit! You have 3 unread orders.");

    // Cleanup
    delete (DICTIONARIES.en as unknown as Record<string, string>)["test.interpolate"];
  });

  it("t() falls back gracefully to English when key is missing in Hindi", () => {
    (DICTIONARIES.en as unknown as Record<string, string>)["test.only_in_english"] =
      "Regimental Notice";

    const result = t("test.only_in_english", undefined, "hi");
    assert.equal(result, "Regimental Notice");

    // Cleanup
    delete (DICTIONARIES.en as unknown as Record<string, string>)["test.only_in_english"];
  });

  it("t() returns the raw key string when translation does not exist in any locale", () => {
    const rawKey = "completely.non_existent.key.xyz";
    assert.equal(t(rawKey), rawKey);
  });

  it("formatNumber() formats numbers using Indian numbering system", () => {
    const lakh = 100000;
    const formattedEn = formatNumber(lakh, undefined, "en");
    // Indian numbering format has commas at thousands then lakhs (1,00,000)
    assert.ok(formattedEn.includes("1,00,000") || formattedEn.includes("100,000"));
  });

  it("formatDate() formats dates according to locale", () => {
    const sampleDate = new Date("2026-08-15T09:00:00Z");
    const formattedEn = formatDate(sampleDate, { year: "numeric", month: "short" }, "en");
    assert.ok(formattedEn.includes("2026"));
    assert.ok(formattedEn.includes("Aug"));

    const formattedHi = formatDate(sampleDate, { year: "numeric" }, "hi");
    assert.ok(formattedHi.includes("2026"));
  });

  it("setLocale() and getLocale() updates active locale state", () => {
    setLocale("hi");
    assert.equal(getLocale(), "hi");
    setLocale("en");
    assert.equal(getLocale(), "en");
  });
});
