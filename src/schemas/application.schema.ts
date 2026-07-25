import { z } from "zod"

const applicationStatusEnum = z.enum([
    "WISHLIST",
    "APPLIED",
    "INTERVIEWING",
    "OFFERED",
    "REJECTED",
    "ACCEPTED"
])


export const createApplicationSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    position: z.string().min(1, "Position is required"),
    jobUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
    status: applicationStatusEnum.optional().default("WISHLIST"),
    minSalary: z.number().int().nonnegative().optional(),
    maxSalary: z.number().int().nonnegative().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    appliedAt: z.coerce.date().optional()
}).refine((data) => {
    if (data.minSalary !== undefined && data.maxSalary !== undefined) {
        return data.maxSalary >= data.minSalary
    }
    return true
}, {
    message: "maxSalary must be greater than or equal to minSalary",
    path: ["maxSalary"]
})

export const updateApplicationSchema = z.object({
    companyName: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    jobUrl: z.string().url().optional().or(z.literal("")),
    status: applicationStatusEnum.optional(),
    minSalary: z.number().int().nonnegative().optional(),
    maxSalary: z.number().int().nonnegative().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    appliedAt: z.coerce.date().optional()
}).refine((data) => {
    if (data.minSalary !== undefined && data.maxSalary !== undefined) {
        return data.maxSalary >= data.minSalary
    }
    return true
}, {
    message: "maxSalary must be greater than or equal to minSalary",
    path: ["maxSalary"]
})

export const updateStatusSchema = z.object({
    status: applicationStatusEnum
})
