import express from "express"
import {
    addStage,
    getStages,
    updateStageHandler,
    deleteStageHandler
} from "../controllers/stage.controller.js"
import { validate } from "../middlewares/validate.middleware.js"
import { createStageSchema, stageParamSchema, updateStageSchema } from "../schemas/stage.schema.js"
import { protect } from "../middlewares/protect.middleware.js"

const stageRouter = express.Router({ mergeParams: true })

stageRouter.use(protect)
stageRouter.get("/", validate({ params: stageParamSchema }), getStages)
stageRouter.post("/", validate({ params: stageParamSchema, body: createStageSchema }), addStage)
stageRouter.patch("/:stageId", validate({ params: stageParamSchema, body: updateStageSchema }), updateStageHandler)
stageRouter.delete("/:stageId", validate({ params: stageParamSchema }), deleteStageHandler)


export default stageRouter
