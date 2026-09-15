import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  UserCircle2,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

const profileSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Please select gender."),
  address: z.string().min(5, "Please enter your address."),
  nationality: z.string().min(2, "Nationality is required."),
  religion: z.string().min(1, "Religion is required."),
  caste: z.string().min(1, "Caste is required."),
  subCaste: z.string().optional(),
  category: z.enum(["GM", "OBC", "SC", "ST"], {
    errorMap: () => ({ message: "Please select a category." }),
  }),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number."),
  personalEmail: z
    .string()
    .email("Enter a valid personal email address."),
});

const PROFILE_STORAGE_KEY = "fms_employee_profile";

const EMPTY_PROFILE = {
  dateOfBirth: "",
  gender: "",
  address: "",
  nationality: "",
  religion: "",
  caste: "",
  subCaste: "",
  category: "",
  phone: "",
  personalEmail: "",
};

function FieldLabel({ children, required = false }) {
  return (
    <label className="profile-field-label">
      {children}
      {required && <span>*</span>}
    </label>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="profile-readonly-field">
      <FieldLabel>{label}</FieldLabel>
      <div className="profile-readonly-value">
        {value || "Not available"}
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  register,
  error,
  required = false,
  type = "text",
  placeholder,
  isEditing,
}) {
  return (
    <div className="profile-form-field">
      <FieldLabel required={required}>{label}</FieldLabel>

      <input
  type={type}
  placeholder={placeholder}
  disabled={!isEditing}
  className={`profile-input ${error ? "profile-input-error" : ""}`}
  {...register(name)}
/>

      {error && <p className="profile-error">{error.message}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  register,
  error,
  required = false,
  children,
  isEditing,
}) {
  return (
    <div className="profile-form-field">
      <FieldLabel required={required}>{label}</FieldLabel>

      <select
  disabled={!isEditing}
  className={`profile-input profile-select ${
    error ? "profile-input-error" : ""
  }`}
  {...register(name)}
>
        {children}
      </select>

      {error && <p className="profile-error">{error.message}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const authUser = useSelector((state) => state.auth?.user);

  const [savedProfile, setSavedProfile] = useState(() => {
  try {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!storedProfile) {
      return EMPTY_PROFILE;
    }

    return {
      ...EMPTY_PROFILE,
      ...JSON.parse(storedProfile),
    };
  } catch {
    return EMPTY_PROFILE;
  }
});
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const employee = useMemo(
    () => ({
      employeeId: authUser?.employeeId || authUser?.employeeID || "",
      name: authUser?.name || "",
      officialEmail:
        authUser?.officialEmail || authUser?.email || "",
      department: authUser?.departmentName || authUser?.department || "",
      designation: authUser?.designation || "",
      payband: authUser?.payband || authUser?.payScale || "",
      functionalRole: authUser?.functionalRole || "",
      supervisor: authUser?.supervisor || "",
      supervisorType: authUser?.supervisorType || "",
    }),
    [authUser],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: savedProfile,
  });

  useEffect(() => {
    reset(savedProfile);
  }, [reset, savedProfile]);

  const profileFields = [
  {
    key: "dateOfBirth",
    label: "Date of Birth",
  },
  {
    key: "gender",
    label: "Gender",
  },
  {
    key: "address",
    label: "Address",
  },
  {
    key: "nationality",
    label: "Nationality",
  },
  {
    key: "religion",
    label: "Religion",
  },
  {
    key: "caste",
    label: "Caste",
  },
  {
    key: "subCaste",
    label: "Sub-caste",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "personalEmail",
    label: "Personal Email",
  },
];

const completedFields = profileFields.filter(
  (field) =>
    String(savedProfile[field.key] || "").trim() !== "",
).length;

const totalFields = profileFields.length;

const remainingFields = profileFields.filter(
  (field) =>
    String(savedProfile[field.key] || "").trim() === "",
);

const completion = Math.round(
  (completedFields / totalFields) * 100,
);

  function handleEdit() {
    setSaveMessage("");
    setIsEditing(true);
  }

  function handleCancel() {
    reset(savedProfile);
    setSaveMessage("");
    setIsEditing(false);
  }

  function handleSave(values) {
  /*
   * Temporary frontend persistence.
   *
   * This will be replaced by the secured Employee Profile API
   * when the backend endpoint is available.
   */
  try {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(values),
    );

    setSavedProfile(values);
    setIsEditing(false);
    setSaveMessage(
      "Profile details saved on this device. They will be connected to the server profile API next.",
    );
  } catch {
    setSaveMessage(
      "Unable to save the profile on this device. Please try again.",
    );
  }
}

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <div>
          <div className="profile-breadcrumb">
            Workspace <span>/</span> My Profile
          </div>

          <h1>My Profile</h1>

          <p>
            Review your employment information and complete your
            personal profile details.
          </p>
        </div>

        <button
          type="button"
          className="profile-back-button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      {saveMessage && (
        <div className="profile-save-message">
          <CheckCircle2 size={18} />
          <span>{saveMessage}</span>
        </div>
      )}

      <section className="profile-identity-card">
        <div className="profile-avatar">
          <UserCircle2 size={46} strokeWidth={1.5} />
        </div>

        <div className="profile-identity-content">
          <div className="profile-identity-main">
            <div>
              <h2>{employee.name || "Employee"}</h2>

              <p>
                {employee.designation || "Employee"}{" "}
                {employee.department
                  ? `• ${employee.department}`
                  : ""}
              </p>
            </div>

            <span className="profile-status-badge">
              <CheckCircle2 size={14} />
              Active
            </span>
          </div>

          <div className="profile-identity-meta">
            <span>
              <UserCircle2 size={15} />
              Employee ID: {employee.employeeId || "Not available"}
            </span>

            <span>
              <Mail size={15} />
              {employee.officialEmail || "Official email not available"}
            </span>
          </div>
        </div>

        <div className="profile-completion">
          <div className="profile-completion-top">
            <span>Profile Completion</span>
            <strong>{completion}%</strong>
          </div>

          <div className="profile-progress-track">
            <div
              className="profile-progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>

<p>
  {completion === 100
    ? "Your personal profile is complete."
    : `${remainingFields.length} ${
        remainingFields.length === 1 ? "item" : "items"
      } remaining to complete your profile.`}
</p>
        </div>
      </section>

      <form onSubmit={handleSubmit(handleSave)}>
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <h2>Organization Information</h2>
              <p>
                Employment information maintained by your
                department.
              </p>
            </div>

            <span className="profile-readonly-badge">
              Read only
            </span>
          </div>

          <div className="profile-readonly-grid">
            <ReadOnlyField
              label="Employee ID"
              value={employee.employeeId}
            />

            <ReadOnlyField
              label="Name"
              value={employee.name}
            />

            <ReadOnlyField
              label="Official Email ID"
              value={employee.officialEmail}
            />

            <ReadOnlyField
              label="Department Name"
              value={employee.department}
            />

            <ReadOnlyField
              label="Designation"
              value={employee.designation}
            />

            <ReadOnlyField
              label="Payband / Payscale"
              value={employee.payband}
            />

            <ReadOnlyField
              label="Functional Role"
              value={employee.functionalRole}
            />

            <ReadOnlyField
              label="Supervisor"
              value={employee.supervisor}
            />

            <ReadOnlyField
              label="Supervisor Type"
              value={employee.supervisorType}
            />

            <ReadOnlyField
              label="System Access Role"
              value={
                authUser?.role === "employee"
                  ? "Employee"
                  : authUser?.role || "Employee"
              }
            />
          </div>
        </section>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <h2>Personal Information</h2>
              <p>
                Complete the information required for your employee
                profile.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={handleEdit}
              >
                <Edit3 size={16} />
{completion === 100 ? "Edit Profile" : "Complete Profile"}
              </button>
            )}
          </div>

          <div className="profile-form-grid">
            <FormField
              label="Date of Birth"
              name="dateOfBirth"
              register={register}
              error={errors.dateOfBirth}
              required
              type="date"
              isEditing={isEditing}
            />

            <SelectField
              label="Gender"
              name="gender"
              register={register}
              error={errors.gender}
              required
              isEditing={isEditing}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </SelectField>

            <FormField
              label="Phone"
              name="phone"
              register={register}
              error={errors.phone}
              required
              placeholder="10-digit mobile number"
              isEditing={isEditing}
            />

            <FormField
              label="Personal Email"
              name="personalEmail"
              register={register}
              error={errors.personalEmail}
              required
              type="email"
              placeholder="name@example.com"
              isEditing={isEditing}
            />

            <FormField
              label="Nationality"
              name="nationality"
              register={register}
              error={errors.nationality}
              required
              placeholder="Enter nationality"
              isEditing={isEditing}
            />

            <SelectField
              label="Category"
              name="category"
              register={register}
              error={errors.category}
              required
              isEditing={isEditing}
            >
              <option value="">Select category</option>
              <option value="GM">GM</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </SelectField>

            <FormField
              label="Religion"
              name="religion"
              register={register}
              error={errors.religion}
              required
              placeholder="Enter religion"
              isEditing={isEditing}
            />

            <FormField
              label="Caste"
              name="caste"
              register={register}
              error={errors.caste}
              required
              placeholder="Enter caste"
              isEditing={isEditing}
            />

            <FormField
              label="Sub-caste"
              name="subCaste"
              register={register}
              error={errors.subCaste}
              placeholder="Enter sub-caste"
              isEditing={isEditing}
            />

            <div className="profile-form-field profile-address-field">
              <FieldLabel required>Address</FieldLabel>

              <textarea
                rows="4"
                placeholder="Enter your complete address"
                disabled={!isEditing}
                className={`profile-input profile-textarea ${
                  errors.address ? "profile-input-error" : ""
                }`}
                {...register("address")}
              />

              {errors.address && (
                <p className="profile-error">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="profile-form-locked">
              <CheckCircle2 size={17} />
              <span>
                Your personal information is currently protected.
                Select <strong>Complete / Edit Profile</strong> to
                make changes.
              </span>
            </div>
          )}

          {isEditing && (
            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={!isDirty}
              >
                <Save size={17} />
                Save Profile
              </button>
            </div>
          )}
        </section>
      </form>

      <section className="profile-help-card">
        <div className="profile-help-icon">
          <Phone size={19} />
        </div>

        <div>
          <h3>Need to update employment information?</h3>
          <p>
            Organization-controlled details such as department,
            designation, payband and supervisor are maintained by
            authorized administrators.
          </p>
        </div>

        <div className="profile-help-contact">
          <MapPin size={15} />
          Contact your department administrator
        </div>
      </section>
    </div>
  );
}