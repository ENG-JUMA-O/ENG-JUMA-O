
import axios from "axios";
import http from "node:http";
import https from "node:https";
import mobitechConfig from "../../config/mobitech.config.js";
import { normalizeKenyanPhone } from "../../utils/phone.util.js";

const SMS_ENDPOINT = "/sms/sendsms";
const SMS_TIMEOUT_MS = 15000;
const MAX_SMS_LENGTH = 920;
const LOG_PREFIX = "[MOBITECH SMS]";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Reuse TCP connections instead of opening a new connection for every SMS.
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
});

const smsClient = axios.create({
  timeout: SMS_TIMEOUT_MS,
  httpAgent,
  httpsAgent,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const createError = (message, statusCode, providerCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (providerCode != null) {
    error.providerCode = providerCode;
  }

  return error;
};

const getProviderResult = (data) =>
  Array.isArray(data) ? data[0] : data;

export const sendMobitechSms = async ({
  mobile,
  message,
  senderName,
}) => {
  const startedAt = Date.now();

  // Validate configuration.
  const serviceId = String(mobitechConfig.serviceId ?? "").trim();
  const apiKey = String(mobitechConfig.apiKey ?? "").trim();
  const baseUrl = String(mobitechConfig.baseUrl ?? "")
    .trim()
    .replace(/\/+$/, "");

  if (!apiKey || !baseUrl || !serviceId) {
    throw createError(
      "Mobitech API key, base URL, and service ID must be configured.",
      500,
    );
  }

  // Validate message.
  if (typeof message !== "string" || !message.trim()) {
    throw createError("SMS message is required.", 400);
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > MAX_SMS_LENGTH) {
    throw createError(
      `SMS message cannot exceed ${MAX_SMS_LENGTH} characters.`,
      400,
    );
  }

  // Normalize recipient.
  const normalizedMobile = normalizeKenyanPhone(mobile);
  const resolvedSenderName =
    senderName || mobitechConfig.senderName;

  if (!resolvedSenderName) {
    throw createError("Mobitech sender name is required.", 500);
  }

  const payload = {
    mobile: normalizedMobile,
    sender_name: resolvedSenderName,
    service_id: serviceId,
    response_type: mobitechConfig.responseType || "json",
    message: trimmedMessage,
  };

  try {
    const response = await smsClient.post(
      `${baseUrl}${SMS_ENDPOINT}`,
      payload,
      {
        headers: {
          h_api_key: apiKey,
        },
      },
    );

    const result = getProviderResult(response.data);

    if (!result || String(result.status_code) !== "1000") {
      const providerMessage =
        result?.status_desc ||
        result?.message ||
        "Mobitech rejected the SMS request.";

      if (!IS_PRODUCTION) {
        console.error(`${LOG_PREFIX} Provider rejected SMS`, {
          providerCode: result?.status_code ?? null,
          durationMs: Date.now() - startedAt,
        });
      }

      throw createError(
        providerMessage,
        502,
        result?.status_code,
      );
    }

    // One concise log per successful request in development.
    if (!IS_PRODUCTION) {
      console.log(`${LOG_PREFIX} SMS accepted`, {
        messageId: result.message_id ?? null,
        durationMs: Date.now() - startedAt,
      });
    }

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
    // Preserve errors generated from provider rejection.
    if (error.providerCode != null) {
      throw error;
    }

    const providerResult = getProviderResult(error.response?.data);
    const timedOut =
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT";

    const messageFromProvider =
      providerResult?.status_desc ||
      providerResult?.message;

    if (!IS_PRODUCTION) {
      console.error(`${LOG_PREFIX} Request failed`, {
        httpStatus: error.response?.status ?? null,
        providerCode: providerResult?.status_code ?? null,
        errorCode: error.code ?? null,
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    }

    // Preserve the actual provider response when available.
    throw createError(
      messageFromProvider ||
        (timedOut
          ? "Mobitech SMS request timed out."
          : "Unable to send SMS through Mobitech."),
      502,
      providerResult?.status_code,
    );
  }
};

export default sendMobitechSms;
