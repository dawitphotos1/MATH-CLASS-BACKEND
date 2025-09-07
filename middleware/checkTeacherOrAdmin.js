
module.exports = function checkTeacherOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const allowedRoles = ["teacher", "admin"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};
