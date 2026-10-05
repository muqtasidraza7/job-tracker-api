import { z } from "zod"

const stageTypeEnum = z.enum([
    "PHONE_SCREEN",
    "TECHNICAL",
    "HR",
    "ASSIGNMENT",
    "FINAL",
    "OFFER"
])

const stageResultEnum = z.enum([
    "PENDING",
    "PASSED",
    "FAILED",
    "CANCELLED"
])

export const createStageSchema = z.object({
    type: stageTypeEnum,
    scheduledAt: z.coerce.date().optional(),
    completedAt: z.coerce.date().optional(),
    notes: z.string().optional(),
    result: stageResultEnum.optional().default("PENDING")
})

export const updateStageSchema = z.object({
    type: stageTypeEnum.optional(),
    scheduledAt: z.coerce.date().optional(),
    completedAt: z.coerce.date().optional(),
    notes: z.string().optional(),
    result: stageResultEnum.optional()
})

export const stageParamSchema = z.object({
    id: z.coerce.number().int().positive("Application ID must be a positive integer"),
    stageId: z.coerce.number().int().positive("Stage ID must be a positive integer").optional()
});

