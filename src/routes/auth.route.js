import express from "express"
import { getMe, loginUser, registerUser, updateMe } from "../controllers/auth.controller.js"
import { protect } from "../middlewares/protect.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import { registerSchema, loginSchema, updateMeSchema } from "../schemas/auth.schema.js"


const authRouter = express.Router()

authRouter.post("/register", validate(registerSchema), registerUser)
authRouter.post("/login", validate(loginSchema), loginUser)
authRouter.get("/me", protect, getMe)
authRouter.patch("/me", protect, validate(updateMeSchema), updateMe)

export default authRouter