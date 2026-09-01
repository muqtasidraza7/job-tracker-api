import { prisma } from "../config/db.js"
import { Application, ApplicationStatus } from "@prisma/client"
import {
    CreateApplicationInput,
    GetApplicationsFilter,
    ServiceResult,
    PaginatedApplications
} from "../types/service.types.js"
import { Prisma } from "@prisma/client"
import { getOrSet, CacheKeys, invalidateUserCache } from "../utils/cache.js"

export const createApplication = async (data: CreateApplicationInput): Promise<Application> => {
    const application = await prisma.application.create({ data })
    await invalidateUserCache(data.authorId)
    return application
}

export const getUserApplications = async (
    userId: number,
    filter: GetApplicationsFilter = {}
): Promise<PaginatedApplications> => {
    const { status, search, page: rawPage, limit: rawLimit } = filter
    const page = Math.max(1, Number(rawPage) || 1)
    const limit = Math.min(50, Number(rawLimit) || 10)
    const cacheKey = CacheKeys.userApps(userId, page, limit, status, search)
    return getOrSet(
        cacheKey,
        async () => {
            const skip = (page - 1) * limit
            const where: Prisma.ApplicationWhereInput = { authorId: userId }
            if (status) where.status = status as ApplicationStatus
            if (search) {
                where.OR = [
                    { companyName: { contains: search, mode: "insensitive" } },
                    { position: { contains: search, mode: "insensitive" } }
                ]
            }

            const [applications, total] = await Promise.all([
                prisma.application.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: { stages: { select: { type: true, result: true } } }
                }),
                prisma.application.count({ where })
            ])

            return {
                applications,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            }
        },
        60
    )
}


export const getApplicationById = async (
    applicationId: number,
    userId: number
): Promise<ServiceResult<Application>> => {
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

export const updateApplication = async (
    applicationId: number,
    userId: number,
    updateData: Partial<CreateApplicationInput>
): Promise<ServiceResult<Application>> => {
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
    await invalidateUserCache(userId)

    return { data: updatedApp }
}

export const deleteApplication = async (
    applicationId: number,
    userId: number
): Promise<ServiceResult<boolean>> => {
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
    await invalidateUserCache(userId)

    return { data: true }
}

export const getApplicationStats = async (
    userId: number
): Promise<{
    total: number
    thisWeek: number
    byStatus: Record<string, number>
}> => {
    const authorId = Number(userId)

    return getOrSet(
        CacheKeys.userStats(authorId),
        async () => {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const [total, thisWeek, statusGroup] = await Promise.all([
                prisma.application.count({ where: { authorId } }),
                prisma.application.count({ where: { authorId, createdAt: { gte: sevenDaysAgo } } }),
                prisma.application.groupBy({
                    by: ["status"],
                    where: { authorId },
                    _count: { _all: true }
                })
            ])

            const byStatus = statusGroup.reduce<Record<string, number>>((acc: any, curr: any) => {
                acc[curr.status] = curr._count._all
                return acc
            }, {})

            return {
                total,
                thisWeek,
                byStatus
            }
        },
        300
    )
}
