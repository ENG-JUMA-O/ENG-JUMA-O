
const sendValidationError = (res, errors) =>
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });

export const validateCreateDonation = (req, res, next) => {
  const { amount, phone, customerName, message, isAnonymous } = req.body ?? {};
  const errors = [];

  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    !Number.isInteger(Number(amount)) ||
    Number(amount) < 1 ||
    Number(amount) > 100000
  ) {
    errors.push("Amount must be a whole number between 1 and 100000 KES.");
  }

  if (
    typeof phone !== "string" ||
    !/^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/.test(phone.trim())
  ) {
    errors.push("Provide a valid Kenyan M-Pesa phone number.");
  }

  if (
    customerName !== undefined &&
    customerName !== null &&
    (typeof customerName !== "string" || customerName.trim().length > 100)
  ) {
    errors.push("Customer name must be a string of at most 100 characters.");
  }

  if (
    message !== undefined &&
    message !== null &&
    (typeof message !== "string" || message.length > 500)
  ) {
    errors.push("Message must be a string of at most 500 characters.");
  }

  if (
    isAnonymous !== undefined &&
    typeof isAnonymous !== "boolean"
  ) {
    errors.push("isAnonymous must be a boolean.");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  return next();
};

export const validatePayHeroCallback = (req, res, next) => {
  const payload = req.body ?? {};
  const callback = payload.response ?? payload;
  const errors = [];

  const externalReference =
    callback.ExternalReference ?? callback.externalReference;

  const resultCode =
    callback.ResultCode ?? callback.resultCode;

  const status = callback.Status ?? callback.status;

  if (
    typeof externalReference !== "string" ||
    !externalReference.trim() ||
    externalReference.length > 200
  ) {
    errors.push("A valid external reference is required.");
  }

  if (
    resultCode === undefined &&
    (typeof status !== "string" || !status.trim())
  ) {
    errors.push("A payment result code or status is required.");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  return next();
};

export const validateDonationId = (req, res, next) => {
  const { id } = req.params;

  if (
    typeof id !== "string" ||
    !/^[a-zA-Z0-9_-]{8,100}$/.test(id)
  ) {
    return sendValidationError(res, [
      "A valid donation ID is required.",
    ]);
  }

  return next();
};
