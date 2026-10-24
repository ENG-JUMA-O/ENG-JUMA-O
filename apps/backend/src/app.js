import express from "express";
import cors from "cors";
import helmet from "helmet";

import donationRoutes from "./routes/donation.routes.js";
import errorMiddleware, {
  generalRateLimiter,
} from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = [
  "https://buy-me-coffee-kzvi.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    ...process.env.FRONTEND_URL
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean),
  );
}

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json({ limit: "10kb" }));

// Apply general rate limiting to API requests.
app.use("/api", generalRateLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Buy Me Coffee API is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
  });
});

app.use("/api/donations", donationRoutes);

// Error handler must be registered last.
app.use(errorMiddleware);

export default app;