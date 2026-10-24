
import { normalizeKenyanPhone } from "../utils/phone.util.js";

const BASE_URL = (
  process.env.MOBITECH_SMS_BASE_URL ||
  "https://app.mobitechtechnologies.com"
).replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_SMS_LENGTH = 920;

function createError(message, statusCode = 502, cause) {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (cause) {
    error.cause = cause;
  }

  return error;
}

function parseProviderResponse(result) {
  if (Array.isArray(result)) {
    return result[0] ?? null;
  }

  return result && typeof result === "object" ? result : null;
}

export async function sendMobitechSms({ mobile, message }) {
  const apiKey = process.env.MOBITECH_SMS_API_KEY?.trim();
  const senderName = process.env.MOBITECH_SMS_SENDER_NAME?.trim();
  const serviceId = Number(
    process.env.MOBITECH_SMS_SERVICE_ID ?? 0,
  );
  const responseType =
    process.env.MOBITECH_SMS_RESPONSE_TYPE?.trim() || "json";

  // Validate configuration.
  if (!apiKey || !senderName) {
    throw createError(
      "Mobitech SMS environment variables are missing",
      500,
    );
  }

  if (!Number.isSafeInteger(serviceId) || serviceId < 0) {
    throw createError("Invalid Mobitech service ID", 500);
  }

  if (!["json", "plain"].includes(responseType)) {
    throw createError(
      'MOBITECH_SMS_RESPONSE_TYPE must be "json" or "plain"',
      500,
    );
  }

  // Validate message.
  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > MAX_SMS_LENGTH
  ) {
    throw createError(
      `SMS message must contain 1–${MAX_SMS_LENGTH} characters`,
      400,
    );
  }

  // Normalize and validate the recipient using your existing utility.
  let recipient;

  try {
    recipient = normalizeKenyanPhone(mobile);
  } catch (cause) {
    throw createError(
      "Invalid Kenyan mobile number",
      400,
      cause,
    );
  }

  if (!recipient) {
    throw createError("Invalid Kenyan mobile number", 400);
  }

  const url = `${BASE_URL}/sms/sendsms`;

  let response;

  try {
    response = await fetch(url, {
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
        response_type: responseType,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    const isTimeout =
      cause?.name === "TimeoutError" ||
      cause?.name === "AbortError";

    console.error("Mobitech connection failed", {
      recipient,
      reason: isTimeout ? "timeout" : "connection_error",
    });

    throw createError(
      isTimeout
        ? "Mobitech SMS request timed out"
        : "Unable to connect to Mobitech SMS service",
      isTimeout ? 504 : 503,
      cause,
    );
  }

  const responseText = await response.text();
  let parsedResponse;

  try {
    parsedResponse = JSON.parse(responseText);
  } catch {
    console.error("Mobitech returned an invalid response", {
      httpStatus: response.status,
      responsePreview: responseText.slice(0, 200),
    });

    throw createError("Mobitech returned invalid JSON");
  }

  const smsResult = parseProviderResponse(parsedResponse);

  if (!response.ok) {
    console.error("Mobitech HTTP request rejected", {
      httpStatus: response.status,
      providerCode: smsResult?.status_code ?? null,
      providerDescription: smsResult?.status_desc ?? null,
    });

    throw createError(
      `Mobitech SMS request failed with HTTP ${response.status}`,
    );
  }

  if (!smsResult) {
    console.error("Mobitech returned an empty response", {
      httpStatus: response.status,
    });

    throw createError("Mobitech returned an empty response");
  }

  const providerCode = String(smsResult.status_code ?? "");

  if (providerCode !== "1000") {
    console.error("Mobitech rejected SMS", {
      providerCode,
      providerDescription: smsResult.status_desc ?? null,
      messageId: smsResult.message_id ?? null,
      recipient: smsResult.mobile_number ?? recipient,
      serviceId,
      senderName,
    });

    throw createError(
      `Mobitech rejected SMS: ${
        smsResult.status_desc ||
        smsResult.message ||
        providerCode ||
        "Unknown provider error"
      }`,
    );
  }

  // Acceptance is not confirmation of final delivery.
  console.log("Mobitech SMS accepted", {
    providerCode,
    providerDescription: smsResult.status_desc ?? null,
    messageId: smsResult.message_id ?? null,
    mobile: smsResult.mobile_number ?? recipient,
    networkId: smsResult.network_id ?? null,
    messageCost: smsResult.message_cost ?? null,
  });

  return smsResult;
}
