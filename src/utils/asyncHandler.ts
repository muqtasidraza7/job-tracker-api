import { NextFunction, Request, Response } from "express"

type AsyncController = (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
) => Promise<unknown>

export const asyncHandler = (fn: AsyncController) => {
    return (req: Request<any, any, any, any>, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
