const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    // Role Normalization for Enum validation
    if (role) {
      const lower = role.toLowerCase().trim();
      if (lower === 'super admin' || lower === 'superadmin') role = 'Super Admin';
      else if (lower === 'admin') role = 'Admin';
      else if (lower === 'employee') role = 'Employee';
    } else {
      role = 'Admin';
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, message: "User registered successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
