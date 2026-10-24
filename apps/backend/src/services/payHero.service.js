import axios from "axios";

const PAYHERO_URL = "https://backend.payhero.co.ke/api/v2/payments";

const payHeroClient = axios.create({
  baseURL: PAYHERO_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const payHeroService = {
  async initiatePayment({
    amount,
    phone_number,
    external_reference,
    customer_name,
  }) {
    const {
      PAYHERO_USERNAME,
      PAYHERO_PASSWORD,
      PAYHERO_CHANNEL_ID,
      PAYHERO_CALLBACK_URL,
    } = process.env;

    if (
      !PAYHERO_USERNAME ||
      !PAYHERO_PASSWORD ||
      !PAYHERO_CHANNEL_ID ||
      !PAYHERO_CALLBACK_URL
    ) {
      const error = new Error("PayHero configuration is incomplete");
      error.statusCode = 500;
      throw error;
    }

    const channelId = Number(PAYHERO_CHANNEL_ID);

    if (!Number.isSafeInteger(channelId) || channelId <= 0) {
      const error = new Error("Invalid PayHero channel configuration");
      error.statusCode = 500;
      throw error;
    }

    if (!Number.isSafeInteger(amount) || amount < 1) {
      const error = new Error("Invalid payment amount");
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof phone_number !== "string" ||
      !/^254[17]\d{8}$/.test(phone_number)
    ) {
      const error = new Error("Invalid Kenyan phone number");
      error.statusCode = 400;
      throw error;
    }

    if (
      typeof external_reference !== "string" ||
      !/^DON-[\w-]{1,100}$/.test(external_reference)
    ) {
      const error = new Error("Invalid payment reference");
      error.statusCode = 400;
      throw error;
    }

    const credentials = Buffer.from(
      `${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`,
      "utf8",
    ).toString("base64");

    try {
      const response = await payHeroClient.post(
        "",
        {
          amount,
          phone_number,
          channel_id: channelId,
          provider: "m-pesa",
          external_reference,
          customer_name: customer_name || "Anonymous",
          callback_url: PAYHERO_CALLBACK_URL,
        },
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      if (!response.data || typeof response.data !== "object") {
        const error = new Error("Invalid response from PayHero");
        error.statusCode = 502;
        throw error;
      }

      return response.data;
    } catch (cause) {
      if (cause.statusCode) throw cause;

      const error = new Error(
        axios.isAxiosError(cause)
          ? cause.code === "ECONNABORTED" ||
            cause.code === "ETIMEDOUT"
            ? "PayHero request timed out; payment status must be verified before retrying"
            : "PayHero payment request failed"
          : "Unexpected PayHero error",
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