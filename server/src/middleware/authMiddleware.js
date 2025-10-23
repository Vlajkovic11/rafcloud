import { verifyToken } from "../utils/jwt.js";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = decoded; // korisnik se dalje koristi u kontrolerima
    next();
};
