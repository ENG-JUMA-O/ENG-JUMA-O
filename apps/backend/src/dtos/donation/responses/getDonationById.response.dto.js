
export function getDonationByIdResponseDto(donation) {
  return {
    success: true,
    data: {
      id: donation.id,
      externalReference: donation.externalReference,
      amount: donation.amount,
      customerName: donation.isAnonymous
        ? null
        : donation.customerName,
      message: donation.isAnonymous
        ? null
        : donation.message,
      isAnonymous: donation.isAnonymous,
      status: donation.status,
      mpesaReceiptNumber: donation.mpesaReceiptNumber,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      paidAt: donation.paidAt,
    },
  };
}
