import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 10 * 60* 1000, // 10 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: "Too many attempt to login, please try again after 10 minutes",
});