import {
    createApplication,
    getUserApplications,
    getApplicationById,
    updateApplication,
    deleteApplication,
    getApplicationStats
} from "../services/application.service.js"
import { generateCoverLetter } from "../services/ai.service.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { successResponse, errorResponse } from "../utils/response.js"


export const createApp = asyncHandler(async (req, res) => {
    const applicationData = {
        ...req.body,
        authorId: req.user.id
    }
    const application = await createApplication(applicationData)
    return successResponse(res, 201, application)
})


export const getApps = asyncHandler(async (req, res) => {
    const { status, search } = req.query
    const applications = await getUserApplications(req.user.id, { status, search })
    return successResponse(res, 200, applications)
})


export const getAppStats = asyncHandler(async (req, res) => {
    const stats = await getApplicationStats(req.user.id)
    return successResponse(res, 200, stats)
})


export const getAppById = asyncHandler(async (req, res) => {
    const result = await getApplicationById(req.params.id, req.user.id)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return successResponse(res, 200, result.data)
})


export const updateApp = asyncHandler(async (req, res) => {
    const result = await updateApplication(req.params.id, req.user.id, req.body)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return successResponse(res, 200, result.data)
})


export const updateAppStatus = asyncHandler(async (req, res) => {
    const result = await updateApplication(req.params.id, req.user.id, { status: req.body.status })
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return successResponse(res, 200, result.data)
})


export const deleteApp = asyncHandler(async (req, res) => {
    const result = await deleteApplication(req.params.id, req.user.id)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return res.status(204).send()
})


export const generateCoverLetterHandler = asyncHandler(async (req, res) => {
    const applicationId = req.params.id
    const userId = req.user.id

    const result = await getApplicationById(applicationId, userId)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    const coverLetter = await generateCoverLetter(result.data)

    return successResponse(res, 200, { coverLetter })
})
