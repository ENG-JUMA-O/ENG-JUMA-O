
export function createDonationResponseDto({ donation, payment }) {
  return {
    success: true,
    message: "Donation initiated successfully",
    data: {
      donation: {
        id: donation.id,
        externalReference: donation.externalReference,
        amount: donation.amount,
        status: donation.status,
        createdAt: donation.createdAt,
      },
      payment: {
        status: payment.status,
        reference: payment.reference ?? null,
        checkoutRequestId: payment.CheckoutRequestID ?? null,
      },
    },
  };
}
