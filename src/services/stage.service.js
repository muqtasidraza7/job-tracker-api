import { prisma } from "../config/db.js"

export const getStagesByApplicationId = async (applicationId, userId) => {
    const app = await prisma.application.findUnique({
        where: { id: Number(applicationId) }
    })
    if (!app || app.authorId !== Number(userId)) {
        return { status: 403, message: "Unauthorized or Application not found" }
    }

    const stages = await prisma.interviewStage.findMany({
        where: { applicationId: Number(applicationId) },
        orderBy: { scheduledAt: 'asc' }
    })
    return { data: stages }
}

export const createStage = async (applicationId, userId, stageData) => {
    const app = await prisma.application.findUnique({
        where: { id: Number(applicationId) },
        include: { stages: true }
    })

    if (!app) {
        return { status: 404, message: "Application not found" }
    }
    if (app.authorId !== Number(userId)) {
        return { status: 403, message: "Unauthorized" }
    }


    const isFirstStage = app.stages.length === 0
    const shouldUpdateStatus = isFirstStage && app.status === "APPLIED"


    return await prisma.$transaction(async (tx) => {
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

        return { data: stage }
    })
}

export const updateStage = async (stageId, userId, updateData) => {

    const stage = await prisma.interviewStage.findUnique({
        where: { id: Number(stageId) },
        include: { application: true }
    })

    if (!stage) {
        return { status: 404, message: "Stage not found" }
    }
    if (stage.application.authorId !== Number(userId)) {
        return { status: 403, message: "Unauthorized" }
    }

    const updatedStage = await prisma.interviewStage.update({
        where: { id: Number(stageId) },
        data: updateData
    })
    return { data: updatedStage }
}

export const deleteStage = async (stageId, userId) => {
    const stage = await prisma.interviewStage.findUnique({
        where: { id: Number(stageId) },
        include: { application: true }
    })

    if (!stage) {
        return { status: 404, message: "Stage not found" }
    }
    if (stage.application.authorId !== Number(userId)) {
        return { status: 403, message: "Unauthorized" }
    }

    await prisma.interviewStage.delete({
        where: { id: Number(stageId) }
    })
    return { data: true }
}
