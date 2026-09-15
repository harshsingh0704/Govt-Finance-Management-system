import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, LockKeyhole, UserPlus, LogIn } from "lucide-react";
import { loginStart, loginSuccess, loginFailure } from "../authSlice";
import { loginUser, registerUser } from "../../../services/api/auth.api";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState("employee"); // 'super_admin' | 'admin' | 'employee'
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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const getDestination = (role) => {
    if (role === "super_admin") return "/super-admin";
    if (role === "admin") return "/admin";
    return "/dashboard";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setError("");
      dispatch(loginStart());

      const result = await loginUser({
        email: form.email,
        password: form.password,
        role: selectedRole,
      });

      dispatch(loginSuccess(result));
      navigate(getDestination(result.user.role), { replace: true });
    } catch (err) {
      dispatch(loginFailure());
      setError(err.message || "Invalid credentials or unauthorized role.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
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
        role: selectedRole,
        employeeId: form.employeeId || undefined,
      };

      const result = await registerUser(payload);

      if (result.token && result.user) {
        dispatch(loginSuccess(result));
        navigate(getDestination(result.user.role), { replace: true });
      } else {
        setError("Account created, please sign in.");
        setMode("login");
      }
    } catch (err) {
      dispatch(loginFailure());
      setError(err.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
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
            <span className="auth-eyebrow">Government Finance Management</span>
            <h1>
              One secure place for your <span> financial workflow.</span>
            </h1>
            <p>
              Manage claims, approvals, reimbursements and financial records
              through a controlled digital workflow.
            </p>

            <div className="auth-security-card">
              <LockKeyhole size={20} />
              <div>
                <strong>Secure & verified access</strong>
                <span>
                  Access is controlled according to your assigned role and permissions.
                </span>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            FMS Portal <span>•</span> Government Finance System
          </div>
        </section>

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
                {mode === "login" ? "Welcome back" : "New User Registration"}
              </span>
              <h2>{mode === "login" ? "Sign in to FMS" : "Create Account"}</h2>
              <p>
                {mode === "login"
                  ? "Select your account type and enter credentials."
                  : "Choose your role and register to get immediate access."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
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
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: mode === "login" ? "#ffffff" : "transparent",
                  color: mode === "login" ? "#0f172a" : "#64748b",
                  boxShadow: mode === "login" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <LogIn size={16} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: mode === "register" ? "#ffffff" : "transparent",
                  color: mode === "register" ? "#0f172a" : "#64748b",
                  boxShadow: mode === "register" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <UserPlus size={16} /> Register
              </button>
            </div>

            <form
              onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit}
              className="auth-form"
            >
              {/* Common Role Selection Grid */}
              <div className="auth-field">
                <label>
                  {mode === "login" ? "Account Type" : "Registering As"}
                </label>
                <div className="auth-role-grid">
                  <button
                    type="button"
                    className={`auth-role-card ${
                      selectedRole === "super_admin" ? "active" : ""
                    }`}
                    onClick={() => setSelectedRole("super_admin")}
                  >
                    <strong>Super Admin</strong>
                    <span>Management</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-role-card ${
                      selectedRole === "admin" ? "active" : ""
                    }`}
                    onClick={() => setSelectedRole("admin")}
                  >
                    <strong>Admin</strong>
                    <span>Finance Operations</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-role-card ${
                      selectedRole === "employee" ? "active" : ""
                    }`}
                    onClick={() => setSelectedRole("employee")}
                  >
                    <strong>Employee</strong>
                    <span>Staff Access</span>
                  </button>
                </div>
              </div>

              {/* Extra Register Fields */}
              {mode === "register" && (
                <>
                  <div className="auth-field">
                    <label htmlFor="reg-name">Full Name</label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      placeholder="e.g. Sahaj Dubey"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {selectedRole === "employee" && (
                    <div className="auth-field">
                      <label htmlFor="reg-empId">Employee ID (Optional)</label>
                      <input
                        id="reg-empId"
                        name="employeeId"
                        type="text"
                        placeholder="e.g. EMP-1042"
                        value={form.employeeId}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@department.gov.in"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>
                  {mode === "login" && (
                    <Link to="/forgot-password">Forgot password?</Link>
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
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  ? `Sign in as ${
                      selectedRole === "super_admin"
                        ? "Super Admin"
                        : selectedRole === "admin"
                        ? "Admin"
                        : "Employee"
                    }`
                  : `Create ${
                      selectedRole === "super_admin"
                        ? "Super Admin"
                        : selectedRole === "admin"
                        ? "Admin"
                        : "Employee"
                    } Account`}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}