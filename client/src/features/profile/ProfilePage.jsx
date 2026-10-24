
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  UserCircle2,
  X,
  AlertCircle,
  Check,
  Copy,
} from "lucide-react";
import { useSelector } from "react-redux";

import "./ProfilePage.css";

const profileSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Please select gender."),
  nationality: z.string().min(2, "Nationality is required."),
  religion: z.string().min(1, "Religion is required."),
  caste: z.string().min(1, "Caste is required."),
  subCaste: z.string().optional(),
  correspondingAddress: z
    .string()
    .min(5, "Please enter your corresponding address."),
  permanentAddress: z
    .string()
    .min(5, "Please enter your permanent address."),
  bloodGroup: z.string().min(1, "Please select blood group."),
  maritalStatus: z.string().min(1, "Please select marital status."),
  fatherName: z.string().min(2, "Father's name is required."),
  motherName: z.string().min(2, "Mother's name is required."),
  spouseName: z.string().optional(),
  children: z
    .array(z.object({ name: z.string().optional() }))
    .optional(),
}).superRefine((data, ctx) => {
  if (data.maritalStatus === "Married" && !data.spouseName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["spouseName"],
      message: "Spouse name is required for married employees.",
    });
  }
});

const PROFILE_STORAGE_KEY = "fms_employee_profile";

const EMPTY_PROFILE = {
  dateOfBirth: "",
  gender: "",
  nationality: "",
  religion: "",
  caste: "",
  subCaste: "",
  correspondingAddress: "",
  permanentAddress: "",
  bloodGroup: "",
  maritalStatus: "",
  fatherName: "",
  motherName: "",
  spouseName: "",
  children: [],
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
        aria-invalid={Boolean(error)}
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
        aria-invalid={Boolean(error)}
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
  const navigate = useNavigate();

  const [savedProfile, setSavedProfile] = useState(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!storedProfile) return EMPTY_PROFILE;

      return {
        ...EMPTY_PROFILE,
        ...JSON.parse(storedProfile),
      };
    } catch {
      return EMPTY_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isOrganizationOpen, setIsOrganizationOpen] = useState(false);
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);

  const employee = useMemo(
    () => ({
      employeeId: authUser?.employeeId || authUser?.employeeID || "",
      name: authUser?.name || "",
      officialEmail: authUser?.officialEmail || authUser?.email || "",
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
    watch,
    setValue,
    clearErrors,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: savedProfile,
    mode: "onBlur",
  });

  const currentValues = watch();
  const maritalStatus = watch("maritalStatus");
  const correspondingAddress = watch("correspondingAddress") || "";
  const permanentAddress = watch("permanentAddress") || "";
  const children = watch("children") || [];

  useEffect(() => {
    reset(savedProfile);
  }, [reset, savedProfile]);

  useEffect(() => {
    if (maritalStatus !== "Married") {
      setValue("spouseName", "");
      setValue("children", []);
      clearErrors(["spouseName", "children"]);
    }
  }, [maritalStatus, setValue, clearErrors]);

  const profileFields = [
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "gender", label: "Gender" },
    { key: "nationality", label: "Nationality" },
    { key: "religion", label: "Religion" },
    { key: "caste", label: "Caste" },
    { key: "subCaste", label: "Sub-caste", optional: true },
    { key: "correspondingAddress", label: "Corresponding Address" },
    { key: "permanentAddress", label: "Permanent Address" },
    { key: "bloodGroup", label: "Blood Group" },
    { key: "maritalStatus", label: "Marital Status" },
    { key: "fatherName", label: "Father's Name" },
    { key: "motherName", label: "Mother's Name" },
    {
      key: "spouseName",
      label: "Spouse Name",
      conditional: true,
    },
  ];

  const requiredProfileFields = profileFields.filter(
    (field) =>
      !field.optional &&
      !(field.conditional && maritalStatus !== "Married"),
  );

  const completedFields = requiredProfileFields.filter((field) => {
    const value = currentValues?.[field.key];
    return String(value || "").trim() !== "";
  }).length;

  const totalFields = requiredProfileFields.length;

  const remainingFields = requiredProfileFields.filter((field) => {
    const value = currentValues?.[field.key];
    return String(value || "").trim() === "";
  });

  const completion = totalFields
    ? Math.round((completedFields / totalFields) * 100)
    : 100;

  function handleEdit() {
    setSaveMessage("");
    setSaveError(false);
    setIsEditing(true);
    setIsPersonalOpen(true);
  }

  function handleCancel() {
    if (
      isDirty &&
      !window.confirm("Discard your unsaved profile changes?")
    ) {
      return;
    }

    reset(savedProfile);
    setSameAddress(
      Boolean(
        savedProfile.correspondingAddress &&
        savedProfile.correspondingAddress === savedProfile.permanentAddress,
      ),
    );
    setSaveMessage("");
    setSaveError(false);
    setIsEditing(false);
  }

  function handleSameAddress(checked) {
    setSameAddress(checked);

    if (checked) {
      setValue("permanentAddress", correspondingAddress, {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors("permanentAddress");
    }
  }

  async function handleSave(values) {
    setSaveMessage("");
    setSaveError(false);

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(values));
      setSavedProfile(values);
      reset(values);
      setIsEditing(false);
      setSameAddress(
        Boolean(
          values.correspondingAddress &&
          values.correspondingAddress === values.permanentAddress,
        ),
      );
      setSaveMessage("Your profile changes have been saved on this device.");
    } catch {
      setSaveError(true);
      setSaveMessage(
        "Unable to save your profile on this device. Please try again.",
      );
    }
  }

  function jumpToFirstMissingField() {
    const firstMissing = remainingFields[0];

    if (!firstMissing) {
      setIsEditing(true);
      return;
    }

    setIsEditing(true);
    setIsPersonalOpen(true);

    window.setTimeout(() => {
      const field = document.querySelector(
        `[name="${firstMissing.key}"]`,
      );
      field?.focus();
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => {
            if (isDirty && !window.confirm("Discard unsaved changes?")) return;

            if (window.history.state?.idx > 0) {
              navigate(-1);
            } else {
              navigate("/dashboard", { replace: true });
            }
          }}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>

        <div className="profile-page-heading-copy">
          <div className="profile-breadcrumb">
            Workspace <span>/</span> My Profile
          </div>
          <h1>My Profile</h1>
          <p>
            Review your employment information and complete your personal
            profile details.
          </p>
        </div>
      </div>

      {saveMessage && (
        <div
          className="profile-save-message"
          role={saveError ? "alert" : "status"}
        >
          {saveError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
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
                {employee.designation || "Employee"}
                {employee.department ? ` • ${employee.department}` : ""}
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

          <div
            className="profile-progress-track"
            role="progressbar"
            aria-label="Profile completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
          >
            <div
              className="profile-progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p aria-live="polite">
            {completion === 100
              ? "Your personal profile is complete."
              : `${remainingFields.length} ${
                  remainingFields.length === 1 ? "item" : "items"
                } remaining to complete your profile.`}
          </p>

          {remainingFields.length > 0 && !isEditing && (
            <button
              type="button"
              className="profile-completion-action"
              onClick={jumpToFirstMissingField}
            >
              Complete missing details
            </button>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit(handleSave)}>
        <section className="profile-section-card">
          <div className="profile-section-header">
            <button
              type="button"
              className="profile-section-toggle"
              aria-expanded={isOrganizationOpen}
              onClick={() => setIsOrganizationOpen((open) => !open)}
            >
              <span className="profile-section-toggle-copy">
                <h2>Organization Information</h2>
                <p>Employment information maintained by your department.</p>
              </span>
              <ChevronDown
                className={
                  isOrganizationOpen
                    ? "profile-chevron is-open"
                    : "profile-chevron"
                }
                size={19}
              />
            </button>
            <span className="profile-readonly-badge">Read only</span>
          </div>

          {isOrganizationOpen && (
            <div className="profile-readonly-grid">
              <ReadOnlyField label="Employee ID" value={employee.employeeId} />
              <ReadOnlyField label="Name" value={employee.name} />
              <ReadOnlyField
                label="Official Email ID"
                value={employee.officialEmail}
              />
              <ReadOnlyField
                label="Department Name"
                value={employee.department}
              />
              <ReadOnlyField label="Designation" value={employee.designation} />
              <ReadOnlyField label="Payband / Payscale" value={employee.payband} />
              <ReadOnlyField
                label="Functional Role"
                value={employee.functionalRole}
              />
              <ReadOnlyField label="Supervisor" value={employee.supervisor} />
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
          )}
        </section>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <button
              type="button"
              className="profile-section-toggle"
              aria-expanded={isPersonalOpen}
              onClick={() => setIsPersonalOpen((open) => !open)}
            >
              <span className="profile-section-toggle-copy">
                <h2>Personal Information</h2>
                <p>
                  Complete the information required for your employee profile.
                </p>
              </span>
              <ChevronDown
                className={
                  isPersonalOpen
                    ? "profile-chevron is-open"
                    : "profile-chevron"
                }
                size={19}
              />
            </button>

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

          {isPersonalOpen && (
            <>
              {isEditing && (
                <div className="profile-editing-banner">
                  <span className="profile-editing-indicator" />
                  <div>
                    <strong>Editing personal information</strong>
                    <p>Your changes are not saved until you select Save Profile.</p>
                  </div>
                </div>
              )}

              <div className="profile-form-grid">
                <div className="profile-form-subsection">
                  <div className="profile-form-subsection-header">
                    <h3>Personal Details</h3>
                    <p>
                      Basic personal information required for your employee
                      profile.
                    </p>
                  </div>

                  <div className="profile-form-subsection-grid">
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
                      <option value="Prefer not to say">Prefer not to say</option>
                    </SelectField>

                    <FormField
                      label="Nationality"
                      name="nationality"
                      register={register}
                      error={errors.nationality}
                      required
                      placeholder="Enter nationality"
                      isEditing={isEditing}
                    />

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

                    <SelectField
                      label="Blood Group"
                      name="bloodGroup"
                      register={register}
                      error={errors.bloodGroup}
                      required
                      isEditing={isEditing}
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </SelectField>

                    <SelectField
                      label="Marital Status"
                      name="maritalStatus"
                      register={register}
                      error={errors.maritalStatus}
                      required
                      isEditing={isEditing}
                    >
                      <option value="">Select marital status</option>
                      <option value="Unmarried">Unmarried</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Separated">Separated</option>
                    </SelectField>
                  </div>
                </div>

                <div className="profile-form-subsection profile-form-subsection-full">
                  <div className="profile-form-subsection-header">
                    <h3>Address Information</h3>
                    <p>
                      Provide your current corresponding and permanent addresses.
                    </p>
                  </div>

                  <div className="profile-form-subsection-grid">
                    <div className="profile-form-field profile-address-field">
                      <FieldLabel required>Corresponding Address</FieldLabel>
                      <textarea
                        rows={4}
                        placeholder="Enter your complete corresponding address"
                        disabled={!isEditing}
                        className={`profile-input profile-textarea ${
                          errors.correspondingAddress
                            ? "profile-input-error"
                            : ""
                        }`}
                        aria-invalid={Boolean(errors.correspondingAddress)}
                        {...register("correspondingAddress", {
                          onChange: (event) => {
                            if (sameAddress) {
                              setValue("permanentAddress", event.target.value, {
                                shouldDirty: true,
                                shouldValidate: false,
                              });
                            }
                          },
                        })}
                      />
                      {errors.correspondingAddress && (
                        <p className="profile-error">
                          {errors.correspondingAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="profile-form-field profile-address-field">
                      <FieldLabel required>Permanent Address</FieldLabel>
                      <textarea
                        rows={4}
                        placeholder="Enter your complete permanent address"
                        disabled={!isEditing || sameAddress}
                        className={`profile-input profile-textarea ${
                          errors.permanentAddress ? "profile-input-error" : ""
                        }`}
                        aria-invalid={Boolean(errors.permanentAddress)}
                        {...register("permanentAddress")}
                      />
                      {errors.permanentAddress && (
                        <p className="profile-error">
                          {errors.permanentAddress.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <label className="profile-same-address">
                      <input
                        type="checkbox"
                        checked={sameAddress}
                        onChange={(event) =>
                          handleSameAddress(event.target.checked)
                        }
                      />
                      <span>
                        <strong>Same as corresponding address</strong>
                        <small>
                          Keep the permanent address matched to your current
                          address.
                        </small>
                      </span>
                    </label>
                  )}
                </div>

                <div className="profile-form-subsection">
                  <div className="profile-form-subsection-header">
                    <h3>Family Information</h3>
                    <p>Provide the required immediate family details.</p>
                  </div>

                  <div className="profile-form-subsection-grid">
                    <FormField
                      label="Father's Name"
                      name="fatherName"
                      register={register}
                      error={errors.fatherName}
                      required
                      placeholder="Enter father's name"
                      isEditing={isEditing}
                    />

                    <FormField
                      label="Mother's Name"
                      name="motherName"
                      register={register}
                      error={errors.motherName}
                      required
                      placeholder="Enter mother's name"
                      isEditing={isEditing}
                    />

                    {maritalStatus === "Married" && (
                      <FormField
                        label="Spouse Name"
                        name="spouseName"
                        register={register}
                        error={errors.spouseName}
                        required
                        placeholder="Enter spouse name"
                        isEditing={isEditing}
                      />
                    )}
                  </div>
                </div>

                {maritalStatus === "Married" && (
                  <div className="profile-form-subsection">
                    <div className="profile-form-subsection-header">
                      <h3>Children Information</h3>
                      <p>
                        Add the names of your children where applicable.
                      </p>
                    </div>

                    <div className="profile-children-list">
                      {children.map((child, index) => (
                        <div className="profile-child-row" key={`child-${index}`}>
                          <div className="profile-form-field">
                            <FieldLabel>{`Child ${index + 1} Name`}</FieldLabel>
                            <input
                              type="text"
                              placeholder="Enter child's full name"
                              disabled={!isEditing}
                              className={`profile-input ${
                                errors.children?.[index]?.name
                                  ? "profile-input-error"
                                  : ""
                              }`}
                              {...register(`children.${index}.name`)}
                            />
                            {errors.children?.[index]?.name && (
                              <p className="profile-error">
                                {errors.children[index].name.message}
                              </p>
                            )}
                          </div>

                          {isEditing && (
                            <button
                              type="button"
                              className="profile-remove-child-button"
                              onClick={() => {
                                setValue(
                                  "children",
                                  children.filter(
                                    (_, childIndex) => childIndex !== index,
                                  ),
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  },
                                );
                              }}
                            >
                              <X size={16} />
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      {isEditing && (
                        <button
                          type="button"
                          className="profile-add-child-button"
                          onClick={() => {
                            setValue("children", [...children, { name: "" }], {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        >
                          <span className="profile-add-child-icon">+</span>
                          Add Another Child
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="profile-form-locked">
                  <CheckCircle2 size={17} />
                  <span>
                    Your personal information is currently protected. Select{" "}
                    <strong>Complete / Edit Profile</strong> to make changes.
                  </span>
                </div>
              )}

              {isEditing && (
                <div className="profile-form-actions">
                  <span className="profile-unsaved-note">
                    {isDirty ? "You have unsaved changes" : "No changes yet"}
                  </span>

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
                    disabled={!isDirty || isSubmitting}
                  >
                    <Save size={17} />
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              )}
            </>
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
            Organization-controlled details such as department, designation,
            payband and supervisor are maintained by authorized administrators.
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
