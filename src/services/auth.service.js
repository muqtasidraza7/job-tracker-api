import { prisma } from "../config/db.js"

export const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }
    })
}

export const createUser = async (data) => {
    return await prisma.user.create({
        data
    })
}


export const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id: Number(id) }
    })
}

export const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id: Number(id) },
        data
    })
}
