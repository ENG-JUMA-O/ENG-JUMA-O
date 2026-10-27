
const mobitechConfig = {
  baseUrl:
    process.env.MOBITECH_SMS_BASE_URL ||
    "https://app.mobitechtechnologies.com",

  apiKey: process.env.MOBITECH_SMS_API_KEY,

  serviceId: Number(process.env.MOBITECH_SMS_SERVICE_ID ?? 0),

  senderName:
    process.env.MOBITECH_SMS_SENDER_NAME || "FULL_CIRCLE",

  responseType:
    process.env.MOBITECH_SMS_RESPONSE_TYPE || "json",
};

export default mobitechConfig;
