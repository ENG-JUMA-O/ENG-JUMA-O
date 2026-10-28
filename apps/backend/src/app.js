
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { generalRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

import healthRoutes from "./routes/health.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import githubRoutes from "./routes/github.routes.js";

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
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.use("/api", generalRateLimiter);

app.use("/", healthRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/github", githubRoutes);

// Keep the error handler last
app.use(errorMiddleware);

export default app;
