// src/types/express.d.ts
export { }

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number
                email: string
                name: string
                avatarUrl?: string | null
            }
        }
    }
}
