import express from "express"
import {
    createApp,
    getApps,
    getAppStats,
    getAppById,
    updateApp,
    updateAppStatus,
    deleteApp,
    generateCoverLetterHandler
} from "../controllers/application.controller.js"
import { protect } from "../middlewares/protect.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import { aiLimiter } from "../middlewares/rateLimit.middleware.js"
import {
    createApplicationSchema,
    updateApplicationSchema,
    updateStatusSchema
} from "../schemas/application.schema.js"

const applicationRouter = express.Router()

applicationRouter.use(protect)
applicationRouter.get("/", getApps)
applicationRouter.post("/", validate(createApplicationSchema), createApp)
applicationRouter.get("/stats", getAppStats)
applicationRouter.get("/:id", getAppById)
applicationRouter.patch("/:id", validate(updateApplicationSchema), updateApp)
applicationRouter.patch("/:id/status", validate(updateStatusSchema), updateAppStatus)
applicationRouter.delete("/:id", deleteApp)
applicationRouter.post("/:id/cover-letter", aiLimiter, generateCoverLetterHandler)

export default applicationRouter
