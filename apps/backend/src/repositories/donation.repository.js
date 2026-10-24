
import prisma from "../config/prisma.js";

const donationRepository = {
  create(data) {
    return prisma.donation.create({
      data,
    });
  },

  findById(id) {
    return prisma.donation.findUnique({
      where: { id },
    });
  },

  findByExternalReference(externalReference) {
    return prisma.donation.findUnique({
      where: { externalReference },
    });
  },

  findByCheckoutRequestId(checkoutRequestId) {
    return prisma.donation.findUnique({
      where: { checkoutRequestId },
    });
  },

  updateById(id, data) {
    return prisma.donation.update({
      where: { id },
      data,
    });
  },

  updateByExternalReference(externalReference, data) {
    return prisma.donation.update({
      where: { externalReference },
      data,
    });
  },

  findMany({
    status,
    phone,
    skip = 0,
    take = 20,
  } = {}) {
    return prisma.donation.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(phone ? { phone } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });
  },

  count({ status, phone } = {}) {
    return prisma.donation.count({
      where: {
        ...(status ? { status } : {}),
        ...(phone ? { phone } : {}),
      },
    });
  },
};

export default donationRepository;
