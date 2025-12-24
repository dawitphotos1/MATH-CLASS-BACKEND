
// middleware/checkTeacherOrAdmin.js
const checkTeacherOrAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized - no user found"
            });
        }

        if (req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "Access denied - teacher or admin role required"
            });
        }

        next();
    } catch (err) {
        console.error("CheckTeacherOrAdmin error:", err.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

export default checkTeacherOrAdmin;