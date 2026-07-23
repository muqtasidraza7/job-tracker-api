import {
    createStage,
    getStagesByApplicationId,
    updateStage,
    deleteStage
} from "../services/stage.service.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { successResponse, errorResponse } from "../utils/response.js"

export const addStage = asyncHandler(async (req, res) => {
    const applicationId = req.params.id
    const userId = req.user.id

    const result = await createStage(applicationId, userId, req.body)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return successResponse(res, 201, result.data)
})

export const getStages = asyncHandler(async (req, res) => {
    const applicationId = req.params.id
    const userId = req.user.id

    const result = await getStagesByApplicationId(applicationId, userId)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return successResponse(res, 200, result.data)
})

export const updateStageHandler = asyncHandler(async (req, res) => {
    const stageId = req.params.stageId
    const userId = req.user.id

    const result = await updateStage(stageId, userId, req.body)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return successResponse(res, 200, result.data)
})

export const deleteStageHandler = asyncHandler(async (req, res) => {
    const stageId = req.params.stageId
    const userId = req.user.id

    const result = await deleteStage(stageId, userId)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    return res.status(204).send()
})
