
/**
 * Normalize a Kenyan mobile number to 254XXXXXXXXX.
 *
 * Accepted examples:
 * 0712345678
 * 0112345678
 * +254712345678
 * 254112345678
 *
 * @param {string} phone
 * @returns {string}
 * @throws {TypeError} If phone is not a string.
 * @throws {Error} If phone is empty or invalid.
 */
export const normalizeKenyanPhone = (phone) => {
  if (typeof phone !== "string") {
    throw new TypeError("Phone number must be a string.");
  }

  let normalized = phone.trim();

  if (!normalized) {
    throw new Error("Phone number is required.");
  }

  // Remove common formatting characters.
  normalized = normalized.replace(/[\s()-]/g, "");

  // Remove one optional leading plus sign.
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  // Convert local format to international format.
  if (/^0[17]\d{8}$/.test(normalized)) {
    normalized = `254${normalized.slice(1)}`;
  }

  if (!/^254[17]\d{8}$/.test(normalized)) {
    throw new Error(
      "Invalid Kenyan mobile number. Use 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, or +2541XXXXXXXX."
    );
  }

  return normalized;
};
