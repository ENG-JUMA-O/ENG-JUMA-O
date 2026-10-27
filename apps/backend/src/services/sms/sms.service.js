
import axios from "axios";
import mobitechConfig from "../../config/mobitech.config.js";

const SMS_ENDPOINT = "/sms/sendsms";

export const sendMobitechSms = async ({ mobile, message, senderName }) => {
  if (!mobitechConfig.apiKey) {
    const error = new Error("Mobitech API key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (!mobile || typeof mobile !== "string") {
    const error = new Error("A valid mobile number is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    const error = new Error("SMS message is required.");
    error.statusCode = 400;
    throw error;
  }

  if (message.length > 920) {
    const error = new Error("SMS message cannot exceed 920 characters.");
    error.statusCode = 400;
    throw error;
  }

  const payload = {
    mobile: mobile.trim(),
    sender_name: senderName || mobitechConfig.senderName,
    service_id: mobitechConfig.serviceId,
    response_type: mobitechConfig.responseType,
    message: message.trim(),
  };

  try {
    const response = await axios.post(
      `${mobitechConfig.baseUrl.replace(/\/+$/, "")}${SMS_ENDPOINT}`,
      payload,
      {
        headers: {
          h_api_key: mobitechConfig.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
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
      mobile: result.mobile_number || payload.mobile,
      networkId: result.network_id,
      messageCost: result.message_cost,
      creditBalance: result.credit_balance,
    };
  } catch (error) {
    if (error.providerCode) {
      throw error;
    }

    // Do not log the API key or request authentication headers.
    console.error("Mobitech SMS request failed:", {
      httpStatus: error.response?.status,
      providerStatus: error.response?.data?.[0]?.status_code,
      message: error.message,
    });

    const apiError = new Error(
      error.response?.data?.[0]?.status_desc ||
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "Mobitech SMS request timed out."
          : "Unable to send SMS through Mobitech."),
    );

    apiError.statusCode = 502;
    throw apiError;
  }
};

export default sendMobitechSms;
