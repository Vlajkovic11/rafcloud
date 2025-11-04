import prisma from "../prismaClient.js";

export const getAllPermissions = async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch permissions" });
    }
};
