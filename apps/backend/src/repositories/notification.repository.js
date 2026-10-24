
import prisma from "../config/prisma.js";

export function createNotificationRepository(data) {
  return prisma.notification.create({
    data,
  });
}

export function findNotificationByIdRepository(id) {
  return prisma.notification.findUnique({
    where: { id },
  });
}

export function findNotificationByDonationAndTypeRepository(
  donationId,
  type,
) {
  return prisma.notification.findUnique({
    where: {
      donationId_type: {
        donationId,
        type,
      },
    },
  });
}

export function updateNotificationRepository(id, data) {
  return prisma.notification.update({
    where: { id },
    data,
  });
}

export function findPendingNotificationsRepository(limit = 50) {
  return prisma.notification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}
