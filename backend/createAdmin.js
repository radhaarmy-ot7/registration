require("dotenv").config();
const bcrypt = require("bcryptjs");
const { readData, writeData } = require("./utils/fileStorage");

const createAdmin = async () => {
  try {
    const users = readData("users.json");

    const adminExists = users.find(
      (user) => user.email === process.env.ADMIN_EMAIL
    );

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    const admin = {
      id: Date.now().toString(),
      name: "Admin User",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      phone: "9999999999",
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };

    users.push(admin);
    writeData("users.json", users);

    console.log("✅ Admin created successfully!");
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();