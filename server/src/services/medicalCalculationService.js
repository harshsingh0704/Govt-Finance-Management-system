function calculateMedicalClaim({ treatmentDetails = {}, specialistDetails = {}, advanceTaken = 0 }) {
  const treatmentTotal =
    (treatmentDetails.consultationAndInjections || 0) +
    (treatmentDetails.diagnosticTests || 0) +
    (treatmentDetails.medicines || 0) +
    (treatmentDetails.hospitalAccommodation || 0) +
    (treatmentDetails.surgeryTreatmentNursing || 0);

  const specialistFees = specialistDetails.fees || 0;

  const totalAmountClaimed = treatmentTotal + specialistFees;
  const netAmountClaimed = totalAmountClaimed - advanceTaken;

  return { totalAmountClaimed, netAmountClaimed };
}

module.exports = { calculateMedicalClaim };