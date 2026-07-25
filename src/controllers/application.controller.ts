import { Request, Response } from "express"
import { ApplicationStatus } from '@prisma/client'
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

interface CreateApplicationBody {
    companyName: string
    position: string
    jobUrl?: string
    status?: ApplicationStatus
    minSalary?: number
    maxSalary?: number
    location?: string
    notes?: string
    appliedAt?: Date
}

interface ApplicationParams {
    id: string
}

interface ApplicationQuery {
    status?: ApplicationStatus
    search?: string
    page?: string
    limit?: string
}


export const createApp = asyncHandler(async (
    req: Request<{}, {}, CreateApplicationBody>,
    res: Response
) => {
    const applicationData = {
        ...req.body,
        authorId: req.user!.id
    }
    const application = await createApplication(applicationData)
    return successResponse(res, 201, application)
})


export const getApps = asyncHandler(async (
    req: Request<{}, {}, {}, ApplicationQuery>,
    res: Response
) => {
    const { status, search, page, limit } = req.query
    const result = await getUserApplications(req.user!.id, { status, search, page, limit })
    return successResponse(res, 200, result.data, result.meta)
})

export const getAppStats = asyncHandler(async (
    req: Request,
    res: Response
) => {
    const stats = await getApplicationStats(req.user!.id)
    return successResponse(res, 200, stats)
})


export const getAppById = asyncHandler(async (
    req: Request<ApplicationParams>,
    res: Response
) => {
    const result = await getApplicationById(Number(req.params.id), req.user!.id)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return successResponse(res, 200, result.data)
})

export const updateApp = asyncHandler(async (
    req: Request<ApplicationParams, {}, Partial<CreateApplicationBody>>,
    res: Response
) => {
    const result = await updateApplication(Number(req.params.id), req.user!.id, req.body)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return successResponse(res, 200, result.data)
})

export const updateAppStatus = asyncHandler(async (
    req: Request<ApplicationParams, {}, { status: ApplicationStatus }>,
    res: Response
) => {
    const result = await updateApplication(Number(req.params.id), req.user!.id, { status: req.body.status })
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return successResponse(res, 200, result.data)
})

export const deleteApp = asyncHandler(async (
    req: Request<ApplicationParams>,
    res: Response
) => {
    const result = await deleteApplication(Number(req.params.id), req.user!.id)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }
    return res.status(204).send()
})

export const generateCoverLetterHandler = asyncHandler(async (
    req: Request<ApplicationParams>,
    res: Response
) => {
    const applicationId = Number(req.params.id)
    const userId = req.user!.id

    const result = await getApplicationById(applicationId, userId)
    if (result.status) {
        return errorResponse(res, result.status, result.message)
    }

    const coverLetter = await generateCoverLetter(result.data!)

    return successResponse(res, 200, { coverLetter })
})
