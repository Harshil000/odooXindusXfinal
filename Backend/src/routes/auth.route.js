import express from 'express'
import * as authController from "../controller/auth.controller.js"
import * as authValidator from "../validation/auth.validator.js"

const authRoute = express.Router()

authRoute.post('/register', authValidator.registerValidation, authController.registerController)
authRoute.post('/login', authValidator.loginValidation, authController.loginController)

export default authRoute;