import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 10000,
    limit: 3, 
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({ success: false, message: "Too many failed attempt to login, please try again after 10 minutes" });
    },
});