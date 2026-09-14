import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="simple-state-page">
      <div className="simple-state-card">
        <div className="simple-state-icon">
          <ShieldAlert size={28} />
        </div>

        <span>Access restricted</span>

        <h1>Unauthorized access</h1>

        <p>
          Your current role does not have permission to access
          this section of FMS.
        </p>

        <Link to="/dashboard" className="auth-submit">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}