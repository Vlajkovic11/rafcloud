import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";

// GET all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { permissions: true },
        });

        const formattedUsers = users.map(u => ({
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            permissions: u.permissions.map(p => p.name),
        }));

        res.json({ users: formattedUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// DELETE user by id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
};

// GET single user by id (za edit)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: { permissions: true },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

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

// UPDATE user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, permissions } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                fullName,
                email,
                permissions: {
                    set: [], // resetujemo postojeće
                    connect: permissions.map(pName => ({ name: pName })) // povezujemo nove permisije
                }
            },
            include: { permissions: true },
        });

        res.json({
            id: updatedUser.id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            permissions: updatedUser.permissions.map(p => p.name),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
};

export const createUser = async (req, res) => {
    try {
        const { fullName, email, password, permissions } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Napravi korisnika i poveži permisije
        const newUser = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                permissions: {
                    connect: (permissions || []).map(id => ({ id: parseInt(id) })),
                },
            },
            include: { permissions: true },
        });

        res.status(201).json({
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            permissions: newUser.permissions.map(p => p.name),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
};