import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, LockKeyhole } from "lucide-react";
import { loginStart, loginSuccess, loginFailure } from "../authSlice";
import { loginUser } from "../../../services/api/auth.api";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
  role: "employee",
  email: "",
  password: "",
});

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isLoading = status === "loading";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.role || !form.email || !form.password) {
  setError("Please select your account type and enter your email and password.");
  return;
}

    try {
      setError("");
      dispatch(loginStart());

      const result = await loginUser(form);

      dispatch(loginSuccess(result));

     const destinationByRole = {
  employee: "/dashboard",
  admin: "/admin",
  super_admin: "/super-admin",
};

const destination =
  destinationByRole[result.user.role] || "/dashboard";

navigate(destination, { replace: true });
    } catch (err) {
      dispatch(loginFailure());
      setError(err.message || "Unable to sign in.");
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
            <span className="auth-eyebrow">
              Government Finance Management
            </span>

            <h1>
              One secure place for your
              <span> financial workflow.</span>
            </h1>

            <p>
              Manage claims, approvals, reimbursements and
              financial records through a controlled digital
              workflow.
            </p>

            <div className="auth-security-card">
              <LockKeyhole size={20} />

              <div>
                <strong>Secure & verified access</strong>
                <span>
                  Access is controlled according to your assigned
                  role and permissions.
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
                Welcome back
              </span>

              <h2>Sign in to FMS</h2>

              <p>
                Enter your registered credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
  <label>Account type</label>

  <div className="auth-role-grid">
    <button
      type="button"
      className={`auth-role-card ${
        form.role === "super_admin" ? "active" : ""
      }`}
      onClick={() =>
        setForm((current) => ({
          ...current,
          role: "super_admin",
        }))
      }
    >
      <strong>Super Admin</strong>
      <span>Management</span>
    </button>

    <button
      type="button"
      className={`auth-role-card ${
        form.role === "admin" ? "active" : ""
      }`}
      onClick={() =>
        setForm((current) => ({
          ...current,
          role: "admin",
        }))
      }
    >
      <strong>Admin</strong>
      <span>Finance Operations</span>
    </button>

    <button
      type="button"
      className={`auth-role-card ${
        form.role === "employee" ? "active" : ""
      }`}
      onClick={() =>
        setForm((current) => ({
          ...current,
          role: "employee",
        }))
      }
    >
      <strong>Employee</strong>
      <span>Staff Access</span>
    </button>
  </div>
</div>
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
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="auth-password">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
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
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}