import { prisma } from "../config/db.js"
import { InterviewStage } from "@prisma/client"
import { CreateStageInput } from "../types/service.types.js"
import { invalidateUserCache } from "../utils/cache.js"
import { NotFoundError, ForbiddenError } from "../utils/errors.js"

export const getStagesByApplicationId = async (applicationId: number, userId: number): Promise<InterviewStage[]> => {
    const app = await prisma.application.findUnique({
        where: { id: Number(applicationId) }
    })
    if (!app) {
        throw new NotFoundError("Application not found")
    }
    if (app.authorId !== Number(userId)) {
        throw new ForbiddenError("You are not authorized to view stages for this application")
    }

    const stages = await prisma.interviewStage.findMany({
        where: { applicationId: Number(applicationId) },
        orderBy: { scheduledAt: 'asc' }
    })
    return stages
}

export const createStage = async (applicationId: number, userId: number, stageData: CreateStageInput): Promise<InterviewStage> => {
    const app = await prisma.application.findUnique({
        where: { id: Number(applicationId) },
        include: { stages: true }
    })

    if (!app) {
        throw new NotFoundError("Application not found")
    }
    if (app.authorId !== Number(userId)) {
        throw new ForbiddenError("You are not authorized to add stages to this application")
    }

    const isFirstStage = app.stages.length === 0
    const shouldUpdateStatus = isFirstStage && app.status === "APPLIED"

    const result = await prisma.$transaction(async (tx) => {
        const stage = await tx.interviewStage.create({
            data: {
                ...stageData,
                applicationId: Number(applicationId)
            }
        })

        if (shouldUpdateStatus) {
            await tx.application.update({
                where: { id: Number(applicationId) },
                data: { status: "INTERVIEWING" }
            })
        }

        return stage
    })

    await invalidateUserCache(userId)
    return result
}

export const updateStage = async (stageId: number, userId: number, updateData: Partial<CreateStageInput>): Promise<InterviewStage> => {
    const stage = await prisma.interviewStage.findUnique({
        where: { id: Number(stageId) },
        include: { application: true }
    })

    if (!stage) {
        throw new NotFoundError("Stage not found")
    }
    if (stage.application.authorId !== Number(userId)) {
        throw new ForbiddenError("You are not authorized to modify this stage")
    }

    const updatedStage = await prisma.interviewStage.update({
        where: { id: Number(stageId) },
        data: updateData
    })
    await invalidateUserCache(userId)
    return updatedStage
}

export const deleteStage = async (stageId: number, userId: number): Promise<void> => {
    const stage = await prisma.interviewStage.findUnique({
        where: { id: Number(stageId) },
        include: { application: true }
    })

    if (!stage) {
        throw new NotFoundError("Stage not found")
    }
    if (stage.application.authorId !== Number(userId)) {
        throw new ForbiddenError("You are not authorized to delete this stage")
    }

    await prisma.interviewStage.delete({
        where: { id: Number(stageId) }
    })
    await invalidateUserCache(userId)
}

