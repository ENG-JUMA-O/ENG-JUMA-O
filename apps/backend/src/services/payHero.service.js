
import axios from "axios";
import payHeroConfig, {
  validatePayHeroConfig,
} from "../config/payhero.config.js";

const payHeroClient = axios.create({
  baseURL: payHeroConfig.baseUrl,
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
    const config = validatePayHeroConfig();

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
      `${config.username}:${config.password}`,
      "utf8",
    ).toString("base64");

    try {
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
            ? "PayHero request timed out; verify payment status before retrying"
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
