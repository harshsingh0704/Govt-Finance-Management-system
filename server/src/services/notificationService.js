
const Employee = require("../models/Employee");

// Resolve an Employee document to its linked User account.
async function notifyEmployee(employeeId, notification) {
  const employee = await Employee.findById(employeeId).select("userId");

  if (!employee?.userId) {
    console.warn(
      `Cannot notify employee ${employeeId}: no linked User account.`
    );
    return null;
  }

  return notifyUser(employee.userId, notification);
}

module.exports.notifyEmployee = notifyEmployee;
