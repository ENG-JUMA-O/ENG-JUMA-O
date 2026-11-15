import payHeroClient from "../../config/payhero.client.js";

export default async function getTransactionStatusService(params) {
    const { data } = await payHeroClient.get("/transaction-status", {
        params,
    });

    return data;
}