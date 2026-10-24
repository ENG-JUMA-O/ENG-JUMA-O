
/**
 * @param {string} phone
 * @returns {string} Normalized phone number
 * @throws {TypeError} If the input is not a string
 * @throws {Error} If the number is invalid
 */
export const normalizeKenyanPhone = (phone) => {
  if (typeof phone !== "string") {
    throw new TypeError("Phone number must be a string");
  }

  // Remove whitespace around the number.
  let normalized = phone.trim();

  // Remove a leading international plus sign.
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  // Remove common formatting characters.
  normalized = normalized.replace(/[\s()-]/g, "");

  // Convert local Kenyan format to country-code format.
  if (/^0[17]\d{8}$/.test(normalized)) {
    normalized = `254${normalized.slice(1)}`;
  }

  // Validate the normalized number.
  if (!/^254[17]\d{8}$/.test(normalized)) {
    throw new Error(
      "Invalid Kenyan mobile number. Use 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, or 2541XXXXXXXX.",
    );
  }

  return normalized;
};
