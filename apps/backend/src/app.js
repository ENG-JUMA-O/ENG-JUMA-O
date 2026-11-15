
import express from "express";
import morgan from "morgan";

import payHeroRouter from "./routes/payhero.router.js";

const app = express();

app.use(morgan("dev"));

app.use(
    express.json({
        verify: (req, res, buffer) => {
            if (req.originalUrl.split("?")[0] === "/api/payhero/callback") {
                req.rawBody = Buffer.from(buffer);
            }
        },
    })
);

app.use(express.urlencoded({ extended: true }));

app.use("/api/payhero", payHeroRouter);

export default app;
