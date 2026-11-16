
const smsConfig = {
    baseUrl: process.env.SMS_BASE_URL,
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID,
    webhookSecret: process.env.SMS_WEBHOOK_SECRET,
};

export const validateSmsConfig = () => {
    const required = [
        ["SMS_BASE_URL", smsConfig.baseUrl],
        ["SMS_API_KEY", smsConfig.apiKey],
        ["SMS_SENDER_ID", smsConfig.senderId],
        ["SMS_WEBHOOK_SECRET", smsConfig.webhookSecret],
    ];

    const missing = required
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (missing.length) {
        throw new Error(
            `Missing SMS configuration: ${missing.join(", ")}`
        );
    }

    return smsConfig;
};

export default smsConfig;
