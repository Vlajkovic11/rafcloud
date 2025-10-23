import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";
import { generateToken } from "../utils/jwt.js";

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        // await prisma.user.update({
        //     where: { id: user.id },
        //     data: { status: true },
        // });

        const token = generateToken(user);
        // console.log(`LOGIN: ${JSON.stringify(res)}`);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.id, fullName: user.fullName, email: user.email },
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
    const { userId } = req.body;
    try {

        await prisma.user.update({
            where: { id: userId },
            data: { status: false }
        });

        res.json({
            success: true,
            message: "Logout successful"
        });
    } catch (err) {
        res.status(500).json({ error: "Logout failed" });
    }
};
