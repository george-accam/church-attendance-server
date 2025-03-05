import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 10 * 60* 1000, // 10 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    skip: (req, res)=> res.statusCode === 200, // skip successful response
    // message: "Too many attempt to login, please try again after 10 minutes",
    handler: (req, res) => {
        res.status(429).json({ success: false, message: "Too many failed attempt to login, please try again after 10 minutes" });
    }
});