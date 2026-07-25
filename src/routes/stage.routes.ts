import express from "express"
import {
    addStage,
    getStages,
    updateStageHandler,
    deleteStageHandler
} from "../controllers/stage.controller.js"
import { validate } from "../middlewares/validate.middleware.js"
import { createStageSchema, updateStageSchema } from "../schemas/stage.schema.js"

const stageRouter = express.Router({ mergeParams: true })

stageRouter.get("/", getStages)
stageRouter.post("/", validate(createStageSchema), addStage)

stageRouter.patch("/:stageId", validate(updateStageSchema), updateStageHandler)
stageRouter.delete("/:stageId", deleteStageHandler)

export default stageRouter
