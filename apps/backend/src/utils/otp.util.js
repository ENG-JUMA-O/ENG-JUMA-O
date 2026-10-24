
import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

const OTP_LENGTH = 6;
const DEFAULT_EXPIRY_MINUTES = 5;

/**
 * Generate a six-digit OTP.
 * Example: 123456
 *
 * Leading zeros are possible, e.g. 004821.
 * Keep OTPs as strings.
 */
export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

function getOtpSecret() {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "OTP_HASH_SECRET must contain at least 32 bytes."
    );
  }

  return secret;
}

/**
 * Hash a six-digit OTP for database storage.
 */
export function hashOtp(otp) {
  if (
    typeof otp !== "string" ||
    !new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)
  ) {
    throw new TypeError("OTP must contain exactly six digits.");
  }

  return createHmac("sha256", getOtpSecret())
    .update(otp, "utf8")
    .digest("hex");
}

/**
 * Compare a submitted OTP with its stored hash safely.
 */
export function verifyOtp(otp, storedHash) {
  if (
    typeof storedHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(storedHash)
  ) {
    return false;
  }

  let candidateHash;

  try {
    candidateHash = hashOtp(otp);
  } catch {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

/**
 * Create OTP data ready for storage and delivery.
 */
export function createOtp({
  expiryMinutes = DEFAULT_EXPIRY_MINUTES,
} = {}) {
  if (
    !Number.isInteger(expiryMinutes) ||
    expiryMinutes < 1 ||
    expiryMinutes > 30
  ) {
    throw new RangeError("Expiry must be between 1 and 30 minutes.");
  }

  const otp = generateOtp();

  return {
    otp,
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + expiryMinutes * 60_000),
  };
}
