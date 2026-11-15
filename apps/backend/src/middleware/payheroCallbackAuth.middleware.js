import { timingSafeEqual } from "node:crypto";

export default function payHeroCallbackAuth(req, res, next) {
    const receivedToken = req.query.token;
    const expectedToken = process.env.PAYHERO_CALLBACK_TOKEN;

    if (!expectedToken || typeof receivedToken !== "string") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized callback",
        });
    }

    const received = Buffer.from(receivedToken);
    const expected = Buffer.from(expectedToken);

    if (
        received.length !== expected.length ||
        !timingSafeEqual(received, expected)
    ) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized callback",
        });
    }

    next();
}
