
import axios from "axios";
import mobitechConfig from "../../config/mobitech.config.js";
import { normalizeKenyanPhone } from "../../utils/normalizeKenyanPhone.js";

const SMS_ENDPOINT = "/sms/sendsms";
const SMS_TIMEOUT_MS = 15000;
const MAX_SMS_LENGTH = 920;

export const sendMobitechSms = async ({
  mobile,
  message,
  senderName,
}) => {
  if (
    !mobitechConfig.apiKey ||
    !mobitechConfig.baseUrl ||
    !mobitechConfig.serviceId
  ) {
    const error = new Error(
      "Mobitech API key, base URL, and service ID must be configured.",
    );
    error.statusCode = 500;
    throw error;
  }

  if (typeof message !== "string" || !message.trim()) {
    const error = new Error("SMS message is required.");
    error.statusCode = 400;
    throw error;
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > MAX_SMS_LENGTH) {
    const error = new Error(
      `SMS message cannot exceed ${MAX_SMS_LENGTH} characters.`,
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedMobile = normalizeKenyanPhone(mobile);

  const payload = {
    mobile: normalizedMobile,
    sender_name: senderName || mobitechConfig.senderName,
    service_id: mobitechConfig.serviceId,
    response_type: mobitechConfig.responseType,
    message: trimmedMessage,
  };

  try {
    const baseUrl = mobitechConfig.baseUrl.replace(/\/+$/, "");

    const response = await axios.post(
      `${baseUrl}${SMS_ENDPOINT}`,
      payload,
      {
        headers: {
          h_api_key: mobitechConfig.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: SMS_TIMEOUT_MS,
      },
    );

    const result = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    if (String(result?.status_code) !== "1000") {
      const error = new Error(
        result?.status_desc || "Mobitech rejected the SMS request.",
      );

      error.statusCode = 502;
      error.providerCode = result?.status_code;
      throw error;
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
    if (error.providerCode) {
      throw error;
    }

    // Log diagnostic information only. Never log credentials or message text.
    console.error("Mobitech SMS request failed:", {
      httpStatus: error.response?.status,
      providerStatus: Array.isArray(error.response?.data)
        ? error.response.data[0]?.status_code
        : error.response?.data?.status_code,
      code: error.code,
      message: error.message,
    });

    const providerData = Array.isArray(error.response?.data)
      ? error.response.data[0]
      : error.response?.data;

    const apiError = new Error(
      providerData?.status_desc ||
        providerData?.message ||
        (error.code === "ECONNABORTED"
          ? "Mobitech SMS request timed out."
          : "Unable to send SMS through Mobitech."),
    );

    apiError.statusCode = 502;
    apiError.providerCode = providerData?.status_code;
    throw apiError;
  }
};

export default sendMobitechSms;
