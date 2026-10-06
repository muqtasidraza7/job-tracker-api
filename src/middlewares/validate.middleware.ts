import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response.js";
import { ZodType } from "zod";

interface ValidationSource {
    body?: ZodType<any>;
    params?: ZodType<any>;
    query?: ZodType<any>;
}

export const validate = (schema: ZodType<any> | ValidationSource) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const sources: ValidationSource = 'safeParse' in schema ? { body: schema } : schema;

        if (sources.params) {
            const result = sources.params.safeParse(req.params);
            if (!result.success) {
                const errors = result.error.issues.map(err => ({
                    field: `params.${err.path.join('.')}`,
                    message: err.message
                }));
                return errorResponse(res, 400, "Invalid route parameters", errors);
            }
            Object.defineProperty(req, 'params', { value: result.data, writable: true, configurable: true });
        }

        if (sources.query) {
            const result = sources.query.safeParse(req.query);
            if (!result.success) {
                const errors = result.error.issues.map(err => ({
                    field: `query.${err.path.join('.')}`,
                    message: err.message
                }));
                return errorResponse(res, 400, "Invalid query parameters", errors);
            }
            Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
        }

        if (sources.body) {
            const result = sources.body.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.issues.map(err => ({
                    field: `body.${err.path.join('.')}`,
                    message: err.message
                }));
                return errorResponse(res, 400, "Validation failed", errors);
            }
            req.body = result.data;
        }

        next();
    };
};
