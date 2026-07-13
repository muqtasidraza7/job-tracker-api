import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { createUser, findUserByEmail, findUserById, updateUser } from "../services/auth.service.js"
import { successResponse, errorResponse } from "../utils/response.js"
export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, avatarUrl } = req.body
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
        return errorResponse(res, 400, "Email is already registered")
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await createUser({ name, email, password: hashedPassword, avatarUrl })
    const token = jwt.sign({
        id: user.id, name, email, avatarUrl
    }, process.env.JWT_KEY,
        { expiresIn: '7d' })
    return successResponse(res, 201, {
        user: { name: user.name, email: user.email, avatarUrl: avatarUrl },
        token
    })
})

export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const user = await findUserByEmail(email)
    if (!user) {
        return errorResponse(res, 401, "Invalid Email or Password")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return errorResponse(res, 401, "Invalid Email or Password")
    }

    const token = jwt.sign({
        id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl
    }, process.env.JWT_KEY,
        { expiresIn: "7d" })

    return successResponse(res, 200, {
        user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        token
    })
})



export const getMe = asyncHandler(async (req, res, next) => {
    const user = await findUserById(req.user.id)
    if (!user) {
        return errorResponse(res, 404, "User not found")
    }
    const { name, email, password, avatarUrl } = user
    return successResponse(res, 200, { id: user.id, name, email, avatarUrl })
})



export const updateMe = asyncHandler(async (req, res, next) => {
    const { name, email, password, avatarUrl } = req.body

    if (email) {
        const userWithEmail = await findUserByEmail(email)
        if (userWithEmail && userWithEmail.id !== req.user.id) {
            return errorResponse(res, 400, "Email is already registered")
        }
    }

    const updateData = { name, email, avatarUrl }

    if (password) {
        updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await updateUser(req.user.id, updateData)

    return successResponse(res, 200, {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl
    })
})
