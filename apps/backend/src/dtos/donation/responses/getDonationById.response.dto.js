
export function getDonationByIdResponseDto(donation) {
  return {
    success: true,
    data: {
      id: donation.id,
      externalReference: donation.externalReference,
      amount: donation.amount,
      customerName: donation.isAnonymous
        ? null
        : donation.customerName ?? null,
      message: donation.isAnonymous
        ? null
        : donation.message ?? null,
      isAnonymous: donation.isAnonymous,
      status: donation.status,
      mpesaReceiptNumber: donation.mpesaReceiptNumber ?? null,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      paidAt: donation.paidAt ?? null,
    },
  };
}
