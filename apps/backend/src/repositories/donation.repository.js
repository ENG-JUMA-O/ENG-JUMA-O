
import prisma from "../config/prisma.js";

export function createDonationRepository(data) {
  return prisma.donation.create({
    data,
  });
}

export function findDonationByIdRepository(id) {
  return prisma.donation.findUnique({
    where: { id },
  });
}

export function findDonationByExternalReferenceRepository(externalReference) {
  return prisma.donation.findUnique({
    where: { externalReference },
  });
}

export function findDonationByCheckoutRequestIdRepository(checkoutRequestId) {
  return prisma.donation.findUnique({
    where: { checkoutRequestId },
  });
}

export function updateDonationRepository(id, data) {
  return prisma.donation.update({
    where: { id },
    data,
  });
}

export function updateDonationByExternalReferenceRepository(
  externalReference,
  data,
) {
  return prisma.donation.update({
    where: { externalReference },
    data,
  });
}
