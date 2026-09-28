import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Eye,
  Filter,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import "./EmployeeAuditLogPage.css";

const AUDIT_EVENTS = [
  {
    id: "AUD-001",
    employeeId: "EMP-001",
    employeeName: "Employee 001",
    module: "Employee Management",
    action: "Organizational Mapping Updated",
    performedBy: "Admin",
    status: "Success",
    date: "28 Sept 2026",
    time: "11:42 am",
    changes: [
      {
        field: "Department",
        before: "Finance & Accounts",
        after: "Administration",
      },
      {
        field: "Functional Role",
        before: "Accounts Staff",
        after: "Controlling Officer / HoD",
      },
      {
        field: "Pay Grade",
        before: "P2",
        after: "P3",
      },
    ],
  },
  {
    id: "AUD-002",
    employeeId: "EMP-002",
    employeeName: "Employee 002",
    module: "Employee Management",
    action: "Employee Updated",
    performedBy: "Admin",
    status: "Success",
    date: "28 Sept 2026",
    time: "10:31 am",
    changes: [
      {
        field: "Designation",
        before: "Assistant",
        after: "Senior Assistant",
      },
      {
        field: "Work Location",
        before: "Bengaluru",
        after: "Mysuru",
      },
    ],
  },
  {
    id: "AUD-003",
    employeeId: "EMP-003",
    employeeName: "Employee 003",
    module: "Employee Mapping",
    action: "Reporting Relationship Changed",
    performedBy: "Admin",
    status: "Success",
    date: "27 Sept 2026",
    time: "04:18 pm",
    changes: [
      {
        field: "Reporting Manager",
        before: "EMP-007",
        after: "EMP-011",
      },
      {
        field: "Reporting Level",
        before: "Level 2",
        after: "Level 1",
      },
    ],
  },
  {
    id: "AUD-004",
    employeeId: "EMP-001",
    employeeName: "Employee 001",
    module: "Employee Mapping",
    action: "Financial Authority Updated",
    performedBy: "Super Admin",
    status: "Success",
    date: "27 Sept 2026",
    time: "02:05 pm",
    changes: [
      {
        field: "Financial Authority",
        before: "No",
        after: "Yes",
      },
      {
        field: "Approval Limit",
        before: "₹1,00,000",
        after: "₹5,00,000",
      },
    ],
  },
  {
    id: "AUD-005",
    employeeId: "EMP-003",
    employeeName: "Employee 003",
    module: "System Access",
    action: "Access Role Changed",
    performedBy: "Super Admin",
    status: "Success",
    date: "26 Sept 2026",
    time: "12:24 pm",
    changes: [
      {
        field: "System Role",
        before: "Employee",
        after: "Admin",
      },
      {
        field: "Access Status",
        before: "Restricted",
        after: "Active",
      },
    ],
  },
  {
    id: "AUD-006",
    employeeId: "EMP-004",
    employeeName: "Employee 004",
    module: "Employee Management",
    action: "Employee Created",
    performedBy: "Admin",
    status: "Success",
    date: "25 Sept 2026",
    time: "09:16 am",
    changes: [
      {
        field: "Employee ID",
        before: "—",
        after: "EMP-004",
      },
      {
        field: "Department",
        before: "—",
        after: "Finance & Accounts",
      },
      {
        field: "Employment Status",
        before: "—",
        after: "Active",
      },
    ],
  },
];

function FilterField({ label, value, options, onChange }) {
  return (
    <label className="employee-audit-filter-field">
      <span>{label}</span>

      <div className="employee-audit-select">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown size={17} />
      </div>
    </label>
  );
}

function EmployeeAuditLogPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [performedByFilter, setPerformedByFilter] = useState("All Users");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const modules = useMemo(
    () => [
      "All Modules",
      ...new Set(AUDIT_EVENTS.map((event) => event.module)),
    ],
    []
  );

  const actions = useMemo(
    () => [
      "All Actions",
      ...new Set(AUDIT_EVENTS.map((event) => event.action)),
    ],
    []
  );

  const users = useMemo(
    () => [
      "All Users",
      ...new Set(AUDIT_EVENTS.map((event) => event.performedBy)),
    ],
    []
  );

  const statuses = useMemo(
    () => [
      "All Status",
      ...new Set(AUDIT_EVENTS.map((event) => event.status)),
    ],
    []
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return AUDIT_EVENTS.filter((event) => {
      const matchesSearch =
        !query ||
        event.employeeId.toLowerCase().includes(query) ||
        event.employeeName.toLowerCase().includes(query) ||
        event.module.toLowerCase().includes(query) ||
        event.action.toLowerCase().includes(query) ||
        event.performedBy.toLowerCase().includes(query);

      const matchesModule =
        moduleFilter === "All Modules" || event.module === moduleFilter;

      const matchesAction =
        actionFilter === "All Actions" || event.action === actionFilter;

      const matchesUser =
        performedByFilter === "All Users" ||
        event.performedBy === performedByFilter;

      const matchesStatus =
        statusFilter === "All Status" || event.status === statusFilter;

      return (
        matchesSearch &&
        matchesModule &&
        matchesAction &&
        matchesUser &&
        matchesStatus
      );
    });
  }, [
    search,
    moduleFilter,
    actionFilter,
    performedByFilter,
    statusFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("All Modules");
    setActionFilter("All Actions");
    setPerformedByFilter("All Users");
    setStatusFilter("All Status");
  };

  const hasFilters =
    search ||
    moduleFilter !== "All Modules" ||
    actionFilter !== "All Actions" ||
    performedByFilter !== "All Users" ||
    statusFilter !== "All Status";

  return (
    <div className="employee-audit-page">
      <header className="employee-audit-header">
        <div className="employee-audit-header-icon">
          <ClipboardList size={25} />
        </div>

        <div className="employee-audit-header-content">
          <h1>Employee Audit Log</h1>
          <p>
            Track employee-related changes, mappings and administrative
            actions across the system.
          </p>
        </div>
      </header>

      <section className="employee-audit-filter-card">
        <div className="employee-audit-filter-heading">
          <div className="employee-audit-filter-heading-icon">
            <Filter size={20} />
          </div>

          <div>
            <h2>Search &amp; Filter Audit Events</h2>
            <p>
              Find employee activity by employee, module, action or user.
            </p>
          </div>
        </div>

        <div className="employee-audit-search-row">
          <label className="employee-audit-search">
            <Search size={19} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee ID, name, action or user..."
            />

            {search && (
              <button
                type="button"
                className="employee-audit-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </label>

          <button
            type="button"
            className="employee-audit-clear-button"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="employee-audit-filter-grid">
          <FilterField
            label="Module"
            value={moduleFilter}
            options={modules}
            onChange={setModuleFilter}
          />

          <FilterField
            label="Action"
            value={actionFilter}
            options={actions}
            onChange={setActionFilter}
          />

          <FilterField
            label="Performed By"
            value={performedByFilter}
            options={users}
            onChange={setPerformedByFilter}
          />

          <FilterField
            label="Status"
            value={statusFilter}
            options={statuses}
            onChange={setStatusFilter}
          />
        </div>
      </section>

      <section className="employee-audit-table-card">
        <div className="employee-audit-table-header">
          <div>
            <div className="employee-audit-table-title">
              <Activity size={20} />
              <h2>Audit Events</h2>
            </div>

            <p>
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </p>
          </div>

          <div className="employee-audit-readonly">
            <ShieldCheck size={18} />
            <span>Read only</span>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="employee-audit-empty">
            <div className="employee-audit-empty-icon">
              <Search size={25} />
            </div>

            <h3>No audit events found</h3>
            <p>Try changing the search text or filters.</p>

            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="employee-audit-table-wrapper">
            <table className="employee-audit-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Employee</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="employee-audit-date">
                        <strong>{event.date}</strong>
                        <span>{event.time}</span>
                      </div>
                    </td>

                    <td>
                      <div className="employee-audit-employee">
                        <div className="employee-audit-employee-icon">
                          <UserRound size={17} />
                        </div>

                        <div>
                          <strong>{event.employeeId}</strong>
                          <span>{event.employeeName}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="employee-audit-module">
                        {event.module}
                      </span>
                    </td>

                    <td>
                      <span className="employee-audit-action">
                        {event.action}
                      </span>
                    </td>

                    <td>
                      <div className="employee-audit-performer">
                        <UserRound size={17} />
                        <span>{event.performedBy}</span>
                      </div>
                    </td>

                    <td>
                      <span className="employee-audit-status">
                        {event.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="employee-audit-view-button"
                        onClick={() =>
                          navigate(
                            `/admin/employee-management/audit-log/${event.id}`
                          )
                        }
                      >
                        <Eye size={17} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export { AUDIT_EVENTS };
export default EmployeeAuditLogPage;
