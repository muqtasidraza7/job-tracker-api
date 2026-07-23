import { prisma } from "../config/db.js"

export const createApplication = async (data) => {
    return await prisma.application.create({ data })
}


export const getUserApplications = async (userId, filter = {}, pagination = {}) => {
    const { status, search } = filter
    const page = Math.max(1, Number(pagination.page)) || 1
    const limit = Math.min(100, Number(pagination.limit)) || 10
    const skip = (page - 1) * limit

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
    const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({ where, skip, take: limit, }),
        prisma.application.count({ where })
    ])
    return {
        data: applications,
        meta: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
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

    if (application.authorId !== Number(userId)) {
        return { status: 403, message: "User not Authorized" }
    }

    const updatedApp = await prisma.application.update({
        where: { id: Number(applicationId) },
        data: updateData
    })
    return { data: updatedApp }

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

