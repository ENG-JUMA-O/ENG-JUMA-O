
import { body, query, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Invalid request data",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            })),
        });
    }

    next();
};

export const initiatePaymentValidator = [
    body("amount")
        .isInt({ min: 1 })
        .withMessage("Amount must be a positive integer"),

    body("phone_number")
        .isString()
        .matches(/^(?:254|0)(?:7|1)\d{8}$/)
        .withMessage("Enter a valid Kenyan phone number"),

    body("provider")
        .optional()
        .isIn(["m-pesa"])
        .withMessage("Unsupported payment provider"),

    body("channel_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Channel ID must be a positive integer"),

    body("message")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("Message cannot exceed 500 characters"),

    body("isAnonymous")
        .optional()
        .isBoolean()
        .withMessage("isAnonymous must be a boolean"),

    validateRequest,
];

export const callbackValidator = [
    body("response")
        .isObject()
        .withMessage("Callback response must be an object"),

    body("response").custom((response) => {
        const isPaymentCallback = Boolean(response.ExternalReference);

        const isTransactionNotification =
            Boolean(response.Transaction_Type) ||
            Boolean(response.MPESA_Reference) ||
            Boolean(response.Transaction_Reference);

        if (!isPaymentCallback && !isTransactionNotification) {
            throw new Error("Unrecognized PayHero callback payload");
        }

        return true;
    }),

    validateRequest,
];

export const transactionStatusValidator = [
    query("reference")
        .isString()
        .notEmpty()
        .withMessage("Transaction reference is required"),

    validateRequest,
];
