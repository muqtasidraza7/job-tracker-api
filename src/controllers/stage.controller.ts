import { Request, Response } from "express"
import {
    createStage,
    getStagesByApplicationId,
    updateStage,
    deleteStage
} from "../services/stage.service.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse } from "../utils/response.js"
import { CreateStageInput } from "../types/service.types.js"

interface StageParams {
    id: string
}

interface StageDetailParams {
    id: string
    stageId: string
}

export const addStage = asyncHandler(async (req: Request<StageParams, {}, CreateStageInput>, res: Response) => {
    const applicationId = Number(req.params.id)
    const userId = req.user!.id

    const stage = await createStage(applicationId, userId, req.body)
    return successResponse(res, 201, stage)
})

export const getStages = asyncHandler(async (req: Request<StageParams>, res: Response) => {
    const applicationId = Number(req.params.id)
    const userId = req.user!.id

    const stages = await getStagesByApplicationId(applicationId, userId)
    return successResponse(res, 200, stages)
})

export const updateStageHandler = asyncHandler(async (req: Request<StageDetailParams, {}, Partial<CreateStageInput>>, res: Response) => {
    const stageId = Number(req.params.stageId)
    const userId = req.user!.id

    const updatedStage = await updateStage(stageId, userId, req.body)
    return successResponse(res, 200, updatedStage)
})

export const deleteStageHandler = asyncHandler(async (req: Request<StageDetailParams>, res: Response) => {
    const stageId = Number(req.params.stageId)
    const userId = req.user!.id

    await deleteStage(stageId, userId)
    return res.status(204).send()
})

