import { errorResponse } from "../utils/response.js"

export const errorHandler = (err, req, res, next) => {
    console.error(err)

    const statusCode = err.statusCode || 500
    const message = statusCode === 500 ? 'Something went wrong' : err.message

    return errorResponse(res, statusCode, message)
}

