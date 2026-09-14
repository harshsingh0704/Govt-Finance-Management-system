const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===============================
// Global Middleware
// ===============================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================
// API Routes
// ===============================

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const permissionRoutes = require("./src/routes/permissionRoutes");

const taRoutes = require("./src/routes/taRoutes");
const ltcRoutes = require("./src/routes/ltcRoutes");
const medicalRoutes = require("./src/routes/medicalRoutes");

const payrollRoutes = require("./src/routes/payrollRoutes");
const payslipRoutes = require("./src/routes/payslipRoutes");

const approvalRoutes = require("./src/routes/approvalRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

// ===============================
// Route Mounting
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

app.use("/api/ta", taRoutes);
app.use("/api/ltc", ltcRoutes);
app.use("/api/medical", medicalRoutes);

app.use("/api/payroll", payrollRoutes);
app.use("/api/payslips", payslipRoutes);

app.use("/api/approvals", approvalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Fleet Management System API is running",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});

// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// ===============================
// Global Error Handler
// ===============================

const errorMiddleware = require("./src/middleware/errorMiddleware");

app.use(errorMiddleware);

module.exports = app;