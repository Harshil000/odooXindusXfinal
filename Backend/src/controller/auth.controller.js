import { createUser } from "../repository/user.repository.js";
import { authenticateUser } from "../service/auth.service.js";
import { issueAccessToken } from "../utils/token.util.js";

export async function registerController(req, res, next) {
    try {
        const user = await createUser(req.body);
        const accessToken = issueAccessToken({ id: user.id, role: user.role });
        res.status(201).json({ msg: "User registered successfully", user, accessToken });
    } catch (error) {
        next(error);
    }
}

export async function loginController(req, res, next) {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        const accessToken = issueAccessToken({ id: user.id, role: user.role });
        res.status(200).json({
            msg: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}
