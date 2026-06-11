const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { authMiddleware } = require("../middleware/auth");
const { readData, writeData } = require("../utils/fileStorage");

const router = express.Router();

/*
========================
REGISTER
POST /api/auth/register
========================
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const users = readData("users.json");

    const existingUser = users.find(
      (user) => user.email === email
    );

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      phone,
      city: city || "",
      isAdmin: false,
      createdAt: new Date(),
    };

    users.push(newUser);

    writeData("users.json", users);

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/*
========================
LOGIN
POST /api/auth/login
========================
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = readData("users.json");

    const user = users.find(
      (user) => user.email === email
    );

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/*
========================
CURRENT USER
GET /api/auth/me
========================
*/
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const users = readData("users.json");

    const user = users.find(
      (user) => user.id === req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { password, ...userData } = user;

    res.json(userData);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;