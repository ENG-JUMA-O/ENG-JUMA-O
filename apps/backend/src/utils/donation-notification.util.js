
const formatAmount = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Donation amount must be a positive number.");
  }

  return `KES ${value.toLocaleString("en-KE")}`;
};

export const buildDonationSms = (donation, type) => {
  if (!donation || typeof donation !== "object") {
    throw new TypeError("A valid donation object is required.");
  }

  const amount = formatAmount(donation.amount);

  const receipt =
    donation.mpesaReceiptNumber?.trim() ||
    donation.externalReference?.trim() ||
    "Not available";

  const donorName = donation.isAnonymous
    ? "A supporter"
    : donation.customerName?.trim() || "A supporter";

  if (type === "SUPPORTER_DONATION_RECEIPT") {
    const recipientName = donation.isAnonymous
      ? "Supporter"
      : donation.customerName?.trim() || "Supporter";

    return [
      `Thank you, ${recipientName}!`,
      `We have received your ${amount} donation.`,
      `M-Pesa receipt: ${receipt}.`,
      "We appreciate your support!",
    ].join(" ");
  }

  if (type === "COFFEE_RECIPIENT_NOTIFICATION") {
    const message =
      donation.message?.trim() || "Enjoy your coffee!";

    return [
      `${donorName} has bought you a coffee!`,
      `Amount: ${amount}.`,
      `Message: ${message}`,
    ].join(" ");
  }

  throw new Error(`Unsupported notification type: ${type}`);
};
