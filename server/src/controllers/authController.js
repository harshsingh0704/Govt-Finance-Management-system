
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in the environment");
  }

  return process.env.JWT_SECRET;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: "8h" }
  );
};

const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role.toLowerCase(),
  roleName: user.role,
});

// Registration is retained for compatibility with the current controller.
// Keep public registration disabled in production; accounts should be
// created through the authorized administrative workflow.
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User already exists with this email.",
      });
    }

    // Never allow public registration to create privileged accounts.
    // Prefer disabling this endpoint entirely and creating accounts
    // through the authorized Admin workflow.
    const normalizedRole =
      role === "Employee" ? "Employee" : "Employee";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      error:
        error.message === "JWT_SECRET is not configured in the environment"
          ? "Server authentication configuration error."
          : "Unable to register user.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

   const user = await User.findOne({
  email: email.trim().toLowerCase(),
});

if (!user || user.isActive === false) {
  return res.status(401).json({
    success: false,
    error: "Invalid email or password.",
  });
}

const isPasswordValid = await user.comparePassword(password);

if (!isPasswordValid) {
  return res.status(401).json({
    success: false,
    error: "Invalid email or password.",
  });
}

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      error:
        error.message === "JWT_SECRET is not configured in the environment"
          ? "Server authentication configuration error."
          : "Unable to log in.",
    });
  }
};
