import Redis from "ioredis"
import { env } from "./env.js"


const createRedisClient = () => {
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL, { lazyConnect: true })
  }

  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    lazyConnect: true
  })
}

export const redis = createRedisClient()

redis.on("connect", () => console.log("Redis connected successfully"))
redis.on("error", (err) => console.error("Redis error:", err.message))
