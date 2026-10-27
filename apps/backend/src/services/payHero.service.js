
import axios from "axios";
import payHeroConfig, {
  validatePayHeroConfig,
} from "../config/payhero.config.js";

const LOG_PREFIX = "[PAYHERO SERVICE]";
const REQUEST_TIMEOUT_MS = 12000;

const payHeroClient = axios.create({
  baseURL: payHeroConfig.baseUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function createBasicAuth(config) {
  return Buffer.from(
    `${config.username}:${config.password}`,
    "utf8",
  ).toString("base64");
}

function logProviderError(operation, error) {
  console.error(`${LOG_PREFIX} ${operation} failed`, {
    timestamp: new Date().toISOString(),
    message: error.message,
    code: error.code ?? null,
    httpStatus: error.response?.status ?? null,
    // Never log request headers or credentials.
    providerResponse: error.response?.data ?? null,
    timedOut:
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT",
  });
}

const payHeroService = {
  /**
   * Initiate an M-Pesa STK Push payment.
   */
  async initiatePayment({
    amount,
    phone_number,
    external_reference,
    customer_name,
  }) {
    const startedAt = Date.now();

    console.log(`${LOG_PREFIX} Initiating payment`, {
      amount,
      externalReference: external_reference,
      phoneProvided: Boolean(phone_number),
      timestamp: new Date().toISOString(),
    });

    let config;

    try {
      config = validatePayHeroConfig();

      console.log(`${LOG_PREFIX} Configuration validated`, {
        baseUrlConfigured: Boolean(payHeroConfig.baseUrl),
        channelIdConfigured: Boolean(config.channelId),
        credentialsConfigured: Boolean(
          config.username && config.password,
        ),
        callbackUrlConfigured: Boolean(config.callbackUrl),
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Configuration validation failed`, {
        message: error.message,
      });
      throw error;
    }

    if (!Number.isSafeInteger(amount) || amount < 1) {
      console.error(`${LOG_PREFIX} Invalid amount`, { amount });

      const error = new Error("Invalid payment amount.");
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof phone_number !== "string" ||
      !/^254[17]\d{8}$/.test(phone_number)
    ) {
      console.error(`${LOG_PREFIX} Invalid phone number format`, {
        phoneProvided: Boolean(phone_number),
      });

      const error = new Error("Invalid Kenyan phone number.");
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof external_reference !== "string" ||
      !/^DON-[\w-]{1,100}$/.test(external_reference)
    ) {
      console.error(`${LOG_PREFIX} Invalid payment reference`);

      const error = new Error("Invalid payment reference.");
      error.statusCode = 400;
      throw error;
    }

    const credentials = createBasicAuth(config);

    try {
      console.log(`${LOG_PREFIX} Sending STK Push request`, {
        amount,
        externalReference: external_reference,
        channelId: config.channelId,
        provider: "m-pesa",
        timeoutMs: REQUEST_TIMEOUT_MS,
      });

      const response = await payHeroClient.post(
        "",
        {
          amount,
          phone_number,
          channel_id: config.channelId,
          provider: "m-pesa",
          external_reference,
          customer_name: customer_name || "Anonymous",
          callback_url: config.callbackUrl,
        },
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      console.log(`${LOG_PREFIX} STK Push response received`, {
        httpStatus: response.status,
        externalReference: external_reference,
        checkoutRequestId:
          response.data?.CheckoutRequestID ?? null,
        merchantRequestId:
          response.data?.MerchantRequestID ?? null,
        durationMs: Date.now() - startedAt,
      });

      if (
        !response.data ||
        typeof response.data !== "object"
      ) {
        console.error(`${LOG_PREFIX} Invalid provider response`, {
          httpStatus: response.status,
          responseType: typeof response.data,
        });

        const error = new Error("Invalid response from PayHero.");
        error.statusCode = 502;
        throw error;
      }

      return response.data;
    } catch (cause) {
      if (cause.statusCode) {
        throw cause;
      }

      logProviderError("STK Push", cause);

      const error = new Error(
        axios.isAxiosError(cause)
          ? cause.code === "ECONNABORTED" ||
            cause.code === "ETIMEDOUT"
            ? "PayHero request timed out. Verify payment status before retrying."
            : "PayHero payment request failed."
          : "Unexpected PayHero error.",
      );

      error.statusCode = axios.isAxiosError(cause)
        ? cause.response
          ? 502
          : 503
        : 500;

      error.cause = cause;
      throw error;
    }
  },

  /**
   * Verify a transaction using the configured status endpoint.
   */
  async verifyTransactionStatus(reference) {
    const startedAt = Date.now();

    console.log(`${LOG_PREFIX} Verifying transaction`, {
      referenceProvided:
        typeof reference === "string" && Boolean(reference.trim()),
      timestamp: new Date().toISOString(),
    });

    let config;

    try {
      config = validatePayHeroConfig();
    } catch (error) {
      console.error(`${LOG_PREFIX} Configuration validation failed`, {
        message: error.message,
      });
      throw error;
    }

    if (
      typeof reference !== "string" ||
      !reference.trim()
    ) {
      console.error(`${LOG_PREFIX} Missing transaction reference`);

      const error = new Error(
        "A transaction reference is required.",
      );
      error.statusCode = 400;
      throw error;
    }

    const credentials = createBasicAuth(config);

    try {
      const statusUrl = new URL(
        "/api/v2/transaction-status",
        payHeroConfig.baseUrl,
      );

      console.log(`${LOG_PREFIX} Sending status verification request`, {
        endpoint: statusUrl.origin + statusUrl.pathname,
        timeoutMs: REQUEST_TIMEOUT_MS,
      });

      const response = await axios.get(statusUrl.toString(), {
        params: {
          reference: reference.trim(),
        },
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      console.log(`${LOG_PREFIX} Status response received`, {
        httpStatus: response.status,
        providerStatus: response.data?.status ?? null,
        durationMs: Date.now() - startedAt,
      });

      if (
        !response.data ||
        typeof response.data !== "object" ||
        typeof response.data.status !== "string"
      ) {
        console.error(`${LOG_PREFIX} Invalid status response`, {
          httpStatus: response.status,
          responseType: typeof response.data,
        });

        const error = new Error(
          "Invalid transaction status response from PayHero.",
        );
        error.statusCode = 502;
        throw error;
      }

      return response.data;
    } catch (cause) {
      if (cause.statusCode) {
        throw cause;
      }

      logProviderError("Transaction verification", cause);

      const error = new Error(
        "Unable to verify the transaction with PayHero.",
      );

      error.statusCode = axios.isAxiosError(cause)
        ? cause.response
          ? 502
          : 503
        : 500;

      error.cause = cause;
      throw error;
    }
  },
};

export default payHeroService;
