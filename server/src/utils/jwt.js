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
