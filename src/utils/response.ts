import { Response } from "express"

export const successResponse = <T, M>(res: Response, statusCode: number, data: T, meta?: M): Response => {
    return res.status(statusCode).json({
        success: true,
        data,
        ...(meta && { meta }),
    })
}

export const errorResponse = <D>(res: Response, statusCode: number, message: string, details?: D): Response => {
    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(details !== undefined && { details }),
        },
    })
}

