import payHeroClient from "../../config/payhero.client.js";

export default async function getPaymentChannelsService() {
    const { data } = await payHeroClient.get("/payment_channels");

    return data;
}