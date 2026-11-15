import payHeroClient from "../../config/payhero.client.js";

export default async function getTransactionsService(params) {
    const { data } = await payHeroClient.get("/transactions", {
        params,
    });

    return data;
}