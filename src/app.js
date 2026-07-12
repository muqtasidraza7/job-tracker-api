import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { errorHandler } from "./middlewares/errorHandler.middleware.js"

export const app = express()
dotenv.config()
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))







app.use(errorHandler)