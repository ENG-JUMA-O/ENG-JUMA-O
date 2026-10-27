
import axios from "axios";
import http from "node:http";
import https from "node:https";
import payHeroConfig, {
  validatePayHeroConfig,
} from "../config/payhero.config.js";

const REQUEST_TIMEOUT_MS = 12000;
const LOG_PREFIX = "[PAYHERO]";

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

const payHeroClient = axios.create({
  baseURL: payHeroConfig.baseUrl,
  timeout: REQUEST_TIMEOUT_MS,
  httpAgent,
  httpsAgent,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const createError = (message, statusCode, cause) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (cause) {
    error.cause = cause;
  }

  return error;
};

const getCredentials = (config) =>
  Buffer.from(
    `${config.username}:${config.password}`,
    "utf8",
  ).toString("base64");

const getRequestError = (cause, operation) => {
  if (cause?.statusCode) {
    return cause;
  }

  if (!axios.isAxiosError(cause)) {
    return createError(
      `Unexpected PayHero ${operation} error.`,
      500,
      cause,
    );
  }

  const timedOut =
    cause.code === "ECONNABORTED" ||
    cause.code === "ETIMEDOUT";

  const message = timedOut
    ? `PayHero ${operation} timed out. Verify payment status before retrying.`
    : cause.response
      ? `PayHero ${operation} failed.`
      : `Unable to connect to PayHero during ${operation}.`;

  const statusCode = timedOut
    ? 504
    : cause.response
      ? 502
      : 503;

  return createError(message, statusCode, cause);
};

const isObjectResponse = (data) =>
  data !== null &&
  typeof data === "object" &&
  !Array.isArray(data);

const payHeroService = {
  /**
   * Initiate an M-Pesa STK Push payment.
   * A successful response does not mean payment is complete.
   */
  async initiatePayment({
    amount,
    phone_number,
    external_reference,
    customer_name,
  }) {
    if (!Number.isSafeInteger(amount) || amount < 1) {
      throw createError("Invalid payment amount.", 400);
    }

    if (
      typeof phone_number !== "string" ||
      !/^254[17]\d{8}$/.test(phone_number)
    ) {
      throw createError("Invalid Kenyan phone number.", 400);
    }

    if (
      typeof external_reference !== "string" ||
      !/^DON-[\w-]{1,100}$/.test(external_reference)
    ) {
      throw createError("Invalid payment reference.", 400);
    }

    const config = validatePayHeroConfig();
    const authorization = `Basic ${getCredentials(config)}`;

    try {
      const response = await payHeroClient.post(
        "",
        {
          amount,
          phone_number,
          channel_id: config.channelId,
          provider: "m-pesa",
          external_reference,
          customer_name:
            typeof customer_name === "string" &&
            customer_name.trim()
              ? customer_name.trim()
              : "Anonymous",
          callback_url: config.callbackUrl,
        },
        {
          headers: {
            Authorization: authorization,
          },
        },
      );

      if (!isObjectResponse(response.data)) {
        throw createError(
          "Invalid response from PayHero.",
          502,
        );
      }

      return response.data;
    } catch (cause) {
      throw getRequestError(cause, "payment request");
    }
  },

  /**
   * Check transaction status with PayHero.
   * The caller must validate the transaction against the
   * persisted donation before marking a donation successful.
   */
  async verifyTransactionStatus(reference) {
    if (
      typeof reference !== "string" ||
      !reference.trim()
    ) {
      throw createError(
        "A transaction reference is required.",
        400,
      );
    }

    const config = validatePayHeroConfig();
    const authorization = `Basic ${getCredentials(config)}`;

    try {
      const statusUrl = new URL(
        "/api/v2/transaction-status",
        payHeroConfig.baseUrl,
      ).toString();

      const response = await payHeroClient.get(statusUrl, {
        params: {
          reference: reference.trim(),
        },
        headers: {
          Authorization: authorization,
        },
      });

      if (
        !isObjectResponse(response.data) ||
        typeof response.data.status !== "string"
      ) {
        throw createError(
          "Invalid transaction status response from PayHero.",
          502,
        );
      }

      return response.data;
    } catch (cause) {
      throw getRequestError(cause, "transaction verification");
    }
  },
};

export default payHeroService;
