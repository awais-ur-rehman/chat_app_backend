const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Signup route for users and fixers
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialty } = req.body;
  try {
    const user = new User({ name, email, password, role, specialty });
    await user.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route for users and fixers
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, role });
    if (!user || !(await user.comparePassword(password))) {
      console.log("here1");
      return res.status(400).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful", user });
    console.log("success");
  } catch (error) {
    console.log("here2");
    res.status(500).json({ error: error.message });
  }
});

// Get users or fixers based on role
router.get("/list/:role", async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.find({ role });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
