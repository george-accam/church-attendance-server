import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 10 * 60* 1000,
    limit: 2, 
    message: "Too many attempt to login, please try again after 10 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        res.status(429).json({ success: false, message: "Too many failed attempt to login, please try again after 10 minutes" });
    },
});