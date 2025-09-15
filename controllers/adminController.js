const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", { email });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      console.log("Login failed: User not found", { email });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login failed: Incorrect password", { email });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.approval_status !== "approved") {
      console.log("Login failed: Account not approved", {
        email,
        approval_status: user.approval_status,
      });
      return res.status(403).json({ error: "Account pending approval" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, // 🔄 use `userId` consistently
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful:", { email, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
