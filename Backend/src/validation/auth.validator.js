import {body , validationResult} from "express-validator"

function validate(req , res , next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const registerValidation = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('bio').notEmpty().withMessage('Bio is required'),
    validate
]

export const loginValidation = [
    body('emailorusername').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
]