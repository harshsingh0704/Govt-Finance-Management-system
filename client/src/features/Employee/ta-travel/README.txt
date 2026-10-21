Employee TA & Travel form patch
================================

Files
- TATravelPage.jsx
- TATravelPage.css

Target folder:
client/src/features/Employee/ta-travel/

Integration
The supplied EmployeeDashboardPage.jsx already imports:
  import TATravelPage from "../ta-travel/TATravelPage.jsx";
and renders it for the "TA & Travel" section, so no router change is needed
for the current dashboard-based navigation. The employee dashboard route
itself remains protected by ProtectedRoute and RoleRoute.

Important limitation
The source TAClaimPage form currently validates the form and stores submitted
records only in component state. This copied UI therefore does not persist a
claim to the server. Do not treat a locally displayed record as a saved claim.
Before enabling production submission, connect the form to the existing
employee TA service/API contract; do not change the backend as part of this
frontend-only step.

The CSS imports the existing TAClaimPage.css so this keeps the current
project form styling instead of introducing a parallel design system.
