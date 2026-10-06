import { app } from "./app.js";
import { prisma } from "./config/db.js";
import { redis } from "./config/redis.js";
import { env } from "./config/env.js";

const PORT = env.PORT || 3000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected");

        try {
            if (redis.status === "wait") {
                await redis.connect();
            }
            await redis.ping();
        } catch (redisError) {
            console.warn("Failed to connect to Redis. Server running without caching:", (redisError as Error).message);
        }

        app.listen(PORT, () => {
            console.log(`Server is listening at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();