
const errorMiddleware = (err, req, res, next) => {
  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  console.error("[BACKEND ERROR]", {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode,
    name: err.name,
    message: err.message,
    errorCode: err.code ?? null,
    providerCode: err.providerCode ?? null,
    providerHttpStatus: err.cause?.response?.status ?? null,
    requestId: res.getHeader("X-Request-Id") ?? null,
    stack:
      process.env.NODE_ENV !== "production"
        ? err.stack
        : undefined,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
};

export default errorMiddleware;
