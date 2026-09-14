function calculateLTCClaim({ fareClaimed = 0, advanceTaken = 0 }) {
  const grossAmount = fareClaimed;
  const netAmount = grossAmount - advanceTaken;
  return { grossAmount, netAmount };
}

module.exports = { calculateLTCClaim };