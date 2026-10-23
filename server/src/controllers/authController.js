const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

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


const formatUser = async (user) => {
  const formattedUser = {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: String(user.role || "").toLowerCase(),
    roleName: user.role,
  };

  if (String(user.role || "").toLowerCase() === "employee") {
    // First, find the employee linked to this User account.
    let employee = await Employee.findOne({
      userId: user._id,
    })
      .select(
        "_id userId employeeId employeeCode email department designation functionalAssignment"
      )
      .lean();

    // If no link exists, look for one unique, unlinked profile
    // with the same email. Never guess between multiple matches.
    if (!employee && user.email) {
      const matches = await Employee.find({
        email: String(user.email).trim().toLowerCase(),
        $or: [
          { userId: null },
          { userId: { $exists: false } },
        ],
      })
        .select(
          "_id userId employeeId employeeCode email department designation functionalAssignment"
        )
        .limit(2)
        .lean();

      if (matches.length === 1) {
        const candidate = matches[0];

        const result = await Employee.updateOne(
          {
            _id: candidate._id,
            $or: [
              { userId: null },
              { userId: { $exists: false } },
            ],
          },
          {
            $set: { userId: user._id },
          }
        );

        if (result.modifiedCount === 1) {
          employee = {
            ...candidate,
            userId: user._id,
          };
        } else {
          // Another operation may have linked the record meanwhile.
          employee = await Employee.findOne({
            userId: user._id,
          })
            .select(
              "_id userId employeeId employeeCode email department designation functionalAssignment"
            )
            .lean();
        }
      }
    }

    formattedUser.employeeProfileId = employee?._id?.toString() || null;

    // Keep employeeId as the Employee document ID for compatibility
    // with the existing claims page.
    formattedUser.employeeId = employee?._id?.toString() || null;

    // Preserve the separate business identifier.
    formattedUser.employeeCode = employee?.employeeCode || null;
    formattedUser.employeeNumber = employee?.employeeId || null;

    formattedUser.employee = employee
      ? {
          _id: employee._id.toString(),
          id: employee._id.toString(),
          employeeId: employee._id.toString(),
          employeeCode: employee.employeeCode || "",
          department: employee.department || "",
          designation: employee.designation || "",
          functionalAssignment: employee.functionalAssignment || null,
        }
      : null;

    if (!employee) {
      console.warn(
        `Employee profile not found for login account: ${user.email}`
      );
    }
  }

  return formattedUser;
};


// Registration: public registration creates Employee accounts only.
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
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

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "Employee",
    });

    const formattedUser = await formatUser(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user),
      user: formattedUser,
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

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    // Password is excluded by default in the User schema.
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    if (typeof user.comparePassword !== "function") {
      console.error(
        "Authentication error: comparePassword is missing from the User model."
      );

      return res.status(500).json({
        success: false,
        error: "Server authentication configuration error.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const formattedUser = await formatUser(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      user: formattedUser,
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