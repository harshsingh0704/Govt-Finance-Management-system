
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Users,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Search,
  FileSpreadsheet,
  AlertCircle,
  Network,
} from "lucide-react";
import "./OrganizationHierarchyPage.css";

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");

function readField(row, ...names) {
  const values = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalize(key), value])
  );

  for (const name of names) {
    const value = values[normalize(name)];
    if (value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function buildHierarchy(rows) {
  const employees = rows.map((row, index) => ({
    id: readField(row, "Employee_ID", "Employee ID", "Employee Code", "employeeCode"),
    name: readField(row, "Full_Name", "Full Name", "Employee Name", "name"),
    managerId: readField(
      row,
      "Reports_To_Employee_ID",
      "Reports To Employee ID",
      "Reporting Manager ID",
      "Manager ID"
    ),
    role: readField(row, "Functional_Assignment", "Functional Assignment") || "Employee",
    department: readField(row, "Department") || "Unassigned",
    designation: readField(row, "Designation") || "Staff",
    email: readField(row, "Email", "Email Address"),
    sourceIndex: index,
  }));

  const errors = [];
  const byId = new Map();

  for (const employee of employees) {
    if (!employee.id || !employee.name) {
      errors.push(`Row ${employee.sourceIndex + 2}: Employee ID and name are required.`);
      continue;
    }

    if (byId.has(employee.id)) {
      errors.push(`Duplicate employee ID: ${employee.id}`);
      continue;
    }

    byId.set(employee.id, { ...employee, children: [] });
  }

  const roots = [];

  for (const employee of byId.values()) {
    if (!employee.managerId) {
      roots.push(employee);
      continue;
    }

    const manager = byId.get(employee.managerId);

    if (!manager) {
      errors.push(
        `${employee.id}: manager ${employee.managerId} was not found.`
      );
      roots.push(employee);
      continue;
    }

    manager.children.push(employee);
  }

  // Detect circular reporting chains before rendering the tree.
  const visiting = new Set();
  const visited = new Set();

  function detectCycle(node) {
    if (visiting.has(node.id)) return true;
    if (visited.has(node.id)) return false;

    visiting.add(node.id);

    for (const child of node.children) {
      if (detectCycle(child)) return true;
    }

    visiting.delete(node.id);
    visited.add(node.id);
    return false;
  }

  const hasCycle = [...byId.values()].some(
    (employee) => detectCycle(employee)
  );

  if (hasCycle) {
    return {
      roots: [],
      employees: [...byId.values()],
      errors: [...errors, "Circular reporting relationships detected. Check the manager IDs."],
      hasCycle: true,
    };
  }

  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.id.localeCompare(b.id));
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);

  return {
    roots,
    employees: [...byId.values()],
    errors,
    hasCycle: false,
  };
}

function EmployeeNode({ employee, depth, expanded, onToggle }) {
  const hasChildren = employee.children.length > 0;
  const isExpanded = expanded.has(employee.id);

  return (
    <div className="org-node-wrap">
      <div
        className="org-node"
        style={{ "--node-depth": depth }}
      >
        <button
          className="org-node-toggle"
          type="button"
          disabled={!hasChildren}
          onClick={() => onToggle(employee.id)}
          aria-label={isExpanded ? "Collapse team" : "Expand team"}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />
          ) : (
            <span className="org-node-dot" />
          )}
        </button>

        <div className="org-avatar">
          {employee.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="org-node-info">
          <strong>{employee.name}</strong>
          <span>{employee.id} · {employee.designation}</span>
          <span>{employee.role} · {employee.department}</span>
        </div>

        {hasChildren && (
          <span className="org-report-count">
            {employee.children.length} direct report{employee.children.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="org-children">
          {employee.children.map((child) => (
            <EmployeeNode
              key={child.id}
              employee={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationHierarchyPage() {
  const navigate = useNavigate();
  const handleBack = () => {
  if (window.history.state?.idx > 0) {
    navigate(-1);
  } else {
    navigate("/admin/employee-management");
  }
};
  const [hierarchy, setHierarchy] = useState(null);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(new Set());

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setHierarchy(null);
    setFileName("");

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError("Upload an .xlsx or .xls Excel file.");
      event.target.value = "";
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error("The Excel file has no worksheet.");
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        throw new Error("The worksheet is empty.");
      }

      const result = buildHierarchy(rows);

      if (!result.employees.length) {
        throw new Error("No valid employee records were found.");
      }

      if (result.hasCycle) {
        setHierarchy(result);
        setError(result.errors.join("\n"));
        return;
      }

      setHierarchy(result);
      setFileName(file.name);

      // Expand the top two levels by default.
      const initialExpanded = new Set();
      result.roots.forEach((root) => {
        initialExpanded.add(root.id);
        root.children.forEach((child) => initialExpanded.add(child.id));
      });
      setExpanded(initialExpanded);
    } catch (err) {
      setError(err.message || "Could not read the Excel file.");
    }

    event.target.value = "";
  };

  const visibleRoots = useMemo(() => {
    if (!hierarchy) return [];
    const query = search.trim().toLowerCase();

    if (!query) return hierarchy.roots;

    function filterNode(node) {
      const matchingChildren = node.children
        .map(filterNode)
        .filter(Boolean);

      const matches =
        [node.id, node.name, node.role, node.department, node.designation]
          .some((value) => String(value).toLowerCase().includes(query));

      if (!matches && matchingChildren.length === 0) return null;

      return {
        ...node,
        children: matchingChildren,
      };
    }

    return hierarchy.roots.map(filterNode).filter(Boolean);
  }, [hierarchy, search]);

  const stats = useMemo(() => {
    if (!hierarchy) return { employees: 0, managers: 0, levels: 0 };

    const managerIds = new Set();
    const levels = new Set();

    function visit(node, level) {
      if (node.children.length) managerIds.add(node.id);
      levels.add(level);
      node.children.forEach((child) => visit(child, level + 1));
    }

    hierarchy.roots.forEach((root) => visit(root, 1));

    return {
      employees: hierarchy.employees.length,
      managers: managerIds.size,
      levels: levels.size,
    };
  }, [hierarchy]);

  const toggleNode = (id) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    if (!hierarchy) return;
    setExpanded(new Set(hierarchy.employees.map((employee) => employee.id)));
  };

  const collapseAll = () => setExpanded(new Set());

  return (
    <main className="org-page">
      <header className="org-header">
  <div className="org-header-main">
    <button
      type="button"
      className="org-back-button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft size={20} />
    </button>

    <div>
      <div className="org-eyebrow">
        <Network size={15} /> EMPLOYEE MANAGEMENT
      </div>

      <h1>Organization Hierarchy</h1>

      <p>
        Upload employee records to view reporting relationships
        across your office.
      </p>
    </div>
  </div>

  <label className="org-upload-button">
    <Upload size={17} />
    Upload Excel
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleUpload}
      hidden
    />
  </label>
</header>

      <section className="org-stats">
        <div className="org-stat-card">
          <Users size={20} />
          <div><span>Total employees</span><strong>{stats.employees || "—"}</strong></div>
        </div>
        <div className="org-stat-card">
          <GitBranch size={20} />
          <div><span>Managers</span><strong>{hierarchy ? stats.managers : "—"}</strong></div>
        </div>
        <div className="org-stat-card">
          <Network size={20} />
          <div><span>Reporting levels</span><strong>{hierarchy ? stats.levels : "—"}</strong></div>
        </div>
      </section>

      {error && (
        <div className="org-error">
          <AlertCircle size={18} />
          <pre>{error}</pre>
        </div>
      )}

      {!hierarchy && !error && (
        <section className="org-empty">
          <div className="org-empty-icon"><FileSpreadsheet size={30} /></div>
          <h2>Upload your employee hierarchy</h2>
          <p>
            Choose your employee Excel workbook. The first worksheet should include
            employee ID, full name, and reporting-manager employee ID columns.
          </p>
          <label className="org-upload-button">
            <Upload size={17} /> Choose Excel file
            <input type="file" accept=".xlsx,.xls" onChange={handleUpload} hidden />
          </label>
          <span className="org-hint">
            Expected columns: Employee_ID, Full_Name, Reports_To_Employee_ID
          </span>
        </section>
      )}

      {hierarchy && !hierarchy.hasCycle && (
        <section className="org-tree-panel">
          <div className="org-tree-toolbar">
            <div>
              <h2>Reporting structure</h2>
              <span>{fileName} · {hierarchy.employees.length} records loaded</span>
            </div>
            <div className="org-tree-actions">
              <button type="button" onClick={expandAll}>Expand all</button>
              <button type="button" onClick={collapseAll}>Collapse all</button>
            </div>
          </div>

          <label className="org-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by employee, ID, role or department..."
            />
          </label>

          {hierarchy.errors.length > 0 && (
            <div className="org-warning">
              <AlertCircle size={17} />
              <div>
                <strong>Some reporting relationships need review</strong>
                <ul>
                  {hierarchy.errors.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="org-tree">
            {visibleRoots.map((root) => (
              <EmployeeNode
                key={root.id}
                employee={root}
                depth={0}
                expanded={expanded}
                onToggle={toggleNode}
              />
            ))}
            {visibleRoots.length === 0 && (
              <p className="org-no-results">No matching employees found.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
