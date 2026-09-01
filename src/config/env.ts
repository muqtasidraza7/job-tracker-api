import dotenv from 'dotenv'
dotenv.config()

const requiredEnvVars = ['JWT_KEY', 'DATABASE_URL', 'OPENAI_API_KEY'] as const

for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`)
    }
}

export const env = {
    JWT_KEY: process.env.JWT_KEY!,
    DATABASE_URL: process.env.DATABASE_URL!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    PORT: Number(process.env.PORT ?? 3000),
    NODE_ENV: process.env.NODE_ENV ?? 'development',

    REDIS_URL: process.env.REDIS_URL,
    REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
    REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
}
