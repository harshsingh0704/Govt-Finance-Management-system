import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { registerUser } from "../../../services/api/auth.api";

const initialForm = {
  employeeId: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.employeeId ||
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser(form);

      setSuccess(result.message);

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell auth-shell-signup">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <ShieldCheck size={28} />
            </div>

            <div>
              <strong>FMS</strong>
              <span>Finance Management</span>
            </div>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">
              Secure employee onboarding
            </span>

            <h1>
              Create your
              <span> FMS account.</span>
            </h1>

            <p>
              Register using your official employee information.
              Your account can be activated after the required
              verification process.
            </p>

            <div className="auth-benefit-list">
              <div>
                <CheckCircle2 size={19} />
                <span>Track your financial claims</span>
              </div>

              <div>
                <CheckCircle2 size={19} />
                <span>Submit digital reimbursement requests</span>
              </div>

              <div>
                <CheckCircle2 size={19} />
                <span>Follow approval and payment status</span>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            FMS Portal <span>•</span> Government Finance System
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <Link to="/login" className="auth-back-link">
              <ArrowLeft size={17} />
              Back to sign in
            </Link>

            <div className="auth-heading">
              <span className="auth-small-label">
                Employee registration
              </span>

              <h2>Create your account</h2>

              <p>
                Enter the details associated with your official
                employee record.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="employeeId">Employee ID</label>

                <input
                  id="employeeId"
                  name="employeeId"
                  placeholder="Enter employee ID"
                  value={form.employeeId}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="name">Full name</label>

                <input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Official email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@department.gov.in"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-two-column">
                <div className="auth-field">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-success" role="status">
                  <CheckCircle2 size={18} />
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="auth-legal">
              By creating an account, you confirm that the
              information provided is associated with your
              official employee record.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}