import express from 'express'
import multer from 'multer'
import * as authController from "../controller/auth.controller.js"
import * as authValidator from "../validation/auth.validator.js"

const authRoute = express.Router()
const upload = multer({
    storage: multer.memoryStorage()
})

authRoute.post('/register', upload.single('profile_picture'), authValidator.registerValidation, authController.registerController)
authRoute.post('/login', authValidator.loginValidation, authController.loginController)
authRoute.post('/refresh', authController.getAccessTokenController)
authRoute.get('/refresh', authController.getAccessTokenController)
authRoute.post('/logout', authController.logoutController)

export default authRoute;