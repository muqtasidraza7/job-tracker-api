import Redis, { RedisOptions } from "ioredis"
import { env } from "./env.js"


const redisOptions: RedisOptions = {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      return null
    }
    return Math.min(times * 100, 2000)
  }
}

const createRedisClient = () => {
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL, redisOptions)
  }

  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    ...redisOptions
  })
}

export const redis = createRedisClient()

redis.on("connect", () => console.log("Redis connected successfully"))
redis.on("error", (err) => console.error("Redis error:", err.message))
