import express from "express";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["Admin"]));

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!["Admin", "Operator", "Viewer"].includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user._id.toString() === req.user.id) {
      res.status(400).json({ success: false, message: "Cannot change your own role" });
      return;
    }

    if (role === "Admin") {
      const adminExists = await User.findOne({ role: "Admin" });
      if (adminExists) {
        res.status(400).json({ success: false, message: "An Admin already exists. Only 1 Admin is allowed." });
        return;
      }
    }

    user.role = role as any;
    await user.save();

    res.json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user._id.toString() === req.user.id) {
      res.status(400).json({ success: false, message: "Cannot delete yourself" });
      return;
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
