import { prisma } from "../config/db.js"
import { User } from "@prisma/client"
import { CreateUserInput } from "../types/service.types"

export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { email }
    })
}

export const createUser = async (data: CreateUserInput): Promise<User> => {
    return await prisma.user.create({
        data
    })
}


export const findUserById = async (id: number): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { id: Number(id) }
    })
}

export const updateUser = async (id: number, data: Partial<CreateUserInput>): Promise<User> => {
    return await prisma.user.update({
        where: { id: Number(id) },
        data
    })
}
