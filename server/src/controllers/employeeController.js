const Employee = require("../models/Employee");
const User = require("../models/User");

// GET /api/employees - All employees for dropdowns and lists
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    // Normalize response so frontend can easily read name, email, code
    const formatted = employees.map(emp => ({
      _id: emp._id,
      name: emp.userId?.name || emp.name || "Unnamed Employee",
      email: emp.userId?.email || emp.email || "",
      employeeCode: emp.employeeCode || "N/A",
      department: emp.department,
      designation: emp.designation,
      basicPay: emp.basicPay || 45000
    }));

    res.json({ success: true, employees: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/employees - Create new employee profile
exports.createEmployee = async (req, res) => {
  try {
    const { userId, employeeCode, department, designation, basicPay, bankAccount, ifscCode } = req.body;
    
    const employee = await Employee.create({
      userId,
      employeeCode,
      department: department || "General Administration",
      designation: designation || "Officer",
      basicPay: basicPay || 45000,
      bankAccount,
      ifscCode
    });

    res.status(201).json({ success: true, employee });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
