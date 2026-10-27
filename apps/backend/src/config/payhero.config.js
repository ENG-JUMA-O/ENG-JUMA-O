
const payHeroConfig = {
  baseUrl:
    process.env.PAYHERO_BASE_URL ||
    "https://backend.payhero.co.ke/api/v2/payments",

  username: process.env.PAYHERO_USERNAME,
  password: process.env.PAYHERO_PASSWORD,

  channelId: Number(process.env.PAYHERO_CHANNEL_ID),

  callbackToken: process.env.PAYHERO_CALLBACK_TOKEN,
  callbackUrl: process.env.PAYHERO_CALLBACK_URL,
};

export const validatePayHeroConfig = () => {
  const required = [
    ["PAYHERO_USERNAME", payHeroConfig.username],
    ["PAYHERO_PASSWORD", payHeroConfig.password],
    ["PAYHERO_CHANNEL_ID", process.env.PAYHERO_CHANNEL_ID],
    ["PAYHERO_CALLBACK_TOKEN", payHeroConfig.callbackToken],
    ["PAYHERO_CALLBACK_URL", payHeroConfig.callbackUrl],
  ];

  const missing = required
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(
      `Missing PayHero configuration: ${missing.join(", ")}`,
    );
  }

  if (
    !Number.isSafeInteger(payHeroConfig.channelId) ||
    payHeroConfig.channelId <= 0
  ) {
    throw new Error("PAYHERO_CHANNEL_ID must be a positive integer");
  }

  return payHeroConfig;
};

export default payHeroConfig;
