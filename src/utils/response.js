export const successResponse = (res, statusCode, data, meta) => {
    return res.status(statusCode).json({
        success: true,
        data,
        ...(meta && { meta }),
    })
}

export const errorResponse = (res, statusCode, message, details) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(details !== undefined && { details }),
        },
    })
}

