
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  UserPlus,
  LogIn,
} from "lucide-react";

import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../authSlice";

import {
  loginUser,
  registerUser,
} from "../../../services/api/auth.api";

import { getDashboardDestination } from "../../../components/auth/dashboardRouting";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const getDestination = (user) => getDashboardDestination(user);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setError("");
      dispatch(loginStart());

      // Same login request for every account type.
      // The backend determines the user's actual role.
      const result = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      if (!result?.token || !result?.user) {
        throw new Error("Invalid login response from server.");
      }

      dispatch(loginSuccess(result));

      navigate(getDestination(result.user), {
        replace: true,
      });
    } catch (err) {
      dispatch(loginFailure());
      setError(
        err.message || "Login failed. Please check your credentials."
      );
    }
  };

  // Registration is temporarily retained for development/testing.
  // Remove it before production and create accounts through authorized admins.
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Full Name, Email and Password are required.");
      return;
    }

    try {
      setError("");
      dispatch(loginStart());

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        employeeId: form.employeeId.trim() || undefined,

        // Do not allow the registration form to choose a privileged role.
        role: "employee",
      };

      const result = await registerUser(payload);

      if (result?.token && result?.user) {
        dispatch(loginSuccess(result));

        navigate(getDestination(result.user), {
          replace: true,
        });
      } else {
        setMode("login");
        setForm((prev) => ({
          ...prev,
          password: "",
        }));
        setError("Account created. Please sign in.");
      }
    } catch (err) {
      dispatch(loginFailure());
      setError(err.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* Branding panel */}
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
              Government Finance Management
            </span>

            <h1>
              One secure place for your{" "}
              <span>financial workflow.</span>
            </h1>

            <p>
              Manage claims, approvals, reimbursements and financial
              records through a controlled digital workflow.
            </p>

            <div className="auth-security-card">
              <LockKeyhole size={20} />

              <div>
                <strong>Secure &amp; verified access</strong>
                <span>
                  Access is controlled according to your assigned role
                  and permissions.
                </span>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            FMS Portal <span>•</span> Government Finance System
          </div>
        </section>

        {/* Login panel */}
        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-mobile-brand">
              <div className="auth-brand-icon">
                <ShieldCheck size={25} />
              </div>

              <div>
                <strong>FMS</strong>
                <span>Finance Management</span>
              </div>
            </div>

            <div className="auth-heading">
              <span className="auth-small-label">
                {mode === "login" ? "Welcome back" : "Testing Mode"}
              </span>

              <h2>
                {mode === "login" ? "Sign in to FMS" : "Create Account"}
              </h2>

              <p>
                {mode === "login"
                  ? "Enter your credentials to access your account."
                  : "Register temporarily for development testing."}
              </p>
            </div>

            {/* Sign In / Register tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                background: "#f1f5f9",
                padding: "4px",
                borderRadius: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                style={getTabStyle(mode === "login")}
              >
                <LogIn size={16} />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                style={getTabStyle(mode === "register")}
              >
                <UserPlus size={16} />
                Register
              </button>
            </div>

            <form
              onSubmit={
                mode === "login"
                  ? handleLoginSubmit
                  : handleRegisterSubmit
              }
              className="auth-form"
            >
              {/* Registration-only fields */}
              {mode === "register" && (
                <>
                  <div className="auth-field">
                    <label htmlFor="reg-name">Full Name</label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="reg-empId">
                      Employee ID (Optional)
                    </label>
                    <input
                      id="reg-empId"
                      name="employeeId"
                      type="text"
                      placeholder="Enter employee ID"
                      value={form.employeeId}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Common email field */}
              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Common password field */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  {mode === "login" && (
                    <Link to="/forgot-password">
                      Forgot password?
                    </Link>
                  )}
                </div>

                <div className="auth-password">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Processing..."
                  : mode === "login"
                    ? "Sign In"
                    : "Register for Testing"}
              </button>

              {mode === "register" && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "12px",
                    textAlign: "center",
                  }}
                >
                  Testing only. Public registration must be disabled
                  before production.
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function getTabStyle(isActive) {
  return {
    flex: 1,
    padding: "10px 8px",
    borderRadius: "6px",
    border: "none",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: isActive ? "#ffffff" : "transparent",
    color: isActive ? "#0f172a" : "#64748b",
    boxShadow: isActive
      ? "0 1px 3px rgba(0,0,0,0.1)"
      : "none",
  };
}
