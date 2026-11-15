import payHeroClient from "../../config/payhero.client.js";

export default async function topUpWalletService(request) {
    const { data } = await payHeroClient.post("/topup", request);

    return data;
}