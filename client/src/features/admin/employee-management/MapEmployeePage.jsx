import { useEffect, useMemo, useState , useRef} from "react";
import {
  Check,
  ChevronDown,
  Lock,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./MapEmployeePage.css";

/*
|--------------------------------------------------------------------------
| Functional Roles
|--------------------------------------------------------------------------
| These values come from the existing FMS employee-management flow.
*/
const FUNCTIONAL_ROLES = [
  "Bill Clerk / Accounts Staff",
  "Controlling Officer / HoD",
  "Medical Officer",
  "DDO / Competent Authority",
];

/*
|--------------------------------------------------------------------------
| FMS Form Types
|--------------------------------------------------------------------------
| These are the responsibilities that can be mapped to employees.
*/
const FORM_TYPES = [
  {
    id: "ta-claim",
    label: "TA Claim",
    group: "TA",
  },
  {
    id: "ta-advance",
    label: "TA Advance",
    group: "TA",
  },
  {
    id: "ltc-claim",
    label: "LTC Claim",
    group: "LTC",
  },
  {
    id: "ltc-advance",
    label: "LTC Advance",
    group: "LTC",
  },
  {
    id: "medical-claim",
    label: "Medical Claim",
    group: "Medical",
  },
  {
    id: "medical-advance",
    label: "Medical Advance",
    group: "Medical",
  },
  {
    id: "accommodation",
    label: "Accommodation",
    group: "Other",
  },
];

/*
|--------------------------------------------------------------------------
| Temporary frontend employee data
|--------------------------------------------------------------------------
| This is intentionally frontend-only for now.
| We will connect this to the real employee API later.
*/
const EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Employee 001",
    designation: "Administrative Officer",
    departmentName: "Administration",
    functionalRole: "Controlling Officer / HoD",
  },
  {
    employeeId: "EMP-002",
    name: "Employee 002",
    designation: "Accounts Officer",
    departmentName: "Finance & Accounts",
    functionalRole: "Bill Clerk / Accounts Staff",
  },
  {
    employeeId: "EMP-003",
    name: "Employee 003",
    designation: "Research Officer",
    departmentName: "Research",
    functionalRole: "Medical Officer",
  },
];

/*
|--------------------------------------------------------------------------
| Initial mapping
|--------------------------------------------------------------------------
*/
const INITIAL_MAPPINGS = {
  "EMP-001": {
    "ta-claim": true,
    "ta-advance": false,
    "ltc-claim": true,
    "ltc-advance": false,
    "medical-claim": false,
    "medical-advance": false,
    accommodation: true,
    locked: false,
  },

  "EMP-002": {
    "ta-claim": false,
    "ta-advance": true,
    "ltc-claim": false,
    "ltc-advance": true,
    "medical-claim": false,
    "medical-advance": false,
    accommodation: true,
    locked: false,
  },

  "EMP-003": {
    "ta-claim": false,
    "ta-advance": false,
    "ltc-claim": false,
    "ltc-advance": false,
    "medical-claim": true,
    "medical-advance": true,
    accommodation: false,
    locked: false,
  },
};

const STORAGE_KEY = "fms.employee-form-mappings";

/*
|--------------------------------------------------------------------------
| Load frontend mapping state
|--------------------------------------------------------------------------
*/
function loadMappings() {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return INITIAL_MAPPINGS;
  }

  try {
    const parsed = JSON.parse(stored);

    return {
      ...INITIAL_MAPPINGS,
      ...parsed,
    };
  } catch {
    return INITIAL_MAPPINGS;
  }
}

/*
|--------------------------------------------------------------------------
| ON / OFF Toggle
|--------------------------------------------------------------------------
*/
function MappingToggle({
  checked,
  disabled,
  label,
  onChange,
}) {
  return (
    <button
      type="button"
      className={`mapping-toggle ${
        checked ? "mapping-toggle-on" : "mapping-toggle-off"
      }`}
      disabled={disabled}
      onClick={onChange}
      aria-label={`${label}: ${checked ? "On" : "Off"}`}
      aria-pressed={checked}
    >
      <span className="mapping-toggle-indicator" />

      <span className="mapping-toggle-text">
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Main Page
|--------------------------------------------------------------------------
*/
function MapEmployeePage() {
  const navigate = useNavigate();

  const [functionalRole, setFunctionalRole] = useState(
    FUNCTIONAL_ROLES[0]
  );

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("EMP-002");

  const [mappings, setMappings] = useState(loadMappings);

  const [saved, setSaved] = useState(false);
  /* ----------------------------------------------------------
     Top-only horizontal table scrollbar
     ---------------------------------------------------------- */

  const mapEmployeeTableWrapperRef = useRef(null);
  const mapEmployeeTopScrollRef = useRef(null);
  const mapEmployeeTopScrollContentRef = useRef(null);
  const mapEmployeeTableRef = useRef(null);

  useEffect(() => {
    const wrapper = mapEmployeeTableWrapperRef.current;
    const topScroll = mapEmployeeTopScrollRef.current;
    const topContent = mapEmployeeTopScrollContentRef.current;
    const table = mapEmployeeTableRef.current;

    if (!wrapper || !topScroll || !topContent || !table) {
      return undefined;
    }

    const updateScrollWidth = () => {
      topContent.style.width = `${table.scrollWidth}px`;
    };

    const handleTableScroll = () => {
      if (
        Math.abs(topScroll.scrollLeft - wrapper.scrollLeft) > 1
      ) {
        topScroll.scrollLeft = wrapper.scrollLeft;
      }
    };

    const handleTopScroll = () => {
      if (
        Math.abs(wrapper.scrollLeft - topScroll.scrollLeft) > 1
      ) {
        wrapper.scrollLeft = topScroll.scrollLeft;
      }
    };

    updateScrollWidth();

    wrapper.addEventListener("scroll", handleTableScroll);
    topScroll.addEventListener("scroll", handleTopScroll);

    const resizeObserver = new ResizeObserver(
      updateScrollWidth
    );

    resizeObserver.observe(table);

    return () => {
      wrapper.removeEventListener(
        "scroll",
        handleTableScroll
      );

      topScroll.removeEventListener(
        "scroll",
        handleTopScroll
      );

      resizeObserver.disconnect();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Employees belonging to selected functional role
  |--------------------------------------------------------------------------
  */
  const employeesForRole = useMemo(() => {
    return EMPLOYEES.filter(
      (employee) =>
        employee.functionalRole === functionalRole
    );
  }, [functionalRole]);

  /*
  |--------------------------------------------------------------------------
  | Selected employee
  |--------------------------------------------------------------------------
  */
  const selectedEmployee = useMemo(() => {
    return (
      EMPLOYEES.find(
        (employee) =>
          employee.employeeId === selectedEmployeeId
      ) || null
    );
  }, [selectedEmployeeId]);

  /*
  |--------------------------------------------------------------------------
  | Mapping of selected employee
  |--------------------------------------------------------------------------
  */
  const selectedMapping =
    mappings[selectedEmployeeId] || {
      locked: false,
    };

  /*
  |--------------------------------------------------------------------------
  | Keep selected employee valid when changing functional role
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const exists = employeesForRole.some(
      (employee) =>
        employee.employeeId === selectedEmployeeId
    );

    if (!exists) {
      setSelectedEmployeeId(
        employeesForRole[0]?.employeeId || ""
      );
    }
  }, [
    employeesForRole,
    selectedEmployeeId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Save mapping
  |--------------------------------------------------------------------------
  */
  const persistMappings = (nextMappings = mappings) => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextMappings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /*
  |--------------------------------------------------------------------------
  | Update individual form mapping
  |--------------------------------------------------------------------------
  */
  const updateMapping = (
    employeeId,
    formId,
    value
  ) => {
    if (mappings[employeeId]?.locked) {
      return;
    }

    setMappings((current) => ({
      ...current,

      [employeeId]: {
        ...(current[employeeId] || {}),
        [formId]: value,
      },
    }));

    setSaved(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Select All
  |--------------------------------------------------------------------------
  */
  const handleSelectAll = () => {
    if (
      !selectedEmployeeId ||
      selectedMapping.locked
    ) {
      return;
    }

    const nextMapping = {
      ...selectedMapping,
    };

    FORM_TYPES.forEach((form) => {
      nextMapping[form.id] = true;
    });

    setMappings((current) => ({
      ...current,
      [selectedEmployeeId]: nextMapping,
    }));

    setSaved(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Lock selected employee
  |--------------------------------------------------------------------------
  */
  const handleLockAll = () => {
    if (!selectedEmployeeId) {
      return;
    }

    const nextMappings = {
      ...mappings,

      [selectedEmployeeId]: {
        ...selectedMapping,
        locked: true,
      },
    };

    setMappings(nextMappings);

    persistMappings(nextMappings);
  };

  /*
  |--------------------------------------------------------------------------
  | Unlock selected employee
  |--------------------------------------------------------------------------
  */
  const handleUnlockAll = () => {
    if (!selectedEmployeeId) {
      return;
    }

    const nextMappings = {
      ...mappings,

      [selectedEmployeeId]: {
        ...selectedMapping,
        locked: false,
      },
    };

    setMappings(nextMappings);

    persistMappings(nextMappings);
  };

  /*
  |--------------------------------------------------------------------------
  | Save selected employee
  |--------------------------------------------------------------------------
  */
  const handleSave = () => {
    persistMappings(mappings);
  };

  /*
  |--------------------------------------------------------------------------
  | Row lock / unlock
  |--------------------------------------------------------------------------
  */
  const toggleRowLock = (employeeId) => {
    const currentEmployeeMapping =
      mappings[employeeId] || {};

    const nextMappings = {
      ...mappings,

      [employeeId]: {
        ...currentEmployeeMapping,
        locked: !currentEmployeeMapping.locked,
      },
    };

    setMappings(nextMappings);

    persistMappings(nextMappings);
  };

  /*
  |--------------------------------------------------------------------------
  | Close modal
  |--------------------------------------------------------------------------
  */
  const handleClose = () => {
    navigate("/admin");
  };

  /*
  |--------------------------------------------------------------------------
  | Whether every form is selected
  |--------------------------------------------------------------------------
  */
  const allSelected = FORM_TYPES.every(
    (form) => selectedMapping[form.id]
  );

  return (
    <div
      className="map-employee-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-employee-title"
    >
      <div className="map-employee-modal">

        {/* ================================================================
            HEADER
        ================================================================= */}
        <header className="map-modal-header">

          <div className="map-modal-heading">

            <div className="map-modal-icon">
              <Users size={23} />
            </div>

            <div>
              <span className="map-modal-eyebrow">
                EMPLOYEE MANAGEMENT
              </span>

              <h1 id="map-employee-title">
                Map Employee
              </h1>
            </div>

          </div>

          <button
            type="button"
            className="map-close-button"
            onClick={handleClose}
            aria-label="Close employee mapping"
          >
            <X size={25} />
          </button>

        </header>

        {/* ================================================================
            BODY
        ================================================================= */}
        <div className="map-modal-body">

          {/* ============================================================
              INTRO
          ============================================================= */}
          <section className="map-intro">

            <div>

              <span className="map-section-kicker">
                FORM RESPONSIBILITY
              </span>

              <h2>
                Employee Form Mapping
              </h2>

              <p>
                Assign the financial forms that each employee
                is responsible for handling.
              </p>

            </div>

            <div className="map-security-note">
              <ShieldCheck size={18} />

              <span>
                Admin controlled
              </span>
            </div>

          </section>

          {/* ============================================================
              CONTROL PANEL
          ============================================================= */}
          <section className="map-control-panel">

            {/* ----------------------------------------------------------
                SELECTORS
            ---------------------------------------------------------- */}
            <div className="map-control-grid">

              <label className="map-field">

                <span className="map-field-label">
                  User Type
                </span>

                <span className="map-select-container">

                  <select
                    value={functionalRole}
                    onChange={(event) =>
                      setFunctionalRole(
                        event.target.value
                      )
                    }
                  >
                    {FUNCTIONAL_ROLES.map(
                      (role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {role}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="map-select-icon"
                  />

                </span>

              </label>

              <label className="map-field">

                <span className="map-field-label">
                  Name
                </span>

                <span className="map-select-container">

                  <select
                    value={selectedEmployeeId}
                    disabled={
                      employeesForRole.length === 0
                    }
                    onChange={(event) =>
                      setSelectedEmployeeId(
                        event.target.value
                      )
                    }
                  >

                    {employeesForRole.length === 0 ? (
                      <option value="">
                        No employees in this role
                      </option>
                    ) : (
                      employeesForRole.map(
                        (employee) => (
                          <option
                            key={
                              employee.employeeId
                            }
                            value={
                              employee.employeeId
                            }
                          >
                            {employee.name} —{" "}
                            {employee.designation}
                          </option>
                        )
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={17}
                    className="map-select-icon"
                  />

                </span>

              </label>

            </div>

            {/* ----------------------------------------------------------
                FORM OPTIONS
            ---------------------------------------------------------- */}
            <div className="map-form-area">

              <div className="map-form-options">

                {FORM_TYPES.map((form) => {

                  const checked =
                    Boolean(
                      selectedMapping[
                        form.id
                      ]
                    );

                  return (
                    <label
                      key={form.id}
                      className={`map-form-option ${
                        checked
                          ? "is-selected"
                          : ""
                      } ${
                        selectedMapping.locked
                          ? "is-disabled"
                          : ""
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={
                          selectedMapping.locked ||
                          !selectedEmployeeId
                        }
                        onChange={(event) =>
                          updateMapping(
                            selectedEmployeeId,
                            form.id,
                            event.target.checked
                          )
                        }
                      />

                      <span className="map-checkbox">

                        {checked && (
                          <Check size={13} />
                        )}

                      </span>

                      <span>
                        {form.label}
                      </span>

                    </label>
                  );
                })}

              </div>

              {/* --------------------------------------------------------
                  BULK ACTIONS
              -------------------------------------------------------- */}
              <div className="map-bulk-actions">

                <button
                  type="button"
                  className="map-action-button secondary"
                  disabled={
                    !selectedEmployeeId ||
                    selectedMapping.locked ||
                    allSelected
                  }
                  onClick={handleSelectAll}
                >
                  <SlidersHorizontal size={15} />
                  Select All
                </button>

                <button
                  type="button"
                  className="map-action-button warning"
                  disabled={
                    !selectedEmployeeId ||
                    selectedMapping.locked
                  }
                  onClick={handleLockAll}
                >
                  <Lock size={15} />
                  Lock All
                </button>

                <button
                  type="button"
                  className="map-action-button secondary"
                  disabled={
                    !selectedEmployeeId ||
                    !selectedMapping.locked
                  }
                  onClick={handleUnlockAll}
                >
                  <Unlock size={15} />
                  Unlock All
                </button>

                <button
                  type="button"
                  className="map-action-button primary"
                  disabled={!selectedEmployeeId}
                  onClick={handleSave}
                >
                  <Save size={15} />
                  Save
                </button>

              </div>

            </div>

            {/* ----------------------------------------------------------
                SELECTED EMPLOYEE INFO
            ---------------------------------------------------------- */}
            {selectedEmployee && (
              <div className="map-selected-employee">

                <div className="map-selected-avatar">
                  {selectedEmployee.name
                    .split(" ")
                    .map(
                      (part) =>
                        part[0]
                    )
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="map-selected-info">

                  <strong>
                    {selectedEmployee.name}
                  </strong>

                  <span>
                    {selectedEmployee.employeeId}
                    {" · "}
                    {selectedEmployee.departmentName}
                    {" · "}
                    {selectedEmployee.functionalRole}
                  </span>

                </div>

                <span
                  className={`map-lock-state ${
                    selectedMapping.locked
                      ? "locked"
                      : "editable"
                  }`}
                >

                  {selectedMapping.locked ? (
                    <Lock size={13} />
                  ) : (
                    <Unlock size={13} />
                  )}

                  {selectedMapping.locked
                    ? "Locked"
                    : "Editable"}

                </span>

              </div>
            )}

          </section>

          {/* ============================================================
              MAPPING TABLE
          ============================================================= */}
          <section className="map-table-section">

            <div className="map-table-header">

              <div>

                <span className="map-section-kicker">
                  CONFIGURATION
                </span>

                <h2>
                  Forms Mapping View
                </h2>

              </div>

              <span className="map-count">
                {EMPLOYEES.length} employees
                {" · "}
                {FORM_TYPES.length} forms
              </span>

            </div>

            <div
              className="map-employee-top-scroll"
              ref={mapEmployeeTopScrollRef}
              aria-label="Horizontal table scroll"
            >
              <div
                className="map-employee-top-scroll-content"
                ref={mapEmployeeTopScrollContentRef}
              />
            </div>

            <div
              className="map-table-wrapper"
              ref={mapEmployeeTableWrapperRef}
            >

              <table
                className="map-table"
                ref={mapEmployeeTableRef}
              >

                <thead>

                  <tr>

                    <th className="serial-column">
                      SL NO
                    </th>

                    <th className="employee-column">
                      EMPLOYEE
                    </th>

                    {FORM_TYPES.map(
                      (form) => (
                        <th
                          key={form.id}
                          className="form-column"
                          title={form.label}
                        >
                          {form.label}
                        </th>
                      )
                    )}

                    <th className="actions-column">
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {EMPLOYEES.map(
                    (employee, index) => {

                      const rowMapping =
                        mappings[
                          employee.employeeId
                        ] || {};

                      const isCurrent =
                        employee.employeeId ===
                        selectedEmployeeId;

                      return (
                        <tr
                          key={
                            employee.employeeId
                          }
                          className={
                            isCurrent
                              ? "current-row"
                              : ""
                          }
                        >

                          <td className="serial-column">
                            {index + 1}
                          </td>

                          <td className="employee-column">

                            <button
                              type="button"
                              className="table-employee-button"
                              onClick={() => {
                                setFunctionalRole(
                                  employee.functionalRole
                                );

                                setSelectedEmployeeId(
                                  employee.employeeId
                                );
                              }}
                            >

                              <span className="table-avatar">
                                {employee.name
                                  .split(" ")
                                  .map(
                                    (part) =>
                                      part[0]
                                  )
                                  .slice(0, 2)
                                  .join("")}
                              </span>

                              <span className="table-employee-details">

                                <strong>
                                  {employee.name}
                                </strong>

                                <small>
                                  {
                                    employee.functionalRole
                                  }
                                </small>

                              </span>

                            </button>

                          </td>

                          {FORM_TYPES.map(
                            (form) => (
                              <td
                                key={form.id}
                                className="form-column"
                              >

                                <MappingToggle
                                  checked={Boolean(
                                    rowMapping[
                                      form.id
                                    ]
                                  )}
                                  disabled={Boolean(
                                    rowMapping.locked
                                  )}
                                  label={`${employee.name} ${form.label}`}
                                  onChange={() =>
                                    updateMapping(
                                      employee.employeeId,
                                      form.id,
                                      !rowMapping[
                                        form.id
                                      ]
                                    )
                                  }
                                />

                              </td>
                            )
                          )}

                          <td className="actions-column">

                            <div className="row-actions">

                              <button
                                type="button"
                                className="row-save-button"
                                onClick={() =>
                                  persistMappings(
                                    mappings
                                  )
                                }
                              >
                                <Save size={14} />
                                Save
                              </button>

                              <button
                                type="button"
                                className={`row-lock-button ${
                                  rowMapping.locked
                                    ? "unlock"
                                    : ""
                                }`}
                                onClick={() =>
                                  toggleRowLock(
                                    employee.employeeId
                                  )
                                }
                              >

                                {rowMapping.locked ? (
                                  <Unlock
                                    size={14}
                                  />
                                ) : (
                                  <Lock
                                    size={14}
                                  />
                                )}

                                {rowMapping.locked
                                  ? "Unlock"
                                  : "Lock"}

                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

        {/* ================================================================
            FOOTER
        ================================================================= */}
        <footer className="map-modal-footer">

          <div className="map-footer-status">

            {saved ? (
              <>
                <Check size={17} />
                Mapping saved successfully
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                Responsibility changes require an explicit save
              </>
            )}

          </div>

          <button
            type="button"
            className="map-footer-close"
            onClick={handleClose}
          >
            Close
          </button>

        </footer>

      </div>
    </div>
  );
}

export default MapEmployeePage;