import payHeroClient from "../../config/payhero.client.js";

export default async function getWalletBalanceService() {
    const { data } = await payHeroClient.get("/wallets");

    return data;
}