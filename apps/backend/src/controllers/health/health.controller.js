export const getApiStatus = (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Buy Me Coffee API is running",
  });
};

export const getHealthStatus = (_req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
  });
};