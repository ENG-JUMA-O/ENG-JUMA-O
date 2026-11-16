
import prisma from "../../config/prisma.js";

const notificationRepository = {
    create(data) {
        return prisma.notification.create({ data });
    },

    createMany(data) {
        return prisma.notification.createMany({
            data,
            skipDuplicates: true,
        });
    },

    update(id, data) {
        return prisma.notification.update({
            where: { id },
            data,
        });
    },

    updateMany(where, data) {
        return prisma.notification.updateMany({
            where,
            data,
        });
    },

    findById(id) {
        return prisma.notification.findUnique({
            where: { id },
        });
    },

    findByProviderId(providerId) {
        return prisma.notification.findMany({
            where: { providerId },
        });
    },

    findByProviderIdAndRecipient(providerId, recipient) {
        return prisma.notification.findFirst({
            where: {
                providerId,
                recipient,
            },
        });
    },

    findByDonationTypeAndRecipient(donationId, type, recipient) {
        return prisma.notification.findUnique({
            where: {
                donationId_type_recipient: {
                    donationId,
                    type,
                    recipient,
                },
            },
        });
    },

    findPending(limit = 50) {
        return prisma.notification.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "asc" },
            take: limit,
        });
    },

    findByDonationId(donationId) {
        return prisma.notification.findMany({
            where: { donationId },
            orderBy: { createdAt: "desc" },
        });
    },
};

export default notificationRepository;
