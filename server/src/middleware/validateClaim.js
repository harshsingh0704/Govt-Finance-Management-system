// server/src/middleware/validateClaim.js

const validateClaimInput = (req, res, next) => {
  const { 
    employeeId, 
    fare, 
    roadMileage, 
    dailyAllowance, 
    accommodationCharges, 
    advanceAdjusted,
    fareClaimed,
    advanceTaken,
    treatmentCost,
    doctorConsultationFee,
    advanceDrawn
  } = req.body;

  // Numeric fields array for automated negativity check
  const numericFields = {
    fare,
    roadMileage,
    dailyAllowance,
    accommodationCharges,
    advanceAdjusted,
    fareClaimed,
    advanceTaken,
    treatmentCost,
    doctorConsultationFee,
    advanceDrawn
  };

  for (const [key, value] of Object.entries(numericFields)) {
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num)) {
        return res.status(400).json({
          success: false,
          message: `Field '${key}' must be a valid number.`
        });
      }
      if (num < 0) {
        return res.status(400).json({
          success: false,
          message: `Field '${key}' cannot be negative.`
        });
      }
    }
  }

  next();
};

module.exports = {
  validateClaimInput
};