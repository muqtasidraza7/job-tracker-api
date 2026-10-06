import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import './config/redis.js'
import { errorHandler } from "./middlewares/errorHandler.middleware.js"
import authRouter from "./routes/auth.route.js"
import applicationRouter from "./routes/application.router.js"
import stageRouter from "./routes/stage.routes.js"
import { apiLimiter } from "./middlewares/rateLimit.middleware.js"
import { errorResponse } from "./utils/response.js"

import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger.js"

export const app = express()
dotenv.config()
app.use(cors())
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
)
app.use(morgan("dev"))
app.use(express.json())

const SWAGGER_CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css"
const SWAGGER_BUNDLE_JS = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js"
const SWAGGER_PRESET_JS = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Job Tracker API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    customCssUrl: SWAGGER_CSS_URL,
    customJs: [SWAGGER_BUNDLE_JS, SWAGGER_PRESET_JS],
}))
app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
})

app.get("/api/health", (req, res) => {
    return res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        environment: process.env.NODE_ENV || "development",
    })
})

app.use("/api", apiLimiter)

app.use("/api/auth", authRouter)
app.use("/api/applications", applicationRouter)
app.use("/api/applications/:id/stages", stageRouter)



app.use((req, res) => {
    return errorResponse(res, 404, `Route ${req.method} ${req.originalUrl} not found`)
})

app.use(errorHandler)