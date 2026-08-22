# Analysis & Specification: UIDAI Verhoeff Checksum & Aadhaar Validation Hardening

**Target Subsystem**: Identity & Verification (`backend/lib/sanitization.ts`, `backend/lib/validation.schemas.ts`)  
**Milestone**: M1 — Core Security, Identity & Verification Hardening  
**Author**: Explorer M1-1  
**Date**: 2026-08-21

---

## 1. Executive Summary & Problem Statement

In the 19 Jharkhand Battalion NCC platform, cadets submit Form 1 enrollment applications requiring a 12-digit UIDAI Aadhaar number. Aadhaar numbers in India do not use the standard Luhn algorithm (mod 10) or weighted mod 11; they use the **Verhoeff algorithm** based on the dihedral group $D_5$ (symmetries of a regular pentagon).

### Current State Flaw

In `backend/lib/sanitization.ts` (lines 110–134), `sanitizeAadhaar` currently implements a custom weighted mod-11 checksum with multipliers `[2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4]`. Furthermore, `cadetEnrollmentSchema` in `backend/lib/validation.schemas.ts` (lines 233–236) only checks regex `/^\d{12}$/` and does not invoke any checksum validation.

**Impact**:

1. Genuine Aadhaar numbers issued by UIDAI fail `sanitizeAadhaar` and are falsely rejected.
2. Form 1 cadet submissions in `cadetEnrollmentSchema` accept fabricated 12-digit numbers without validating the Verhoeff check digit.
3. Transposition errors (e.g. swapping two adjacent digits during manual entry) go completely undetected at the schema layer.

---

## 2. Mathematical Foundation: Dihedral Group $D_5$ and Verhoeff Algorithm

The Verhoeff algorithm uses the dihedral group $D_5$ of order 10, which is the non-abelian group of symmetries of a regular pentagon. It operates on decimal digits $\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9\}$.

### 2.1 Multiplication Table $d$ ($10 \times 10$)

The Cayley multiplication table for $D_5$ represents the group operation $\circ$:

```typescript
export const VERHOEFF_D: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
```

### 2.2 Permutation Table $p$ ($8 \times 10$)

The permutation group uses powers of the permutation $\sigma = (0)(1 5 8 9 4 2 7 0)(3 6)$ with period 8:

```typescript
export const VERHOEFF_P: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
```

### 2.3 Inverse Table $inv$ ($10$)

Each element $x \in D_5$ has an inverse $x^{-1}$ such that $d[x][x^{-1}] = 0$:

```typescript
export const VERHOEFF_INV: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
```

### 2.4 Algorithmic Operations

- **Validation**:
  Given a number string $a_n a_{n-1} \dots a_1 a_0$ (where $a_0$ is the check digit at the rightmost position, 0-indexed from the right):
  $$c_0 = 0$$
  $$c_{i+1} = d[c_i][p[i \pmod 8][a_i]] \quad \text{for } i = 0, \dots, n$$
  The string is valid if and only if $c_{n+1} = 0$.

- **Check Digit Generation**:
  Given an $n$-digit payload $a_n a_{n-1} \dots a_1$ (without check digit):
  $$c_0 = 0$$
  $$c_{i+1} = d[c_i][p[(i + 1) \pmod 8][a_i]] \quad \text{for } i = 0, \dots, n-1$$
  $$\text{check\_digit} = inv[c_n]$$

- **Detection Guarantees**:
  - **100%** of all single-digit entry errors ($a \to b$).
  - **100%** of all adjacent transposition errors ($ab \to ba$).
  - **95.3%** of twin errors ($aa \to bb$).
  - **94.2%** of jump transpositions ($acb \to bca$).

---

## 3. Exact Implementation Specifications

### 3.1 Updates for `backend/lib/sanitization.ts`

Add `VERHOEFF_D`, `VERHOEFF_P`, `VERHOEFF_INV`, `generateVerhoeffCheckDigit`, `validateVerhoeff`, and replace `sanitizeAadhaar`:

```typescript
// ── UIDAI Verhoeff Checksum Tables ───────────────────────────────────

/**
 * Multiplication table for Dihedral group D5 (order 10)
 */
export const VERHOEFF_D: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

/**
 * Permutation table p for Verhoeff algorithm (period 8)
 */
export const VERHOEFF_P: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Inverse table in D5
 */
export const VERHOEFF_INV: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Generates the Verhoeff check digit for a given numeric payload string
 *
 * @param input - Numeric string without check digit (e.g. 11 digits for Aadhaar)
 * @returns 1-digit check digit string
 */
export function generateVerhoeffCheckDigit(input: string): string {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string of digits");
  }
  const cleaned = input.replace(/\D/g, "");
  if (cleaned.length === 0) {
    throw new Error("Input contains no valid digits");
  }

  let c = 0;
  const digits = cleaned.split("").reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digits[i]]];
  }
  return String(VERHOEFF_INV[c]);
}

/**
 * Validates a numeric string (including its check digit) using the Verhoeff algorithm
 *
 * @param input - Full numeric string including check digit
 * @returns true if the Verhoeff checksum evaluates to 0, false otherwise
 */
export function validateVerhoeff(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }
  const cleaned = input.replace(/\D/g, "");
  if (cleaned.length < 2 || !/^\d+$/.test(cleaned)) {
    return false;
  }

  let c = 0;
  const digits = cleaned.split("").reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }
  return c === 0;
}

/**
 * Validates and sanitizes Aadhaar numbers using the official UIDAI Verhoeff algorithm
 *
 * Requirements:
 * 1. Strips non-digit characters and whitespace
 * 2. Enforces exactly 12 digits in length
 * 3. Enforces UIDAI prefix rule (Aadhaar numbers do not begin with 0 or 1)
 * 4. Validates full 12-digit string against the Verhoeff D5 checksum
 *
 * @param input - Raw Aadhaar string input
 * @returns Cleaned 12-digit numeric string
 * @throws Error if input is non-string, not 12 digits, begins with 0 or 1, or fails Verhoeff checksum
 */
export function sanitizeAadhaar(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Aadhaar number must be a string");
  }

  const cleaned = input.replace(/\D/g, "");

  if (cleaned.length !== 12) {
    throw new Error("Aadhaar number must be exactly 12 digits");
  }

  if (cleaned.startsWith("0") || cleaned.startsWith("1")) {
    throw new Error("Invalid Aadhaar number: cannot start with 0 or 1");
  }

  if (!validateVerhoeff(cleaned)) {
    throw new Error("Invalid Aadhaar number checksum");
  }

  return cleaned;
}
```

---

### 3.2 Updates for `backend/lib/validation.schemas.ts`

1. **Import `validateVerhoeff`** at top of `backend/lib/validation.schemas.ts`:

   ```typescript
   import { validateVerhoeff } from "./sanitization.ts";
   ```

2. **Update `cadetEnrollmentSchema`** `aadhaarNumber` definition (lines 233–236):
   ```typescript
   // Identity Information
   aadhaarNumber: z
     .string()
     .transform((val) => val.replace(/\D/g, ""))
     .refine((val) => /^\d{12}$/.test(val), "Aadhaar number must be exactly 12 digits")
     .refine(
       (val) => !val.startsWith("0") && !val.startsWith("1"),
       "Aadhaar number cannot start with 0 or 1",
     )
     .refine(
       (val) => validateVerhoeff(val),
       "Invalid Aadhaar number: failed Verhoeff checksum validation",
     ),
   ```

---

## 4. Comprehensive Test Vectors Suite

Below is the verified test matrix of valid and invalid test vectors for automated test suites (`backend/tests/tier1-sanitization-ids.test.ts` or `multichannel.test.ts`).

### 4.1 Valid UIDAI Aadhaar Test Vectors

All 10 test vectors have been mathematically verified using the $D_5$ group operations.

| #   | 11-Digit Prefix | Check Digit ($inv[c]$) | Full 12-Digit Aadhaar | Formatted Input (Spaces) | Validates |
| --- | --------------- | ---------------------- | --------------------- | ------------------------ | --------- |
| 1   | `48291377654`   | `5`                    | `482913776545`        | `4829 1377 6545`         | `true`    |
| 2   | `99887766554`   | `8`                    | `998877665548`        | `9988 7766 5548`         | `true`    |
| 3   | `55123499887`   | `4`                    | `551234998874`        | `5512 3499 8874`         | `true`    |
| 4   | `20987654321`   | `2`                    | `209876543212`        | `2098 7654 3212`         | `true`    |
| 5   | `36758492013`   | `5`                    | `367584920135`        | `3675 8492 0135`         | `true`    |
| 6   | `91234567890`   | `5`                    | `912345678905`        | `9123 4567 8905`         | `true`    |
| 7   | `28475916302`   | `2`                    | `284759163022`        | `2847 5916 3022`         | `true`    |
| 8   | `50000000000`   | `6`                    | `500000000006`        | `5000 0000 0006`         | `true`    |
| 9   | `78901234567`   | `4`                    | `789012345674`        | `7890 1234 5674`         | `true`    |
| 10  | `23456789012`   | `4`                    | `234567890124`        | `2345 6789 0124`         | `true`    |

### 4.2 Invalid Test Vectors (Corrupted Check Digit)

Mutating the check digit of a valid Aadhaar number fails validation 100% of the time:

| Base Valid Aadhaar | Corrupted Input | Rejection Reason                                             |
| ------------------ | --------------- | ------------------------------------------------------------ |
| `482913776545`     | `482913776541`  | Check digit mutated from `5` to `1` (legacy mod-11 artifact) |
| `482913776545`     | `482913776540`  | Check digit mutated from `5` to `0`                          |
| `998877665548`     | `998877665544`  | Check digit mutated from `8` to `4`                          |
| `551234998874`     | `551234998877`  | Check digit mutated from `4` to `7`                          |

### 4.3 Invalid Test Vectors (Transposition Errors)

Swapping adjacent digits or check digit transpositions:

| Base Valid Aadhaar | Transposed Input | Transposition Type                       | Rejection Reason             |
| ------------------ | ---------------- | ---------------------------------------- | ---------------------------- |
| `482913776545`     | `482913776455`   | Adjacent swap `54` $\to$ `45`            | Failed Verhoeff ($c \neq 0$) |
| `482913776545`     | `842913776545`   | Leading swap `48` $\to$ `84`             | Failed Verhoeff ($c \neq 0$) |
| `482913776545`     | `482931776545`   | Interior swap `13` $\to$ `31`            | Failed Verhoeff ($c \neq 0$) |
| `482913776545`     | `482913776554`   | Check digit swap `45` $\to$ `54`         | Failed Verhoeff ($c \neq 0$) |
| `482913776545`     | `482913775645`   | Jump transposition `76545` $\to$ `75645` | Failed Verhoeff ($c \neq 0$) |

### 4.4 Structural / Boundary Errors

| Input                | Error Category             | Expected Behavior                       |
| -------------------- | -------------------------- | --------------------------------------- |
| `000000000000`       | All zeros / Invalid Prefix | Rejects: Starts with 0 & fails Verhoeff |
| `111111111111`       | All ones / Invalid Prefix  | Rejects: Starts with 1 & fails Verhoeff |
| `48291377654`        | Underflow (11 digits)      | Rejects: Length !== 12                  |
| `4829137765450`      | Overflow (13 digits)       | Rejects: Length !== 12                  |
| `""`                 | Empty string               | Rejects: Length !== 12                  |
| `4829-1377-654A`     | Non-digit characters       | Rejects: Cleaned length < 12            |
| `null` / `undefined` | Type Error                 | Rejects / Throws type error             |

---

## 5. Downstream Impact & Test Suite Compatibility

### 5.1 Test Fixture Alignment

When `cadetEnrollmentSchema` and `sanitizeAadhaar` are upgraded, existing test fixtures in `backend/tests/multichannel.test.ts` must use valid Verhoeff Aadhaar numbers:

- `backend/tests/multichannel.test.ts` line 61:
  - **Before**: `aadhaarNumber: "4829 1377 6541"` (failed check digit `1`)
  - **After**: `aadhaarNumber: "4829 1377 6545"` (valid check digit `5`)
- `backend/tests/multichannel.test.ts` line 91:
  - **Before**: `aadhaarNumber: "551234998877"` (failed check digit `7`)
  - **After**: `aadhaarNumber: "551234998874"` (valid check digit `4`)

### 5.2 Unit Test Specification for Tier 1

In the upcoming M4 / Tier 1 test suite (`backend/tests/tier1-sanitization-ids.test.ts`), a dedicated `describe("Verhoeff Algorithm & Aadhaar Checksum Hardening")` suite should test:

1. `generateVerhoeffCheckDigit` against all 10 sample prefixes.
2. `validateVerhoeff` returning `true` for valid 12-digit numbers and `false` for mutated digits.
3. 100% single-digit error detection across all 12 positions (108 permutations).
4. 100% adjacent transposition detection across all 11 adjacent pairs.
5. `sanitizeAadhaar` throwing descriptive errors for `<12` digits, starting with `0`/`1`, and invalid checksums.
6. `cadetEnrollmentSchema` parsing valid Aadhaar numbers (with and without spaces) and rejecting invalid checksums.

---

## 6. Implementation Readiness Checklist

| Item | Requirement                                                  | Status                 |
| ---- | ------------------------------------------------------------ | ---------------------- |
| 1    | Table `VERHOEFF_D` (10x10) defined                           | ✅ Specified           |
| 2    | Table `VERHOEFF_P` (8x10) defined                            | ✅ Specified           |
| 3    | Table `VERHOEFF_INV` (10) defined                            | ✅ Specified           |
| 4    | `generateVerhoeffCheckDigit(input: string): string` exported | ✅ Specified           |
| 5    | `validateVerhoeff(input: string): boolean` exported          | ✅ Specified           |
| 6    | `sanitizeAadhaar(input: string): string` updated             | ✅ Specified           |
| 7    | `cadetEnrollmentSchema` updated with Verhoeff refinement     | ✅ Specified           |
| 8    | Test vectors verified against mathematical model             | ✅ Verified in Node.js |
| 9    | Dependent test fixtures identified                           | ✅ Cataloged           |
