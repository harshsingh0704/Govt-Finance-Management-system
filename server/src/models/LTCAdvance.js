const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  relationship: { type: String, trim: true, default: "" },
  age: { type: Number, min: 0 },
  travelling: { type: Boolean, default: false },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
}, { _id: false });

const ltcAdvanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employeeNumber: { type: String, required: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  designation: { type: String, trim: true, default: "" },
  headquarters: { type: String, trim: true, default: "" },
  department: { type: String, trim: true, default: "" },
  payGrade: { type: String, trim: true, default: "" },
  requestDate: { type: Date, required: true },
  ltcType: { type: String, required: true, trim: true },
  blockPeriod: { type: String, trim: true, default: "" },
  graceYear: { type: String, trim: true, default: "" },
  destination: { type: String, required: true, trim: true },
  leaveFrom: { type: Date, required: true },
  leaveTo: { type: Date, required: true },
  journeyStart: { type: Date, required: true },
  journeyEnd: { type: Date, required: true },
  placeOfVisit: { type: String, trim: true, default: "" },
  transport: { type: String, trim: true, default: "" },
  trainClass: { type: String, trim: true, default: "" },
  from: { type: String, trim: true, default: "" },
  to: { type: String, trim: true, default: "" },
  estimatedFare: { type: Number, required: true, min: 0 },
  advanceRequested: { type: Number, required: true, min: 0 },
  eligibleAmount: { type: Number, required: true, min: 0 },
  family: { type: [familyMemberSchema], default: [] },
  documents: { type: [documentSchema], default: [] },
  declaration1: { type: Boolean, required: true, validate: value => value === true },
  declaration2: { type: Boolean, required: true, validate: value => value === true },
  status: {
    type: String,
    enum: ["draft", "submitted", "verified", "approved", "rejected", "paid"],
    default: "submitted",
    index: true,
  },
  remarks: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("LTCAdvance", ltcAdvanceSchema);
