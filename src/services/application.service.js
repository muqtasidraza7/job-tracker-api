import { prisma } from "../config/db.js"

export const createApplication = async (data) => {
    return await prisma.application.create({ data })
}


export const getUserApplications = async (userId, filter = {}) => {
    const { status, search } = filter
    const where = {
        authorId: Number(userId)
    }
    if (status) {
        where.status = status
    }

    if (search) {
        where.OR = [
            { companyName: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } }
        ]
    }

    return await prisma.application.findMany({ where })
}

export const getApplicationById = async (applicationId, userId) => {
    const application = await prisma.application.findUnique({
        where: { id: Number(applicationId) }
    })

    if (!application) {
        return { status: 404, message: "Application not found" }
    }

    if (application.authorId !== Number(userId)) {
        return { status: 403, message: "User not Authorized" }
    }

    return { data: application }
}

export const updateApplication = async (applicationId, userId, updateData) => {
    const application = await prisma.application.findUnique({
        where: { id: Number(applicationId) }
    })
    if (!application) {
        return { status: 404, message: "Application not found" }
    }

    if (application.authorId != Number(userId)) {
        return { status: 403, message: "User not Authorized" }
    }

    return await prisma.application.update({
        where: { id: Number(applicationId) },
        data: updateData
    })
}

export const deleteApplication = async (applicationId, userId) => {
    const application = await prisma.application.findUnique({
        where: { id: Number(applicationId) }
    })

    if (!application) {
        return { status: 404, message: "Application not found" }
    }

    if (application.authorId !== Number(userId)) {
        return { status: 403, message: "User not Authorized" }
    }

    await prisma.application.delete({
        where: { id: Number(applicationId) }
    })

    return { data: true }
}


export const getApplicationStats = async (userId) => {
    const authorId = Number(userId)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const [total, thisWeek, statusGroup] = await Promise.all([
        prisma.application.count({
            where: { authorId }
        }),

        prisma.application.count({
            where: { authorId, createdAt: { gte: sevenDaysAgo } }
        }),


        prisma.application.groupBy({
            by: ["status"],
            where: { authorId },
            _count: { _all: true }
        })
    ])

    const byStatus = statusGroup.reduce((acc, curr) => {
        acc[curr.status] = curr._count._all
        return acc
    }, {})

    return {
        total,
        thisWeek,
        byStatus
    }
}

