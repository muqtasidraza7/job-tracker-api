import { NextFunction, Request, Response } from "express"
import { errorResponse } from "../utils/response.js"
import { AppError } from "../utils/errors.js"
import { Prisma } from "@prisma/client"
import { env } from "../config/env.js"

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return errorResponse(res, err.statusCode, err.message)
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002": {
                const target = (err.meta?.target as string[])?.join(", ") || "field"
                return errorResponse(res, 409, `Unique constraint failed: A record with this ${target} already exists.`)
            }
            case "P2025":
                return errorResponse(res, 404, "Record not found in the database.")
            case "P2003":
                return errorResponse(res, 400, "Foreign key constraint failed on related resource.")
            default:
                return errorResponse(res, 400, `Database error: ${err.message}`)
        }
    }

    if (err.name === "JsonWebTokenError") {
        return errorResponse(res, 401, "Invalid token. Please log in again.")
    }
    if (err.name === "TokenExpiredError") {
        return errorResponse(res, 401, "Token expired. Please log in again.")
    }
    console.error("Unhandled Error:", err)

    const statusCode = 500
    const message = env.NODE_ENV === "production" ? "Internal server error" : err.message

    return errorResponse(
        res,
        statusCode,
        message,
        env.NODE_ENV === "development" ? { stack: err.stack } : undefined
    )
}
