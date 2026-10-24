import express from "express";
import cors from "cors";

import donationRoutes from "./routes/donation.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = [
  "https://buy-me-coffee-kzvi.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Include any additional frontend URL from Render's environment.
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    ...process.env.FRONTEND_URL.split(",").map((url) => url.trim()).filter(Boolean)
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header are allowed for server-to-server use.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
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