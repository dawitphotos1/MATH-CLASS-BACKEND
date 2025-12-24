
// middleware/authMiddleware.js - CORRECTED VERSION
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

// 1. Token extraction helper
const getTokenFromRequest = (req) => {
    let token = null;
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }
    return token;
};

// 2. Main authentication middleware
const authenticateToken = async (req, res, next) => {  // REMOVED 'export'
    try {
        const token = getTokenFromRequest(req);
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: ["id", "name", "email", "role", "approval_status"]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        if (user.approval_status !== "approved") {
            return res.status(403).json({
                success: false,
                error: "Account pending approval"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: "Session expired"
            });
        }
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            error: "Invalid authentication"
        });
    }
};

// 3. Role middleware generator
const requireRole = (role) => {  // REMOVED 'export'
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Not authenticated"
            });
        }
        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                error: `Requires ${role} role`
            });
        }
        next();
    };
};

// 4. Pre-configured role middlewares
const requireAdmin = requireRole("admin");  // REMOVED 'export'
const requireTeacher = requireRole("teacher");  // REMOVED 'export'
const requireStudent = requireRole("student");  // REMOVED 'export'

// 5. Multiple roles middleware
const requireRoles = (roles) => {  // REMOVED 'export'
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Not authenticated"
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Requires one of: ${roles.join(", ")}`
            });
        }
        next();
    };
};

const requireTeacherOrAdmin = requireRoles(["teacher", "admin"]);  // REMOVED 'export'

// 6. Ownership middleware
const requireOwnership = (modelName, foreignKey = "user_id") => {  // REMOVED 'export'
    return async (req, res, next) => {
        try {
            const Model = db[modelName];
            if (!Model) {
                return res.status(500).json({
                    success: false,
                    error: "Model not found"
                });
            }

            const resourceId = req.params.id || req.params.courseId || req.params.lessonId;
            const resource = await Model.findByPk(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: "Resource not found"
                });
            }

            // Admin can access anything
            if (req.user.role === "admin") {
                req.resource = resource;
                return next();
            }

            // Check ownership
            if (resource[foreignKey] !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: "Not authorized to access this resource"
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error("Ownership check error:", error);
            return res.status(500).json({
                success: false,
                error: "Authorization check failed"
            });
        }
    };
};

// 7. Approval check middleware
const requireApproved = (req, res, next) => {  // REMOVED 'export'
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: "Not authenticated"
        });
    }
    if (req.user.approval_status !== "approved") {
        return res.status(403).json({
            success: false,
            error: "Account pending approval"
        });
    }
    next();
};

// =========================================================
// SINGLE EXPORT BLOCK
// =========================================================
export {
    authenticateToken,
    requireRole,
    requireRoles,
    requireAdmin,
    requireTeacher,
    requireStudent,
    requireTeacherOrAdmin,
    requireApproved,
    requireOwnership
};