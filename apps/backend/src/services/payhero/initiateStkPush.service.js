import prisma from "../../config/prisma.js";
import payHeroClient from "../../config/payhero.client.js";
import payHeroConfig from "../../config/payhero.config.js";

import generateExternalReference from "../../utils/generateExternalReference.util.js";

export default async function initiateStkPushService(request) {
    // Generate and check donation reference
    const externalReference = await generateExternalReference(
        request.external_reference
    );

    // Create donation
    const donation = await prisma.donation.create({
        data: {
            amount: request.amount,
            phone: request.phone_number,
            message: request.message,
            isAnonymous: request.isAnonymous,
            externalReference,
            status: "PENDING",
        },
    });

    // Prepare PayHero request
    const payload = {
        amount: request.amount,
        phone_number: request.phone_number,
        channel_id: request.channel_id || payHeroConfig.channelId,
        provider: request.provider || "m-pesa",
        external_reference: externalReference,
        callback_url: request.callback_url || payHeroConfig.callbackUrl,
    };

    // Initiate STK Push
    const { data: payment } = await payHeroClient.post(
        "/payments",
        payload
    );

    // Update donation
    const updatedDonation = await prisma.donation.update({
        where: {
            id: donation.id,
        },
        data: {
            checkoutRequestId: payment.CheckoutRequestID ?? null,
            merchantRequestId: payment.MerchantRequestID ?? null,
        },
    });

    return {
        donation: updatedDonation,
        payment,
    };
}