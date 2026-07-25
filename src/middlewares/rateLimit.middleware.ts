import rateLimit from "express-rate-limit"


export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: { statusCode: 429, message: "Too many requests from this IP, please try again after 15 minutes." }
    }
})


export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: { statusCode: 429, message: "Too many login attempts. Please try again after 15 minutes." }
    }
})


export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: { statusCode: 429, message: "AI request limit reached. Try again in an hour." }
    }
})
