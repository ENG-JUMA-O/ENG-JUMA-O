
import payHeroClient from "../../config/payhero.client.js";
import payHeroConfig from "../../config/payhero.config.js";

import donationRepository from "../../repositories/payhero/donation.repository.js";
import generateExternalReference from "../../utils/generateExternalReference.util.js";

export default async function initiateStkPushService(request) {
    // Generate donation reference
    const externalReference = await generateExternalReference(
        request.external_reference
    );

    // Create pending donation
    const donation = await donationRepository.create({
        amount: request.amount,
        phone: request.phone_number,
        message: request.message,
        isAnonymous: request.isAnonymous ?? false,
        externalReference,
        status: "PENDING",
    });

    // Prepare PayHero request
    const payload = {
        amount: request.amount,
        phone_number: request.phone_number,
        channel_id: request.channel_id || payHeroConfig.channelId,
        provider: request.provider || "m-pesa",
        external_reference: externalReference,
        callback_url: payHeroConfig.callbackUrl,
    };

    let payment;

    // Initiate STK Push
    try {
        const response = await payHeroClient.post("/payments", payload);
        payment = response.data;
    } catch (error) {
        // Mark donation as failed only when PayHero explicitly rejects it
        if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500
        ) {
            await donationRepository.update(donation.id, {
                status: "FAILED",
                providerResultDescription:
                    error.response.data?.error_message ??
                    "Payment request rejected by PayHero",
            });
        }

        throw error;
    }

    // Save PayHero transaction identifiers
    const updatedDonation = await donationRepository.update(donation.id, {
        payHeroReference: payment.reference ?? undefined,
        checkoutRequestId: payment.CheckoutRequestID ?? undefined,
        merchantRequestId: payment.MerchantRequestID ?? undefined,
    });

    return {
        donation: updatedDonation,
        payment,
    };
}
