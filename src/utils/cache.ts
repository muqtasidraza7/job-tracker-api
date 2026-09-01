import { redis } from "../config/redis.js"

export const getOrSet = async <T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> => {
    try {
        const cached = await redis.get(key)
        if (cached) {
            console.log(`[Cache HIT] Key: ${key}`)
            return JSON.parse(cached)
        }
    } catch (error) {
        console.warn(`Redis read error: ${(error as Error).message}. Falling back to DB...`)
    }

    console.log(`[Cache MISS] Key: ${key}. Fetching from DB...`)
    const data = await fetcher()

    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttl)
    } catch (error) {
        console.warn(`Redis write error: ${(error as Error).message}`)
    }
    return data
}

export const invalidate = async (key: string): Promise<void> => {
    try {
        await redis.del(key)
    } catch (error) {
        console.warn(`Redis delete error: ${(error as Error).message}`)
    }
}

export const invalidatePattern = async (pattern: string): Promise<void> => {
    try {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }
    } catch (error) {
        console.warn(`Redis pattern invalidate error: ${(error as Error).message}`)
    }
}


export const CacheKeys = {
    userStats: (userId: number) => `stats:user:${userId}`,
    userApps: (userId: number, page: number, limit: number, status?: string, search?: string) =>
        `apps:user:${userId}:p${page}:l${limit}:s${status ?? 'all'}:q${search ?? 'none'}`,
    userAppsPattern: (userId: number) => `apps:user:${userId}:*`,
}

export const invalidateUserCache = async (userId: number): Promise<void> => {
    await Promise.all([
        invalidate(CacheKeys.userStats(userId)),
        invalidatePattern(CacheKeys.userAppsPattern(userId))
    ])
}

