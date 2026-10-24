
import { randomInt } from "node:crypto";

const INSTITUTION_PREFIX = "NIT";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generate a code in the format:
 * NIT000-XT
 * NIT001-VC
 *
 * The numeric section ranges from 000 to 999.
 * The suffix contains two random uppercase letters.
 *
 * IMPORTANT:
 * Random codes can collide. The database's @unique
 * constraint must remain enabled.
 */
export function generateCode() {
  const number = String(randomInt(0, 1000)).padStart(3, "0");

  const firstLetter = ALPHABET[randomInt(0, ALPHABET.length)];
  const secondLetter = ALPHABET[randomInt(0, ALPHABET.length)];

  return `${INSTITUTION_PREFIX}${number}-${firstLetter}${secondLetter}`;
}
