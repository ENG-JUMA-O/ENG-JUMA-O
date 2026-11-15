import { randomUUID } from "node:crypto";
import prisma from "../config/prisma.js";

export default async function generateExternalReference(reference = null) {
    // Check a reference supplied by the client
    if (reference) {
        const existingDonation = await prisma.donation.findUnique({
            where: {
                externalReference: reference,
            },
            select: {
                id: true,
            },
        });

        if (existingDonation) {
            throw new Error("Donation reference already exists");
        }

        return reference;
    }

    // Generate a unique reference
    let externalReference;
    let existingDonation;

    do {
        externalReference = `DONATION-${randomUUID()
            .replaceAll("-", "")
            .slice(0, 12)
            .toUpperCase()}`;

        existingDonation = await prisma.donation.findUnique({
            where: {
                externalReference,
            },
            select: {
                id: true,
            },
        });
    } while (existingDonation);

    return externalReference;
}