import prisma from "../prismaClient.js";
import { verifyToken } from "../utils/jwt.js";

export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ error: "No token provided" });

            const token = authHeader.split(" ")[1];
            const decoded = verifyToken(token);
            if (!decoded) return res.status(401).json({ error: "Invalid token" });

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: { permissions: true },
            });

            if (!user) return res.status(404).json({ error: "User not found" });

            const userPermissions = user.permissions.map(p => p.name);

            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({ error: `Missing permission: ${requiredPermission}` });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    };
};
