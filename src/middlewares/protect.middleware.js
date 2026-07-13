import { errorResponse, successResponse } from "../utils/response.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const protect = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
        return errorResponse(res, 401, "No or Invalid Token ")
    }

    const token = header.split(" ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.user = decoded
        next()
    } catch (error) {
        return errorResponse(res, 401, "Invalid or expired token")
    }

})