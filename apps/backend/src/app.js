
import express from "express";
import morgan from "morgan";

import payHeroRouter from "./routes/payhero.router.js";
import smsRouter from "./routes/sms.routes.js";

const app = express();

app.use(morgan("dev"));

app.use(
    express.json({
        verify: (req, res, buffer) => {
            const path = req.originalUrl.split("?")[0];

            if (
                path === "/api/payhero/callback" ||
                path === "/api/sms/webhook"
            ) {
                req.rawBody = Buffer.from(buffer);
            }
        },
    })
);

app.use(express.urlencoded({ extended: true }));

app.use("/api/payhero", payHeroRouter);
app.use("/api/sms", smsRouter);

export default app;
