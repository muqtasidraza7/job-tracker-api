import rateLimit from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import { env } from "../config/env.js"
import { redis } from "../config/redis.js"

const createRedisStore = (prefix: string) => {
    return new RedisStore({
        sendCommand: ((...args: string[]) => redis.call(args[0], ...args.slice(1))) as any,
        prefix: `rl:${prefix}:`
    })
}

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    store: createRedisStore("api"),
    passOnStoreError: true,
    skip: () => env.NODE_ENV === "test",
    message: {
        success: false,
        error: { statusCode: 429, message: "Too many requests from this IP, please try again after 15 minutes." }
    }
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    store: createRedisStore("auth"),
    passOnStoreError: true,
    skip: () => env.NODE_ENV === "test",
    message: {
        success: false,
        error: { statusCode: 429, message: "Too many login attempts. Please try again after 15 minutes." }
    }
})

export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    store: createRedisStore("ai"),
    passOnStoreError: true,
    skip: () => env.NODE_ENV === "test",
    message: {
        success: false,
        error: { statusCode: 429, message: "AI request limit reached. Try again in an hour." }
    }
})
