import { createUser } from "../repository/user.repository.js";
import { authenticateUser } from "../service/auth.service.js";
import { getRefreshCookieOptions } from "../utils/cookie.util.js";
import { issueTokens, verifyRefreshToken } from "../utils/token.util.js";

export async function registerController(req, res, next) {
    try {
        const user = await createUser(req.body);
        const { accessToken, refreshToken } = issueTokens(user.id);
        res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
        res.status(201).json({ msg: "User registered successfully", user, accessToken });
    } catch (error) {
        next(error);
    }
}

export async function loginController(req, res, next) {
    const { emailorusername , password } = req.body;

    try {
        const user = await authenticateUser(emailorusername, password);

        const { accessToken, refreshToken } = issueTokens(user.id);
        res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
        res.status(200).json({
            msg: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAccessTokenController(req, res, next) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        const err = new Error('No refresh token provided');
        err.status = 401;
        return next(err);
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const nextTokens = issueTokens(decoded.id);
        res.cookie('refreshToken', nextTokens.refreshToken, getRefreshCookieOptions());
        res.status(200).json({ msg: "Access token issued", accessToken: nextTokens.accessToken });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            error.status = 401;
        }
        next(error);
    }
}

export async function logoutController(req, res) {
    const options = getRefreshCookieOptions();
    res.clearCookie('refreshToken', options);
    res.status(200).json({ msg: 'Logged out successfully' });
}