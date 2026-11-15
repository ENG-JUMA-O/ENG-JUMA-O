
import payHeroClient from "../../config/payhero.client.js";

export default async function getTransactionStatusService(reference) {
    const { data } = await payHeroClient.get("/transaction-status", {
        params: { reference },
    });

    return data;
}
