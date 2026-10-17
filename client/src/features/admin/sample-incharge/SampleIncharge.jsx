import React, { useMemo, useState } from "react";
import {
  LayoutDashboard, FlaskConical, Package, ClipboardList, ArrowDownToLine,
  ArrowUpFromLine, AlertTriangle, Bell, Search, Plus, ChevronDown, Menu, X,
  CheckCircle2, Clock3, FileText, Download, ArrowUpRight, MoreHorizontal,
  Boxes, History, Settings, ShieldCheck, CalendarDays
} from "lucide-react";
import "./SampleIncharge.css";

const starterSamples = [
  { id: "SMP-001", name: "Water quality sample", category: "Water", location: "Field Station 1", quantity: 24, unit: "bottles", status: "Available", received: "15 Oct 2026", expiry: "30 Oct 2026" },
  { id: "SMP-002", name: "Soil analysis sample", category: "Soil", location: "Field Station 2", quantity: 12, unit: "packs", status: "Available", received: "14 Oct 2026", expiry: "14 Nov 2026" },
  { id: "SMP-003", name: "Calibration reference sample", category: "Reference", location: "Central Store", quantity: 5, unit: "units", status: "Low stock", received: "10 Oct 2026", expiry: "10 Jan 2027" },
  { id: "SMP-004", name: "Air quality sample", category: "Air", location: "Field Station 1", quantity: 0, unit: "tubes", status: "Out of stock", received: "08 Oct 2026", expiry: "08 Nov 2026" },
];

const starterMovements = [
  { id: "MOV-2026-021", sample: "Water quality sample", type: "Received", quantity: 10, unit: "bottles", person: "A. Rao", date: "15 Oct 2026" },
  { id: "MOV-2026-020", sample: "Soil analysis sample", type: "Issued", quantity: 4, unit: "packs", person: "R. Kumar", date: "15 Oct 2026" },
  { id: "MOV-2026-019", sample: "Calibration reference sample", type: "Issued", quantity: 2, unit: "units", person: "M. Nair", date: "14 Oct 2026" },
  { id: "MOV-2026-018", sample: "Water quality sample", type: "Issued", quantity: 6, unit: "bottles", person: "V. Singh", date: "13 Oct 2026" },
];

const nav = [
  ["Overview", LayoutDashboard],
  ["Sample Register", FlaskConical],
  ["Receive Samples", ArrowDownToLine],
  ["Issue Samples", ArrowUpFromLine],
  ["Stock Movements", History],
  ["Requests", ClipboardList],
  ["Reports", FileText],
  ["Notifications", Bell],
  ["Settings", Settings],
];

function App() {
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [samples, setSamples] = useState(starterSamples);
  const [movements, setMovements] = useState(starterMovements);
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movementType, setMovementType] = useState("Received");
  const [notice, setNotice] = useState("");
  const [sampleForm, setSampleForm] = useState({ name: "", category: "Water", location: "Central Store", quantity: "1", unit: "units", expiry: "" });
  const [movementForm, setMovementForm] = useState({ sampleId: "SMP-001", quantity: "1", person: "", notes: "" });

  const filteredSamples = useMemo(() => samples.filter(s =>
    [s.id, s.name, s.category, s.location, s.status].join(" ").toLowerCase().includes(search.toLowerCase())
  ), [samples, search]);
  const filteredMovements = useMemo(() => movements.filter(m =>
    [m.id, m.sample, m.type, m.person].join(" ").toLowerCase().includes(search.toLowerCase())
  ), [movements, search]);

  const low = samples.filter(s => s.status === "Low stock").length;
  const out = samples.filter(s => s.status === "Out of stock").length;
  const totalUnits = samples.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

  function addSample(e) {
    e.preventDefault();
    const id = `SMP-${String(samples.length + 1).padStart(3, "0")}`;
    const quantity = Number(sampleForm.quantity);
    const newSample = { ...sampleForm, id, quantity, received: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), status: quantity === 0 ? "Out of stock" : quantity <= 5 ? "Low stock" : "Available" };
    setSamples([newSample, ...samples]);
    setSampleForm({ name: "", category: "Water", location: "Central Store", quantity: "1", unit: "units", expiry: "" });
    setShowSampleForm(false);
    setNotice("Sample added to the local register only. Nothing was sent to a backend.");
  }

  function openMovement(type) {
    setMovementType(type);
    setMovementForm({ sampleId: samples[0]?.id || "", quantity: "1", person: "", notes: "" });
    setShowMovementForm(true);
  }

  function saveMovement(e) {
    e.preventDefault();
    const qty = Number(movementForm.quantity);
    const item = samples.find(s => s.id === movementForm.sampleId);
    if (!item || qty <= 0) return;
    if (movementType === "Issued" && qty > item.quantity) {
      setNotice("Issue quantity exceeds the available balance. No change was made.");
      return;
    }
    const newQty = movementType === "Received" ? item.quantity + qty : item.quantity - qty;
    const status = newQty === 0 ? "Out of stock" : newQty <= 5 ? "Low stock" : "Available";
    setSamples(samples.map(s => s.id === item.id ? { ...s, quantity: newQty, status } : s));
    const id = `MOV-2026-${String(22 + movements.length - starterMovements.length).padStart(3, "0")}`;
    setMovements([{ id, sample: item.name, type: movementType, quantity: qty, unit: item.unit, person: movementForm.person || "Not specified", date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) }, ...movements]);
    setShowMovementForm(false);
    setNotice(`${movementType} movement recorded locally. This is demo data and is not saved to a server.`);
  }

  function exportCsv() {
    const rows = [["Sample ID", "Sample name", "Category", "Location", "Quantity", "Unit", "Status", "Received", "Expiry"], ...samples.map(s => [s.id, s.name, s.category, s.location, s.quantity, s.unit, s.status, s.received, s.expiry])];
    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "sample-register.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return <div className="sample-app">
    <aside className={`sample-sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sample-brand"><div className="sample-brand-icon"><ShieldCheck size={25}/></div><div><strong>GOV FMS</strong><span>Government Finance System</span></div><button className="sample-mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="sample-role-label">INCHARGE WORKSPACE</div>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={`sample-nav ${active === label ? "active" : ""}`} onClick={() => { setActive(label); setMobileOpen(false); setSearch(""); }}><Icon size={18}/><span>{label}</span>{label === "Sample Register" && <em>{samples.length}</em>}</button>)}</nav>
      <div className="sample-sidebar-bottom"><div className="sample-support"><ClipboardList size={20}/><div><strong>Sample handling</strong><span>Register and trace stock</span></div><ArrowUpRight size={15}/></div><div className="sample-demo-label">LOCAL PROTOTYPE · DEMO DATA</div></div>
    </aside>
    {mobileOpen && <button className="sample-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <main className="sample-main">
      <header className="sample-topbar"><div className="sample-top-left"><button className="sample-menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><div className="sample-breadcrumb">Workspace <span>/</span> <b>{active}</b></div><div className="sample-page-title">{active}</div></div></div><div className="sample-top-actions"><label className="sample-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search samples, locations..."/></label><button className="sample-icon-button" onClick={() => setActive("Notifications")} aria-label="Notifications"><Bell size={19}/><i/></button><div className="sample-profile"><div className="sample-avatar">SI</div><div><strong>Sample Incharge</strong><span>Sample Management</span></div><ChevronDown size={16}/></div></div></header>
      <div className="sample-content">
        {notice && <div className="sample-notice"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice("")}><X size={16}/></button></div>}
        {active === "Overview" && <Overview samples={samples} movements={movements} totalUnits={totalUnits} low={low} out={out} onReceive={() => openMovement("Received")} onIssue={() => openMovement("Issued")} onAdd={() => setShowSampleForm(true)} setActive={setActive} exportCsv={exportCsv}/>}
        {active === "Sample Register" && <Register samples={filteredSamples} onAdd={() => setShowSampleForm(true)} exportCsv={exportCsv}/>}
        {active === "Receive Samples" && <MovementPage type="Received" samples={samples} movements={filteredMovements} onNew={() => openMovement("Received")}/>}
        {active === "Issue Samples" && <MovementPage type="Issued" samples={samples} movements={filteredMovements} onNew={() => openMovement("Issued")}/>}
        {active === "Stock Movements" && <MovementPage type="All" samples={samples} movements={filteredMovements} onNew={() => openMovement("Received")}/>}
        {active === "Requests" && <Requests samples={samples} setNotice={setNotice}/>}
        {active === "Reports" && <Reports samples={samples} movements={movements} exportCsv={exportCsv}/>}
        {active === "Notifications" && <Notifications samples={samples}/>}
        {active === "Settings" && <SettingsPage/>}
        <footer className="sample-footer">Sample Incharge Dashboard <span>•</span> Local prototype <span className="sample-footer-note">Demo records reset when the page is refreshed. Backend integration comes later.</span></footer>
      </div>
    </main>
    {showSampleForm && <Modal title="Register a sample" onClose={() => setShowSampleForm(false)}><form className="sample-form" onSubmit={addSample}><label className="wide">Sample name<input required value={sampleForm.name} onChange={e => setSampleForm({...sampleForm, name:e.target.value})} placeholder="Enter sample name"/></label><label>Category<select value={sampleForm.category} onChange={e => setSampleForm({...sampleForm, category:e.target.value})}>{["Water","Soil","Air","Reference","Chemical","Other"].map(x=><option key={x}>{x}</option>)}</select></label><label>Storage location<select value={sampleForm.location} onChange={e => setSampleForm({...sampleForm, location:e.target.value})}>{["Central Store","Field Station 1","Field Station 2","Laboratory"].map(x=><option key={x}>{x}</option>)}</select></label><label>Opening quantity<input type="number" min="0" required value={sampleForm.quantity} onChange={e => setSampleForm({...sampleForm, quantity:e.target.value})}/></label><label>Unit<select value={sampleForm.unit} onChange={e => setSampleForm({...sampleForm, unit:e.target.value})}>{["units","bottles","packs","tubes","boxes","kg","litres"].map(x=><option key={x}>{x}</option>)}</select></label><label className="wide">Expiry / review date<input type="date" value={sampleForm.expiry} onChange={e => setSampleForm({...sampleForm, expiry:e.target.value})}/></label><div className="sample-form-actions"><button type="button" className="sample-btn secondary" onClick={() => setShowSampleForm(false)}>Cancel</button><button className="sample-btn primary"><Plus size={16}/> Register sample</button></div></form></Modal>}
    {showMovementForm && <Modal title={`${movementType} samples`} onClose={() => setShowMovementForm(false)}><form className="sample-form" onSubmit={saveMovement}><label className="wide">Sample<select required value={movementForm.sampleId} onChange={e => setMovementForm({...movementForm,sampleId:e.target.value})}>{samples.map(s=><option key={s.id} value={s.id}>{s.name} — {s.quantity} {s.unit} available</option>)}</select></label><label>Quantity<input type="number" min="1" required value={movementForm.quantity} onChange={e => setMovementForm({...movementForm,quantity:e.target.value})}/></label><label>Issued / received by<input value={movementForm.person} onChange={e => setMovementForm({...movementForm,person:e.target.value})} placeholder="Name or staff ID"/></label><label className="wide">Purpose / notes<input value={movementForm.notes} onChange={e => setMovementForm({...movementForm,notes:e.target.value})} placeholder="Optional notes"/></label><div className="sample-form-actions"><button type="button" className="sample-btn secondary" onClick={() => setShowMovementForm(false)}>Cancel</button><button className="sample-btn primary"><CheckCircle2 size={16}/> Record {movementType.toLowerCase()}</button></div></form></Modal>}
  </div>;
}

function Overview({samples,movements,totalUnits,low,out,onReceive,onIssue,onAdd,setActive,exportCsv}) {
  const available = samples.filter(s=>s.status==="Available").length;
  const expiring = samples.filter(s=>s.expiry && new Date(s.expiry) < new Date("2026-11-01")).length;
  return <><div className="sample-welcome"><div><div className="sample-eyebrow">THURSDAY, 15 OCTOBER 2026</div><h1>Good evening, Sample Incharge <span>👋</span></h1><p>Monitor sample inventory, receipts, issues and stock availability.</p></div><button className="sample-btn primary" onClick={onAdd}><Plus size={17}/> Register sample</button></div>
    <div className="sample-stats"><Stat icon={FlaskConical} label="Registered samples" value={samples.length} detail="Sample types / records" tone="blue"/><Stat icon={Boxes} label="Total stock units" value={totalUnits} detail="Across registered samples" tone="purple"/><Stat icon={AlertTriangle} label="Low / out of stock" value={low+out} detail={`${low} low stock · ${out} out of stock`} tone="orange"/><Stat icon={CheckCircle2} label="Available categories" value={available} detail="Records with usable stock" tone="green"/></div>
    <div className="sample-quick-grid"><button className="sample-quick" onClick={onReceive}><div className="sample-quick-icon green-bg"><ArrowDownToLine size={20}/></div><span><strong>Receive samples</strong><small>Record incoming stock</small></span><ArrowUpRight size={17}/></button><button className="sample-quick" onClick={onIssue}><div className="sample-quick-icon blue-bg"><ArrowUpFromLine size={20}/></div><span><strong>Issue samples</strong><small>Record outgoing stock</small></span><ArrowUpRight size={17}/></button><button className="sample-quick" onClick={()=>setActive("Stock Movements")}><div className="sample-quick-icon purple-bg"><History size={20}/></div><span><strong>Stock movements</strong><small>Review sample transactions</small></span><ArrowUpRight size={17}/></button></div>
    <div className="sample-panels"><section className="sample-panel"><div className="sample-panel-heading"><div><h2>Sample register snapshot</h2><p>Current sample stock and storage locations</p></div><button className="sample-text-button" onClick={()=>setActive("Sample Register")}>View register <ArrowUpRight size={15}/></button></div><SampleTable samples={samples.slice(0,4)}/></section>
    <section className="sample-panel"><div className="sample-panel-heading"><div><h2>Stock health</h2><p>Availability overview</p></div><button className="sample-more" onClick={()=>setActive("Reports")}><MoreHorizontal size={19}/></button></div><div className="sample-health-row"><div className="sample-health-icon green-bg"><Package size={20}/></div><div className="sample-health-copy"><strong>Available stock records</strong><span>Records with more than 5 units</span></div><b>{available}</b></div><div className="sample-health-bar"><span style={{width:`${samples.length?available/samples.length*100:0}%`}}/></div><div className="sample-health-legend"><span><i/> Available</span><span>{samples.length?Math.round(available/samples.length*100):0}%</span></div><div className="sample-warning"><AlertTriangle size={18}/><div><strong>{low+out} stock item(s) need attention</strong><span>Review low-stock and out-of-stock records.</span></div><button onClick={()=>setActive("Sample Register")}><ArrowUpRight size={16}/></button></div><div className="sample-mini-row"><CalendarDays size={17}/><span>Expiry / review dates</span><b>{expiring} due soon*</b></div><div className="sample-footnote">*Illustrative count based on demo dates.</div></section></div>
    <section className="sample-panel sample-recent"><div className="sample-panel-heading"><div><h2>Recent stock movements</h2><p>Latest receipts and issues</p></div><div className="sample-header-actions"><button className="sample-btn secondary" onClick={exportCsv}><Download size={15}/> Export register</button><button className="sample-text-button" onClick={()=>setActive("Stock Movements")}>View all <ArrowUpRight size={15}/></button></div></div><MovementTable movements={movements.slice(0,4)}/></section>
    <div className="sample-info"><div><ShieldCheck size={19}/></div><section><strong>Prototype notice</strong><p>Sample names, quantities, locations and transactions are illustrative demo data. This local prototype does not record official inventory or connect to a backend.</p></section></div>
  </>;
}
function Stat({icon:Icon,label,value,detail,tone}) {return <div className="sample-stat"><div className={`sample-stat-icon ${tone}-bg`}><Icon size={20}/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;}
function SampleTable({samples}) {return <div className="sample-table-wrap"><table className="sample-table"><thead><tr><th>Sample ID</th><th>Sample / category</th><th>Location</th><th>Quantity</th><th>Stock status</th></tr></thead><tbody>{samples.map(s=><tr key={s.id}><td><strong className="sample-id">{s.id}</strong><small>{s.received}</small></td><td><strong>{s.name}</strong><small>{s.category}</small></td><td>{s.location}</td><td><b>{s.quantity} {s.unit}</b></td><td><Status value={s.status}/></td></tr>)}</tbody></table>{!samples.length&&<div className="sample-empty">No sample records match your search.</div>}</div>;}
function MovementTable({movements}) {return <div className="sample-table-wrap"><table className="sample-table"><thead><tr><th>Movement ID</th><th>Sample</th><th>Type</th><th>Quantity</th><th>Handled by</th><th>Date</th></tr></thead><tbody>{movements.map(m=><tr key={m.id}><td><strong className="sample-id">{m.id}</strong></td><td><strong>{m.sample}</strong></td><td><span className={`sample-movement ${m.type.toLowerCase()}`}>{m.type}</span></td><td>{m.quantity} {m.unit}</td><td>{m.person}</td><td>{m.date}</td></tr>)}</tbody></table>{!movements.length&&<div className="sample-empty">No stock movements found.</div>}</div>;}
function Status({value}) {return <span className={`sample-status ${value==="Available"?"available":value==="Low stock"?"low": "out"}`}>{value}</span>;}
function Register({samples,onAdd,exportCsv}) {return <><PageIntro eyebrow="INVENTORY CONTROL" title="Sample Register" description="Maintain sample records, storage locations, quantities and stock status." action={<><button className="sample-btn secondary" onClick={exportCsv}><Download size={15}/> Export CSV</button><button className="sample-btn primary" onClick={onAdd}><Plus size={16}/> Register sample</button></>}/><div className="sample-stats compact"><Stat icon={FlaskConical} label="Shown records" value={samples.length} detail="Current filtered results" tone="blue"/><Stat icon={CheckCircle2} label="Available" value={samples.filter(s=>s.status==="Available").length} detail="Stock above threshold" tone="green"/><Stat icon={AlertTriangle} label="Low stock" value={samples.filter(s=>s.status==="Low stock").length} detail="Replenishment review" tone="orange"/><Stat icon={Package} label="Out of stock" value={samples.filter(s=>s.status==="Out of stock").length} detail="No units available" tone="purple"/></div><section className="sample-panel"><div className="sample-panel-heading"><div><h2>All registered samples</h2><p>Use the search box above to filter records.</p></div></div><SampleTable samples={samples}/></section></>;}
function MovementPage({type,samples,movements,onNew}) {const rows=type==="All"?movements:movements.filter(m=>m.type===type);return <><PageIntro eyebrow="STOCK CONTROL" title={type==="All"?"Stock Movements":`${type} Samples`} description={type==="All"?"Audit receipts and issues recorded in the local prototype.":`Record and review ${type.toLowerCase()} sample transactions.`} action={<button className="sample-btn primary" onClick={onNew}><Plus size={16}/> Record {type==="All"?"receipt":type.toLowerCase()}</button>}/><div className="sample-stats compact"><Stat icon={ClipboardList} label="Transactions shown" value={rows.length} detail="Local records" tone="blue"/><Stat icon={ArrowDownToLine} label="Received entries" value={rows.filter(m=>m.type==="Received").length} detail="Incoming stock" tone="green"/><Stat icon={ArrowUpFromLine} label="Issued entries" value={rows.filter(m=>m.type==="Issued").length} detail="Outgoing stock" tone="orange"/><Stat icon={Package} label="Sample types" value={new Set(rows.map(m=>m.sample)).size} detail="In these movements" tone="purple"/></div><section className="sample-panel"><div className="sample-panel-heading"><div><h2>{type==="All"?"Movement history":`${type} history`}</h2><p>New records update the sample balance in this browser session.</p></div></div><MovementTable movements={rows}/></section><section className="sample-panel"><div className="sample-panel-heading"><div><h2>Current stock balances</h2><p>Available quantity before the next transaction</p></div></div><SampleTable samples={samples}/></section></>;}
function Requests({samples,setNotice}) {return <><PageIntro eyebrow="SAMPLE REQUESTS" title="Requests" description="A starting point for tracking requests from offices and field stations." action={<button className="sample-btn primary" onClick={()=>setNotice("Request submission is a planned feature. No request was sent or saved.")}><Plus size={16}/> New request</button>}/><section className="sample-panel"><div className="sample-panel-heading"><div><h2>Request workflow</h2><p>Suggested process for later backend integration</p></div></div>{[["Submitted","Request raised by an office or field station"],["Reviewed","Sample Incharge checks availability and purpose"],["Issued / Rejected","Record issue quantity or reason for rejection"]].map(([title,desc],i)=><div className="sample-workflow" key={title}><div className="sample-workflow-number">{i+1}</div><div><strong>{title}</strong><p>{desc}</p></div><span className="sample-status planned">Planned</span></div>)}<div className="sample-request-note"><AlertTriangle size={17}/><span>There are no connected request records yet. This page documents the proposed workflow only.</span></div></section><section className="sample-panel"><div className="sample-panel-heading"><div><h2>Stock available for requests</h2><p>Reference list for planning sample allocation</p></div></div><SampleTable samples={samples}/></section></>;}
function Reports({samples,movements,exportCsv}) {const units=samples.reduce((n,s)=>n+s.quantity,0);return <><PageIntro eyebrow="INVENTORY INSIGHTS" title="Sample Reports" description="Basic summaries generated from local demonstration data." action={<button className="sample-btn primary" onClick={exportCsv}><Download size={16}/> Export register CSV</button>}/><div className="sample-stats"><Stat icon={FlaskConical} label="Sample records" value={samples.length} detail="Registered types" tone="blue"/><Stat icon={Package} label="Stock units" value={units} detail="Combined quantities" tone="purple"/><Stat icon={History} label="Movements" value={movements.length} detail="Receipts and issues" tone="green"/><Stat icon={AlertTriangle} label="Needs attention" value={samples.filter(s=>s.status!=="Available").length} detail="Low / no stock" tone="orange"/></div><section className="sample-panel sample-report"><h2>Stock status distribution</h2>{["Available","Low stock","Out of stock"].map(status=>{const n=samples.filter(s=>s.status===status).length;return <div className="sample-report-row" key={status}><span>{status}</span><div><i className={status==="Available"?"good":status==="Low stock"?"warn":"bad"} style={{width:`${samples.length?n/samples.length*100:0}%`}}/></div><b>{n}</b></div>})}</section></>;}
function Notifications({samples}) {const alerts=samples.filter(s=>s.status!=="Available");return <><PageIntro eyebrow="ALERTS & REMINDERS" title="Notifications" description="Local stock alerts based on demonstration records."/><section className="sample-panel"><div className="sample-panel-heading"><div><h2>Stock alerts</h2><p>{alerts.length} sample record(s) need review</p></div></div>{alerts.map(s=><div className="sample-notification" key={s.id}><div className="sample-quick-icon orange-bg"><AlertTriangle size={18}/></div><div><strong>{s.name}</strong><p>{s.id} · {s.location} · Balance: {s.quantity} {s.unit}</p></div><Status value={s.status}/></div>)}{!alerts.length&&<div className="sample-empty">No stock alerts at the moment.</div>}</section></>;}
function SettingsPage() {return <><PageIntro eyebrow="CONFIGURATION" title="Settings" description="Prototype configuration and future integration requirements."/><section className="sample-panel sample-settings">{[["Authentication","Not connected. Team will add role-based authentication later."],["Sample data","Local React state only; records reset when the page is refreshed."],["Audit trail","Future work: record receipts, issues, corrections and the user responsible."],["Stock thresholds","Current demo marks 5 or fewer units as low stock; confirm the real policy with your team."]].map(([title,desc])=><div key={title}><div className="sample-settings-icon"><Settings size={19}/></div><div><strong>{title}</strong><p>{desc}</p></div><span className="sample-status planned">Local prototype</span></div>)}</section></>;}
function PageIntro({eyebrow,title,description,action}) {return <div className="sample-page-intro"><div><div className="sample-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action&&<div className="sample-intro-actions">{action}</div>}</div>;}
function Modal({title,onClose,children}) {return <div className="sample-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="sample-modal"><div className="sample-modal-heading"><h2>{title}</h2><button onClick={onClose} className="sample-icon-button"><X size={19}/></button></div>{children}</section></div>;}
export default App;
