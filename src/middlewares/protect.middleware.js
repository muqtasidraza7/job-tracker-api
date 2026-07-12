import { errorResponse, successResponse } from "../utils/response.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const protect = asyncHandler(async (req, res, next) => {
    const header = req.header.authorization
    if (!header || header.startsWith("Bearer ")) {
        return errorResponse(res, 401, "No or Invalid Token ")
    }

    const token = header.split(" ")[1]
    const decode = await jwt.verify(token, process.env.JWT_KEY)
    req.user = decode
})