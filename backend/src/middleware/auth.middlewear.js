export const protectRoute = (req, res, next) => {
    if (!req.auth().isAuthenticated) {
        return res.status(401).json({ error: "Unauthorized- you must be logged in" });
    }
    next();
};
