
import { randomInt } from "node:crypto";

const INSTITUTION_CODE = "NIT";
const STAFF_PREFIX = "STF";
const MAX_SEQUENCE = 10000;

/**
 * Generate a staff number.
 *
 * Examples:
 * NIT/STF/001
 * NIT/STF/057
 * NIT/STF/999
 * NIT/STF/1000
 * NIT/STF/10000
 *
 * IMPORTANT:
 * This generates a random number, not a sequential one.
 * Enforce uniqueness using the database unique constraint.
 */
export function generateStaffNumber() {
  const sequence = randomInt(1, MAX_SEQUENCE + 1);
  const serialNumber = String(sequence).padStart(3, "0");

  return `${INSTITUTION_CODE}/${STAFF_PREFIX}/${serialNumber}`;
}
