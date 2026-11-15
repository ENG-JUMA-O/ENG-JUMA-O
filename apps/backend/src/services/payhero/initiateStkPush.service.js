
import prisma from "../../config/prisma.js";
import payHeroClient from "../../config/payhero.client.js";
import payHeroConfig from "../../config/payhero.config.js";

import generateExternalReference from "../../utils/generateExternalReference.util.js";

export default async function initiateStkPushService(request) {
    // Generate donation reference
    const externalReference = await generateExternalReference(
        request.external_reference
    );

    // Create pending donation
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

    try {
        // Initiate STK Push
        const { data: payment } = await payHeroClient.post(
            "/payments",
            payload
        );

        // Save PayHero transaction identifiers
        const updatedDonation = await prisma.donation.update({
            where: {
                id: donation.id,
            },
            data: {
                checkoutRequestId:
                    payment.CheckoutRequestID ?? undefined,

                merchantRequestId:
                    payment.MerchantRequestID ?? undefined,
            },
        });

        return {
            donation: updatedDonation,
            payment,
        };
    } catch (error) {
        // Mark donation as failed only when PayHero explicitly rejects it
        if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500
        ) {
            await prisma.donation.update({
                where: {
                    id: donation.id,
                },
                data: {
                    status: "FAILED",
                    providerResultDescription:
                        error.response.data?.error_message ??
                        "Payment request rejected by PayHero",
                },
            });
        }

        throw error;
    }
}
