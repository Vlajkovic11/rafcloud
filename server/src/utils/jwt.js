import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, fullName: user.fullName },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

export const verifyTokenMachine = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // <-- ovde dodajemo podatke iz tokena u req.user
        next(); // <-- obavezno pozovi da bi nastavilo dalje
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
};