import smsClient from "../../config/sms.client.js";

export default async function getSmsBalanceService() {
    const { data } = await smsClient.get("/api-balance");

    return data;
}