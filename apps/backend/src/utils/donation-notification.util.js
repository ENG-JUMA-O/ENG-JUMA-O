
export const buildDonationSms = (donation, type) => {
  const amount = `KES ${donation.amount}`;
  const receipt =
    donation.mpesaReceiptNumber || donation.externalReference;

  const donorName = donation.isAnonymous
    ? "A supporter"
    : donation.customerName?.trim() || "A supporter";

  if (type === "SUPPORTER_DONATION_RECEIPT") {
    const recipientName = donation.isAnonymous
      ? "Supporter"
      : donation.customerName?.trim() || "Supporter";

    return [
      `Thank you, ${recipientName}!`,
      `I have received your ${amount} donation.`,
      `M-Pesa receipt: ${receipt}.`,
      "I appreciate your support!",
    ].join(" ");
  }

  if (type === "COFFEE_RECIPIENT_NOTIFICATION") {
    return [
      `${donorName} has bought you a coffee!`,
      `Amount: ${amount}.`,
      `Message: ${donation.message?.trim() || "Enjoy your coffee!"}`,
    ].join(" ");
  }

  throw new Error(`Unsupported notification type: ${type}`);
};
