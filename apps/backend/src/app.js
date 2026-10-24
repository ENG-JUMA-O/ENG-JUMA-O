
import express from "express";
import cors from "cors";

import donationRoutes from "./routes/donation.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://buy-me-coffee-kzvi.onrender.com",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Buy Me Coffee API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/donations", donationRoutes);

app.use(errorMiddleware);

export default app;
