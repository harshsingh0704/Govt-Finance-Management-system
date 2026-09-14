function calculateTAClaim({ fare = 0, roadMileage = 0, dailyAllowance = 0, accommodationCharges = 0, advanceAdjusted = 0 }) {
  const grossAmount = fare + roadMileage + dailyAllowance + accommodationCharges;
  const netAmount = grossAmount - advanceAdjusted;
  return { grossAmount, netAmount };
}

module.exports = { calculateTAClaim };