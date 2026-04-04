import { createUser } from "../repository/user.repository.js";
import { findUserById } from "../repository/user.repository.js";
import { authenticateUser } from "../service/auth.service.js";
import { getAccessCookieOptions } from "../utils/cookie.util.js";
import { issueAccessToken } from "../utils/token.util.js";

export async function registerController(req, res, next) {
    try {
        const user = await createUser(req.body);
        const accessToken = issueAccessToken({ id: user.id, role: user.role });
        res.cookie("accessToken", accessToken, getAccessCookieOptions());
        res.status(201).json({ msg: "User registered successfully", user });
    } catch (error) {
        next(error);
    }
}

export async function loginController(req, res, next) {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        const accessToken = issueAccessToken({ id: user.id, role: user.role });
        res.cookie("accessToken", accessToken, getAccessCookieOptions());
        res.status(200).json({
            msg: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getMeController(req, res, next) {
    try {
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            authenticated: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}

export async function logoutController(req, res) {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
        path: "/",
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    });

    res.status(200).json({
        message: "Logged out successfully",
    });
}
