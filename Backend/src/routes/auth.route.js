import express from 'express'
import * as authController from "../controller/auth.controller.js"
import * as authValidator from "../validation/auth.validator.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const authRoute = express.Router()

authRoute.post('/register', authValidator.registerValidation, authController.registerController)
authRoute.post('/login', authValidator.loginValidation, authController.loginController)
authRoute.get('/me', requireAuth, authController.getMeController)
authRoute.post('/logout', authController.logoutController)

export default authRoute;