import { Request, Response } from "express"
import {
    createStage,
    getStagesByApplicationId,
    updateStage,
    deleteStage
} from "../services/stage.service.js"
import { asyncHandler } from "../utils/asyncHandler"
import { successResponse, errorResponse } from "../utils/response.js"
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

    const result = await createStage(applicationId, userId, req.body)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return successResponse(res, 201, result.data)
})

export const getStages = asyncHandler(async (req: Request<StageParams>, res: Response) => {
    const applicationId = Number(req.params.id)
    const userId = req.user!.id

    const result = await getStagesByApplicationId(applicationId, userId)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return successResponse(res, 200, result.data)
})

export const updateStageHandler = asyncHandler(async (req: Request<StageDetailParams, {}, Partial<CreateStageInput>>, res: Response) => {
    const stageId = Number(req.params.stageId)
    const userId = req.user!.id

    const result = await updateStage(stageId, userId, req.body)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return successResponse(res, 200, result.data)
})

export const deleteStageHandler = asyncHandler(async (req: Request<StageDetailParams>, res: Response) => {
    const stageId = Number(req.params.stageId)
    const userId = req.user!.id

    const result = await deleteStage(stageId, userId)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return res.status(204).send()
})
