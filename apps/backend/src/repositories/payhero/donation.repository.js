
import prisma from "../../config/prisma.js";

const donationRepository = {
    create(data) {
        return prisma.donation.create({
            data,
        });
    },

    update(id, data) {
        return prisma.donation.update({
            where: { id },
            data,
        });
    },

    findById(id) {
        return prisma.donation.findUnique({
            where: { id },
        });
    },

    findByIdWithNotifications(id) {
        return prisma.donation.findUnique({
            where: { id },
            include: {
                notifications: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
    },

    findByExternalReference(externalReference) {
        return prisma.donation.findUnique({
            where: { externalReference },
        });
    },

    findByPayHeroReference(payHeroReference) {
        return prisma.donation.findUnique({
            where: { payHeroReference },
        });
    },

    findByCheckoutRequestId(checkoutRequestId) {
        return prisma.donation.findUnique({
            where: { checkoutRequestId },
        });
    },
};

export default donationRepository;
