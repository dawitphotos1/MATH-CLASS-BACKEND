module.exports = function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    console.log("⛔ Forbidden: not admin - role was:", req.user?.role);
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
