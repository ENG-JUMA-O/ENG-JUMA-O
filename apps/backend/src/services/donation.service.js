
import axios from "axios";
import mobitechConfig from "../config/mobitech.config.js";
import { normalizeKenyanPhone } from "../utils/phone.util.js";

const SMS_ENDPOINT = "/sms/sendsms";
const SMS_TIMEOUT_MS = 15000;
const MAX_SMS_LENGTH = 920;

const LOG_PREFIX = "[MOBITECH SMS]";

export const sendMobitechSms = async ({
  mobile,
  message,
  senderName,
}) => {
  const startedAt = Date.now();

  console.log(`${LOG_PREFIX} Starting SMS request`, {
    timestamp: new Date().toISOString(),
    mobileProvided: Boolean(mobile),
    messageProvided: typeof message === "string" && Boolean(message.trim()),
    messageLength: typeof message === "string" ? message.trim().length : 0,
    senderNameProvided: Boolean(senderName || mobitechConfig.senderName),
  });

  // 1. Check configuration
  if (
    !mobitechConfig.apiKey ||
    !mobitechConfig.baseUrl ||
    !mobitechConfig.serviceId
  ) {
    console.error(`${LOG_PREFIX} Configuration missing`, {
      apiKeyConfigured: Boolean(mobitechConfig.apiKey),
      baseUrlConfigured: Boolean(mobitechConfig.baseUrl),
      serviceIdConfigured: Boolean(mobitechConfig.serviceId),
    });

    const error = new Error(
      "Mobitech API key, base URL, and service ID must be configured.",
    );
    error.statusCode = 500;
    throw error;
  }

  console.log(`${LOG_PREFIX} Configuration check passed`);

  // 2. Validate message
  if (typeof message !== "string" || !message.trim()) {
    console.error(`${LOG_PREFIX} Invalid SMS message`, {
      reason: "Message is missing or empty",
    });

    const error = new Error("SMS message is required.");
    error.statusCode = 400;
    throw error;
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > MAX_SMS_LENGTH) {
    console.error(`${LOG_PREFIX} SMS message too long`, {
      actualLength: trimmedMessage.length,
      maximumLength: MAX_SMS_LENGTH,
    });

    const error = new Error(
      `SMS message cannot exceed ${MAX_SMS_LENGTH} characters.`,
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Normalize recipient phone number
  let normalizedMobile;

  try {
    normalizedMobile = normalizeKenyanPhone(mobile);

    console.log(`${LOG_PREFIX} Phone number validated`, {
      valid: true,
      // Do not print the full phone number in production logs.
      recipientSuffix: normalizedMobile.slice(-3),
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Phone number validation failed`, {
      message: error.message,
    });

    throw error;
  }

  // 4. Prepare request
  const payload = {
    mobile: normalizedMobile,
    sender_name: senderName || mobitechConfig.senderName,
    service_id: mobitechConfig.serviceId,
    response_type: mobitechConfig.responseType,
    message: trimmedMessage,
  };

  const baseUrl = mobitechConfig.baseUrl.replace(/\/+$/, "");
  const requestUrl = `${baseUrl}${SMS_ENDPOINT}`;

  console.log(`${LOG_PREFIX} Sending request to provider`, {
    endpoint: `${baseUrl}${SMS_ENDPOINT}`,
    timeoutMs: SMS_TIMEOUT_MS,
    serviceIdConfigured: Boolean(mobitechConfig.serviceId),
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await axios.post(requestUrl, payload, {
      headers: {
        h_api_key: mobitechConfig.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: SMS_TIMEOUT_MS,
    });

    console.log(`${LOG_PREFIX} HTTP response received`, {
      httpStatus: response.status,
      durationMs: Date.now() - startedAt,
      responseType: Array.isArray(response.data)
        ? "array"
        : typeof response.data,
    });

    const result = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    console.log(`${LOG_PREFIX} Provider result`, {
      providerCode: result?.status_code ?? null,
      providerMessage: result?.status_desc ?? result?.message ?? null,
      messageId: result?.message_id ?? null,
      messageCost: result?.message_cost ?? null,
      creditBalance: result?.credit_balance ?? null,
    });

    if (String(result?.status_code) !== "1000") {
      const error = new Error(
        result?.status_desc || "Mobitech rejected the SMS request.",
      );

      error.statusCode = 502;
      error.providerCode = result?.status_code;

      console.error(`${LOG_PREFIX} Provider rejected SMS`, {
        providerCode: result?.status_code ?? null,
        providerMessage: result?.status_desc ?? null,
        durationMs: Date.now() - startedAt,
      });

      throw error;
    }

    console.log(`${LOG_PREFIX} SMS request accepted`, {
      messageId: result.message_id ?? null,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: result.status_desc || "SMS request accepted.",
      messageId: result.message_id,
      mobile: result.mobile_number || normalizedMobile,
      networkId: result.network_id,
      messageCost: result.message_cost,
      creditBalance: result.credit_balance,
    };
  } catch (error) {
    if (error.providerCode !== undefined && error.providerCode !== null) {
      throw error;
    }

    const providerData = Array.isArray(error.response?.data)
      ? error.response.data[0]
      : error.response?.data;

    console.error(`${LOG_PREFIX} SMS request failed`, {
      httpStatus: error.response?.status ?? null,
      providerCode: providerData?.status_code ?? null,
      providerMessage:
        providerData?.status_desc ?? providerData?.message ?? null,
      errorCode: error.code ?? null,
      errorName: error.name,
      errorMessage: error.message,
      timedOut:
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT",
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });

    const apiError = new Error(
      providerData?.status_desc ||
        providerData?.message ||
        (error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT"
          ? "Mobitech SMS request timed out."
          : "Unable to send SMS through Mobitech."),
    );

    apiError.statusCode = 502;
    apiError.providerCode = providerData?.status_code;
    throw apiError;
  }
};

export default sendMobitechSms;
