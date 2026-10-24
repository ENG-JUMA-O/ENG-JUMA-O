import { normalizeKenyanPhone } from "../utils/phone.util.js";

const BASE_URL = (
  process.env.MOBITECH_SMS_BASE_URL ||
  "https://app.mobitechtechnologies.com"
).replace(/\/+$/, "");

export async function sendMobitechSms({ mobile, message }) {
  const apiKey = process.env.MOBITECH_SMS_API_KEY;
  const senderName = process.env.MOBITECH_SMS_SENDER_NAME;
  const serviceId = Number(process.env.MOBITECH_SMS_SERVICE_ID ?? 0);

  if (!apiKey || !senderName) {
    throw new Error("Mobitech SMS environment variables are missing");
  }

  if (!Number.isSafeInteger(serviceId) || serviceId < 0) {
    throw new Error("Invalid Mobitech service ID");
  }

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > 920
  ) {
    throw new Error("SMS message must contain 1–920 characters");
  }

  const recipient = normalizeKenyanPhone(mobile);

  let response;

  try {
    response = await fetch(`${BASE_URL}/sms/sendsms`, {
      method: "POST",
      headers: {
        h_api_key: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        mobile: recipient,
        sender_name: senderName,
        message: message.trim(),
        service_id: serviceId,
        response_type:
          process.env.MOBITECH_SMS_RESPONSE_TYPE || "json",
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (cause) {
    const error = new Error(
      cause.name === "TimeoutError" || cause.name === "AbortError"
        ? "Mobitech SMS request timed out"
        : "Unable to connect to Mobitech SMS service",
    );

    error.statusCode =
      cause.name === "TimeoutError" || cause.name === "AbortError"
        ? 504
        : 503;

    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      `Mobitech SMS request failed with HTTP ${response.status}`,
    );
    error.statusCode = 502;
    throw error;
  }

  let result;

  try {
    result = await response.json();
  } catch {
    const error = new Error("Mobitech returned invalid JSON");
    error.statusCode = 502;
    throw error;
  }

  const smsResult = Array.isArray(result) ? result[0] : result;

  if (String(smsResult?.status_code) !== "1000") {
    const error = new Error("Mobitech did not accept the SMS");
    error.statusCode = 502;
    throw error;
  }

  return smsResult;
}