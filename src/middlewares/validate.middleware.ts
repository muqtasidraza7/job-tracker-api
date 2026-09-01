import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response.js";
import { ZodObject } from "zod";
export const validate = (schema: ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const errors = result.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return errorResponse(res, 400, "Validation failed", errors);
        }

        req.body = result.data

        next()
    }
}