
import { z } from "zod";

// Accept Kenyan mobile numbers starting with 07, 01, 2547, 2541,
// +2547, or +2541.
const kenyanPhoneRegex = /^(?:(?:\+254|254)(?:7|1)\d{8}|0(?:7|1)\d{8})$/;

export const createDonationSchema = z
  .object({
    amount: z.coerce
      .number()
      .int("Amount must be a whole number of Kenyan shillings")
      .min(1, "Minimum donation is KSh 1")
      .max(1000000, "Donation amount is too large"),

    phone: z
      .string()
      .trim()
      .regex(
        kenyanPhoneRegex,
        "Enter a valid Kenyan mobile number, e.g. 0712345678, 0112345678, 254712345678, or +254112345678",
      ),

    customerName: z
      .string()
      .trim()
      .max(100, "Name must not exceed 100 characters")
      .optional()
      .nullable(),

    message: z
      .string()
      .trim()
      .max(500, "Message must not exceed 500 characters")
      .optional()
      .nullable(),

    isAnonymous: z.boolean().optional().default(false),
  })
  .strict();

export const donationIdSchema = z.object({
  id: z.string().min(1, "Donation ID is required"),
});
