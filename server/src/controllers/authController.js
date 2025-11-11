import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";
import { generateToken } from "../utils/jwt.js";

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { permissions: true },
        });

        // console.log(`KORISNIK: ${JSON.stringify(user)}`);

        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const token = generateToken(user);
        // console.log(`LOGIN: ${JSON.stringify(res)}`);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                permissions: user.permissions.map(p => p.name),
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, error: "Login failed" });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        // console.log(`PODACI SA FRONTA: ${JSON.stringify(fullName)} , ${JSON.stringify(email)} , ${JSON.stringify(password)}`);
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Email already in use" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, error: "Registration failed" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Logout successful"
        });
    } catch (err) {
        res.status(500).json({ error: "Logout failed" });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id; // id from token

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { permissions: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            permissions: user.permissions.map(p => p.name),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};