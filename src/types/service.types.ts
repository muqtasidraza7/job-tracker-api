import { ApplicationStatus } from '@prisma/client'
import { StageType, StageResult } from '@prisma/client';

export type ServiceResult<T> =
    | { data: T; status?: never; message?: never }
    | { status: number; message: string; data?: never }


export type CreateUserInput = {
    name: string
    email: string
    password: string
    avatarUrl?: string | null
}

export type CreateApplicationInput = {
    authorId: number
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

export type GetApplicationsFilter = {
    status?: ApplicationStatus
    search?: string
    page?: number | string
    limit?: number | string
}


export type CreateStageInput = {
    type: StageType
    scheduledAt?: Date | null
    completedAt?: Date | null
    notes?: string | null
    result?: StageResult
}