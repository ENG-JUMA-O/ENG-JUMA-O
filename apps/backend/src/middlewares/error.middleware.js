
const errorMiddleware = (err, _req, res, _next) => {
  const statusCode =
    err.response?.status ||
    err.statusCode ||
    err.status ||
    500;

  const message =
    err.response?.data?.message ||
    err.message ||
    "Something went wrong";

  if (statusCode >= 500) {
    console.error("[API Error]", err);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : message,
  });
};

export default errorMiddleware;
