import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(3, "The name should be atleast 3 characters"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be atleast 8 characters"),
    avatarUrl: z.string().optional()
})


export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export const updateMeSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    avatarUrl: z.string().url().optional()
}).strict()
