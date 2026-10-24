import axios from "axios";

const PAYHERO_URL = "https://backend.payhero.co.ke/api/v2/payments";

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
      throw new Error("PayHero configuration is incomplete");
    }

    const credentials = Buffer.from(
      `${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`
    ).toString("base64");

    const response = await axios.post(
      PAYHERO_URL,
      {
        amount,
        phone_number,
        channel_id: Number(PAYHERO_CHANNEL_ID),
        provider: "m-pesa",
        external_reference,
        customer_name,
        callback_url: PAYHERO_CALLBACK_URL,
      },
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    return response.data;
  },
};

export default payHeroService;