
export function createDonationRequestDto(body) {
  return {
    amount: body.amount,
    phone: body.phone,
    customerName: body.customerName,
    message: body.message,
    isAnonymous: body.isAnonymous,
  };
}
