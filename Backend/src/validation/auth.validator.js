import {body , validationResult} from "express-validator"

function validate(req , res , next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('Role is required')
        .isIn(['owner', 'staff']).withMessage('Role must be owner or staff'),
    body('restaurant_name')
        .trim()
        .if(body('role').equals('owner'))
        .notEmpty().withMessage('Restaurant name is required for owner role'),
    body('restaurant_id')
        .trim()
        .if(body('role').equals('staff'))
        .notEmpty().withMessage('Restaurant ID is required for staff role')
        .isUUID().withMessage('Restaurant ID must be a valid UUID'),
    validate
]

export const loginValidation = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
]