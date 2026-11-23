const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_ROLES = [
  "Establishment",
  "Super Admin",
  "Admin",
  "Head of Office",
  "Head of Department",
  "Finance Officer",
  "Finance Clerk",
  "IT Cell In-charge",
  "Sample Cell In-charge",
  "Facilities/Stores In-charge",
  "Estate In-charge",
  "Vehicle In-charge",
  "Employee",
];

const LOCATIONS = [
  "Main Office",
  "Peenya Office",
  "Gottipura Field Station",
  "Kolkata Field Station",
];

const DOMAINS = [
  "Finance",
  "Admin",
  "IT Support",
  "Purchases & Receipts",
  "Estate Related",
  "Vehicle Requests",
  "Research",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "Employee" },
    location: {
      type: String,
      enum: LOCATIONS,
      default: "Main Office",
      trim: true,
    },
    domain: {
      type: String,
      enum: DOMAINS,
      default: "Finance",
      trim: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.USER_ROLES = USER_ROLES;
userSchema.statics.LOCATIONS = LOCATIONS;
userSchema.statics.DOMAINS = DOMAINS;

module.exports = mongoose.model("User", userSchema);
