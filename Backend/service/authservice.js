
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const router = express.Router();

router.use(cookieParser());

const users = [];
let refreshTokens = [];

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

function generateRefreshToken(user) {
    const token = jwt.sign(
        { id: user.id, email: user.email },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    refreshTokens.push(token);
    return token;
}


router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            email,
            password: hashedPassword
        };

        users.push(newUser);

        res.status(201).json({
            success: true,
            message: "User registered successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(
            user => user.email === email
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth"
        });

        res.json({
            success: true,
            accessToken
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.post("/refresh", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(401).json({
            success: false,
            message: "Invalid or missing refresh token."
        });
    }

    jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        (error, user) => {
            if (error) {
                return res.status(403).json({
                    success: false,
                    message: "Token verification failed."
                });
            }

            const newAccessToken = generateAccessToken(user);

            res.json({
                success: true,
                accessToken: newAccessToken
            });
        }
    );
});


router.post("/logout", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    refreshTokens = refreshTokens.filter(
        token => token !== refreshToken
    );

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth"
    });

    res.json({
        success: true,
        message: "Logged out successfully."
    });
});


router.get("/protected", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required."
        });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                success: false,
                message: "Invalid token."
            });
        }

        res.json({
            success: true,
            message: "Protected content accessed.",
            user
        });
    });
});

module.exports = router;
