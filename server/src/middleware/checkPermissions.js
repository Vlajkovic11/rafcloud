export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user?.permissions?.includes(requiredPermission)) {
            return res.status(403).json({ message: "Forbidden: missing permission" });
        }

        next();
    };
};
