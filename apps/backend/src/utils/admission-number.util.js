
import { randomInt } from "node:crypto";

const INSTITUTION_CODE = "NIT";
const DEFAULT_PROGRAM_CODE = "FSD";

/**
 * Generate an admission number with a cryptographically
 * secure random sequence from 001 to 10000.
 *
 * Example: NIT/FSD/20-26/0042
 */
export function generateAdmissionNumber({
  programCode = DEFAULT_PROGRAM_CODE,
  startYear,
  endYear,
} = {}) {
  if (typeof programCode !== "string") {
    throw new TypeError("Program code must be a string.");
  }

  const normalizedCode = programCode.trim().toUpperCase();

  if (!/^[A-Z0-9]{2,10}$/.test(normalizedCode)) {
    throw new TypeError(
      "Program code must contain 2–10 letters or numbers."
    );
  }

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    startYear < 2000 ||
    endYear < startYear ||
    endYear > 9999
  ) {
    throw new RangeError("Provide a valid academic-year range.");
  }

  // Crypto-secure random integer: 1 through 10000 inclusive.
  const sequence = randomInt(1, 10001);

  const formatYear = (year) =>
    String(year % 100).padStart(2, "0");

  const academicYear =
    `${formatYear(startYear)}-${formatYear(endYear)}`;

  // Minimum 3 digits; supports 001 through 10000.
  const serialNumber = String(sequence).padStart(3, "0");

  return `${INSTITUTION_CODE}/${normalizedCode}/${academicYear}/${serialNumber}`;
}
