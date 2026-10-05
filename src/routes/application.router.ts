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
    applicationIdParamSchema,
    createApplicationSchema,
    getApplicationsQuerySchema,
    updateApplicationSchema,
    updateStatusSchema
} from "../schemas/application.schema.js"

const applicationRouter = express.Router()

applicationRouter.use(protect)
applicationRouter.get("/", validate({ query: getApplicationsQuerySchema }), getApps)
applicationRouter.post("/", validate({ body: createApplicationSchema }), createApp)
applicationRouter.get("/stats", getAppStats)
applicationRouter.get("/:id", validate({ params: applicationIdParamSchema }), getAppById)
applicationRouter.patch("/:id", validate({ params: applicationIdParamSchema, body: updateApplicationSchema }), updateApp)
applicationRouter.patch("/:id/status", validate({ params: applicationIdParamSchema, body: updateStatusSchema }), updateAppStatus)
applicationRouter.delete("/:id", validate({ params: applicationIdParamSchema }), deleteApp)
applicationRouter.post("/:id/cover-letter", aiLimiter, validate({ params: applicationIdParamSchema }), generateCoverLetterHandler)


export default applicationRouter
