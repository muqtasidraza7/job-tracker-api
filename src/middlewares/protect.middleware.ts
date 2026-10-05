import { NextFunction, Request, Response } from "express"
import { errorResponse } from "../utils/response.js"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
        return errorResponse(res, 401, "No or Invalid Token ")
    }

    const token = header.split(" ")[1]
    try {
        const decoded = jwt.verify(token, env.JWT_KEY as string) as {
            id: number
            email: string
            name: string
            avatarUrl?: string | null
        }
        req.user = decoded
        next()
    } catch (error) {
        return errorResponse(res, 401, "Invalid or expired token")
    }

}