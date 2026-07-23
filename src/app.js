import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { errorHandler } from "./middlewares/errorHandler.middleware.js"
import authRouter from "./routes/auth.route.js"
import applicationRouter from "./routes/application.router.js"
import stageRouter from "./routes/stage.routes.js"
import { apiLimiter } from "./middlewares/rateLimit.middleware.js"

export const app = express()
dotenv.config()
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use("/api", apiLimiter)

app.use("/api/auth", authRouter)
app.use("/api/applications", applicationRouter)
applicationRouter.use("/:id/stages", stageRouter)




app.use(errorHandler)