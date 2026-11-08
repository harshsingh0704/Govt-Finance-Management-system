const Notification = require("../models/Notification");
const Employee = require("../models/Employee");
const User = require("../models/User");

/**
 * Creates and persists a notification for a specific user.
 */
async function notifyUser(userId, data) {
  if (!userId) return null;

  try {
    const notification = await Notification.create({
      recipient: userId,
      actor: data.actor || null,
      title: data.title || "Claim Update",
      message: data.message || "",
      type: data.type || "GENERAL",
      claimId: data.claimId || null,
      claimType: data.claimType || "TAClaim",
      link: data.link || "/claims",
      metadata: data.metadata || {},
    });

    return notification;
  } catch (error) {
    console.error("notifyUser failed to save notification:", error.message);
    return null;
  }
}

/**
 * Resolves an Employee document or ID to its linked User account and creates a notification.
 */
async function notifyEmployee(employeeIdentifier, data) {
  if (!employeeIdentifier) return null;

  try {
    let userId = null;

    // Check if it is already a User ID
    const userDoc = await User.findById(employeeIdentifier).select("_id");
    if (userDoc) {
      userId = userDoc._id;
    } else {
      // Find employee document
      const emp = await Employee.findById(employeeIdentifier).select("userId");
      if (emp?.userId) {
        userId = emp.userId;
      }
    }

    if (!userId) {
      console.warn(`Cannot notify employee ${employeeIdentifier}: No linked User found.`);
      return null;
    }

    return notifyUser(userId, data);
  } catch (error) {
    console.error("notifyEmployee error:", error.message);
    return null;
  }
}

/**
 * Broadcasts a notification to all users matching a specific role (e.g. HOD, HOA, Finance Officer).
 */
async function notifyRole(roleName, data, actorId = null) {
  if (!roleName) return [];

  try {
    const normalizedRole = String(roleName).trim().toLowerCase();
    const roleAliases = {
      "head of office": ["head of office", "hoa"],
      "hoa": ["head of office", "hoa"],
      "head of department": ["head of department", "hod"],
      "hod": ["head of department", "hod"],
      "finance officer": ["finance officer", "fo"],
    };
    const aliases = roleAliases[normalizedRole] || [normalizedRole];
    const roleRegexes = aliases.map((r) => new RegExp(`^${r}$`, "i"));
    const desigRegexes = aliases.map((r) => new RegExp(r, "i"));

    const users = await User.find({
      $or: [
        { role: { $in: roleRegexes } },
        { designation: { $in: desigRegexes } },
      ],
      isActive: { $ne: false },
    }).select("_id");

    const promises = users
      .filter((u) => String(u._id) !== String(actorId))
      .map((u) => notifyUser(u._id, data));

    return await Promise.all(promises);
  } catch (error) {
    console.error(`notifyRole (${roleName}) error:`, error.message);
    return [];
  }
}

module.exports = {
  notifyUser,
  notifyEmployee,
  notifyRole,
};
