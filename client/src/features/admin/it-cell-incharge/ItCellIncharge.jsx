import React, { useMemo, useState } from 'react';
import './ItCellIncharge.css';
import {
  LayoutDashboard, Monitor, Ticket, Wrench, ClipboardList, Users, FileText,
  Bell, Settings, Search, Plus, ChevronDown, Menu, X, CheckCircle2,
  Clock3, AlertTriangle, Laptop, Printer, Wifi, ShieldCheck, CalendarDays,
  ArrowUpRight, MoreHorizontal, CircleHelp, LogOut, Download
} from 'lucide-react';

const initialTickets = [
  { id: 'IT-2026-014', title: 'Laptop not booting', requester: 'Ananya Rao', unit: 'Accounts', priority: 'High', status: 'Open', date: '15 Oct 2026' },
  { id: 'IT-2026-013', title: 'Printer queue stuck', requester: 'Rahul Kumar', unit: 'Administration', priority: 'Medium', status: 'In Progress', date: '15 Oct 2026' },
  { id: 'IT-2026-012', title: 'Official email access', requester: 'Meera Nair', unit: 'Establishment', priority: 'Low', status: 'Open', date: '14 Oct 2026' },
  { id: 'IT-2026-011', title: 'Network connection unstable', requester: 'Vikram Singh', unit: 'Finance', priority: 'High', status: 'Resolved', date: '13 Oct 2026' },
];

const initialAssets = [
  { id: 'AST-001', name: 'Office Laptop', tag: 'IT-LAP-001', assigned: 'Ananya Rao', unit: 'Accounts', condition: 'Good' },
  { id: 'AST-002', name: 'Desktop Computer', tag: 'IT-DES-014', assigned: 'Rahul Kumar', unit: 'Administration', condition: 'Good' },
  { id: 'AST-003', name: 'Laser Printer', tag: 'IT-PRN-003', assigned: 'Shared device', unit: 'Establishment', condition: 'Needs service' },
  { id: 'AST-004', name: 'Network Router', tag: 'IT-NET-002', assigned: 'IT Cell', unit: 'IT Cell', condition: 'Good' },
];

const navItems = [
  ['Overview', LayoutDashboard], ['IT Assets', Monitor], ['Helpdesk Tickets', Ticket],
  ['Maintenance', Wrench], ['Inventory Register', ClipboardList], ['Users & Devices', Users],
  ['Reports', FileText], ['Notifications', Bell], ['Settings', Settings]
];

function App() {
  const [active, setActive] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState(initialTickets);
  const [assets, setAssets] = useState(initialAssets);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [ticketForm, setTicketForm] = useState({ title: '', requester: '', unit: 'Administration', priority: 'Medium' });
  const [assetForm, setAssetForm] = useState({ name: '', tag: '', assigned: '', unit: 'IT Cell', condition: 'Good' });

  const filteredTickets = useMemo(() => tickets.filter(t =>
    [t.id, t.title, t.requester, t.unit, t.status].join(' ').toLowerCase().includes(search.toLowerCase())
  ), [tickets, search]);
  const filteredAssets = useMemo(() => assets.filter(a =>
    [a.id, a.name, a.tag, a.assigned, a.unit].join(' ').toLowerCase().includes(search.toLowerCase())
  ), [assets, search]);

  function addTicket(e) {
    e.preventDefault();
    const next = String(15 + tickets.length - initialTickets.length).padStart(3, '0');
    setTickets([{ id: `IT-2026-${next}`, ...ticketForm, status: 'Open', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }, ...tickets]);
    setTicketForm({ title: '', requester: '', unit: 'Administration', priority: 'Medium' });
    setShowTicketForm(false); setNotice('Ticket created locally. It has not been sent to a backend.');
  }
  function addAsset(e) {
    e.preventDefault();
    setAssets([{ id: `AST-${String(assets.length + 1).padStart(3, '0')}`, ...assetForm }, ...assets]);
    setAssetForm({ name: '', tag: '', assigned: '', unit: 'IT Cell', condition: 'Good' });
    setShowAssetForm(false); setNotice('Asset added locally. It has not been saved to a backend.');
  }
  function updateTicket(id, status) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    setNotice(`Ticket ${id} marked ${status.toLowerCase()} locally.`);
  }
  function exportTickets() {
    const rows = [['Ticket ID','Title','Requester','Unit','Priority','Status','Date'], ...tickets.map(t => [t.id,t.title,t.requester,t.unit,t.priority,t.status,t.date])];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'it-cell-tickets.csv'; link.click(); URL.revokeObjectURL(url);
  }

  const isOverview = active === 'Overview';
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={25}/></div><div><strong>GOV FMS</strong><span>Government Finance System</span></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="role-label">INCHARGE WORKSPACE</div>
      <nav>{navItems.map(([label, Icon]) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => {setActive(label); setMobileOpen(false); setSearch('');}}><Icon size={18}/><span>{label}</span>{label === 'Helpdesk Tickets' && <em>{tickets.filter(t => t.status !== 'Resolved').length}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><CircleHelp size={20}/><div><strong>Need assistance?</strong><span>View IT guidelines</span></div><ArrowUpRight size={15}/></div><button className="nav-item logout" onClick={() => setNotice('This local demo has no sign-out session.')}><LogOut size={18}/><span>Sign out</span></button></div>
    </aside>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <main className="main">
      <header className="topbar"><div className="top-left"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div><div className="page-heading">{active}</div></div></div><div className="top-actions"><label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets, assets..."/></label><button className="icon-button notification-button" onClick={() => setActive('Notifications')} aria-label="Notifications"><Bell size={19}/><i/></button><div className="profile"><div className="avatar">IC</div><div className="profile-text"><strong>IT Cell Incharge</strong><span>Department Admin</span></div><ChevronDown size={16}/></div></div></header>
      <div className="content">
        {notice && <div className="notice"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
        {isOverview ? <Overview tickets={tickets} assets={assets} onTicket={() => setShowTicketForm(true)} onAsset={() => setShowAssetForm(true)} setActive={setActive} updateTicket={updateTicket}/> :
          active === 'IT Assets' || active === 'Inventory Register' || active === 'Users & Devices' ? <AssetsPage assets={filteredAssets} onAdd={() => setShowAssetForm(true)} active={active}/> :
          active === 'Helpdesk Tickets' || active === 'Maintenance' ? <TicketsPage tickets={filteredTickets} onAdd={() => setShowTicketForm(true)} updateTicket={updateTicket} maintenance={active === 'Maintenance'} onExport={exportTickets}/> :
          active === 'Reports' ? <Reports tickets={tickets} assets={assets} onExport={exportTickets}/> :
          active === 'Notifications' ? <Notifications tickets={tickets}/> :
          <SettingsPage/>}
        <footer>IT Cell Incharge Dashboard <span>•</span> Local prototype <span className="footer-note">Data is stored in this page session only. Backend integration comes later.</span></footer>
      </div>
    </main>
    {showTicketForm && <Modal title="Create helpdesk ticket" onClose={() => setShowTicketForm(false)}><form onSubmit={addTicket} className="form-grid"><label className="full">Issue title<input required value={ticketForm.title} onChange={e => setTicketForm({...ticketForm,title:e.target.value})} placeholder="e.g. System not connecting to network"/></label><label>Requester name<input required value={ticketForm.requester} onChange={e => setTicketForm({...ticketForm,requester:e.target.value})} placeholder="Employee name"/></label><label>Office / unit<select value={ticketForm.unit} onChange={e => setTicketForm({...ticketForm,unit:e.target.value})}>{['Administration','Accounts','Establishment','Finance','IT Cell','Field Station 1','Field Station 2'].map(x=><option key={x}>{x}</option>)}</select></label><label>Priority<select value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm,priority:e.target.value})}>{['Low','Medium','High','Urgent'].map(x=><option key={x}>{x}</option>)}</select></label><div className="form-actions"><button type="button" className="btn secondary" onClick={() => setShowTicketForm(false)}>Cancel</button><button className="btn primary"><Plus size={16}/> Create ticket</button></div></form></Modal>}
    {showAssetForm && <Modal title="Register IT asset" onClose={() => setShowAssetForm(false)}><form onSubmit={addAsset} className="form-grid"><label>Asset name<input required value={assetForm.name} onChange={e => setAssetForm({...assetForm,name:e.target.value})} placeholder="e.g. Desktop computer"/></label><label>Asset tag<input required value={assetForm.tag} onChange={e => setAssetForm({...assetForm,tag:e.target.value})} placeholder="IT-DES-015"/></label><label>Assigned to<input required value={assetForm.assigned} onChange={e => setAssetForm({...assetForm,assigned:e.target.value})} placeholder="Employee or unit"/></label><label>Office / unit<select value={assetForm.unit} onChange={e => setAssetForm({...assetForm,unit:e.target.value})}>{['IT Cell','Administration','Accounts','Establishment','Finance','Field Station 1','Field Station 2'].map(x=><option key={x}>{x}</option>)}</select></label><label className="full">Condition<select value={assetForm.condition} onChange={e => setAssetForm({...assetForm,condition:e.target.value})}>{['Good','Needs service','Under repair','Retired'].map(x=><option key={x}>{x}</option>)}</select></label><div className="form-actions"><button type="button" className="btn secondary" onClick={() => setShowAssetForm(false)}>Cancel</button><button className="btn primary"><Plus size={16}/> Add asset</button></div></form></Modal>}
  </div>;
}

function Overview({tickets, assets, onTicket, onAsset, setActive, updateTicket}) {
  const open = tickets.filter(t => t.status === 'Open').length;
  const progress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const service = assets.filter(a => a.condition !== 'Good').length;
  return <><div className="welcome-row"><div><div className="eyebrow">THURSDAY, 15 OCTOBER 2026</div><h1>Good evening, IT Cell Incharge <span>👋</span></h1><p>Here’s the current snapshot of IT services, equipment and support requests.</p></div><button className="btn primary" onClick={onTicket}><Plus size={17}/> New ticket</button></div>
    <div className="stats-grid"><Stat icon={Ticket} label="Open tickets" value={open} detail="Awaiting action" tone="blue"/><Stat icon={Clock3} label="In progress" value={progress} detail="Being worked on" tone="orange"/><Stat icon={CheckCircle2} label="Resolved tickets" value={resolved} detail="Completed requests" tone="green"/><Stat icon={Monitor} label="IT assets" value={assets.length} detail={`${service} need attention`} tone="purple"/></div>
    <div className="quick-grid"><button onClick={onTicket} className="quick-action"><div className="quick-icon blue-bg"><Ticket size={20}/></div><span><strong>Log a support ticket</strong><small>Record a new IT issue</small></span><ArrowUpRight size={17}/></button><button onClick={onAsset} className="quick-action"><div className="quick-icon purple-bg"><Laptop size={20}/></div><span><strong>Register an asset</strong><small>Add equipment to inventory</small></span><ArrowUpRight size={17}/></button><button onClick={() => setActive('Maintenance')} className="quick-action"><div className="quick-icon orange-bg"><Wrench size={20}/></div><span><strong>Maintenance queue</strong><small>Review items needing service</small></span><ArrowUpRight size={17}/></button></div>
    <div className="panel-grid"><section className="panel"><div className="panel-heading"><div><h2>Recent helpdesk tickets</h2><p>Track incoming requests and their status</p></div><button className="text-button" onClick={() => setActive('Helpdesk Tickets')}>View all <ArrowUpRight size={15}/></button></div><TicketTable tickets={tickets.slice(0,4)} updateTicket={updateTicket}/></section>
      <section className="panel"><div className="panel-heading"><div><h2>IT asset health</h2><p>Equipment requiring attention</p></div><button className="more-button" onClick={() => setActive('IT Assets')}><MoreHorizontal size={19}/></button></div><div className="asset-health"><div className="health-icon green-bg"><Monitor size={20}/></div><div className="health-copy"><strong>Operational assets</strong><span>Marked in good condition</span></div><b>{assets.filter(a=>a.condition==='Good').length}</b></div><div className="health-bar"><span style={{width:`${assets.length ? assets.filter(a=>a.condition==='Good').length/assets.length*100 : 0}%`}}/></div><div className="health-legend"><span><i className="dot green-dot"/> Good condition</span><span>{assets.length ? Math.round(assets.filter(a=>a.condition==='Good').length/assets.length*100) : 0}%</span></div><div className="maintenance-callout"><AlertTriangle size={18}/><div><strong>{assets.filter(a=>a.condition!=='Good').length} asset(s) need attention</strong><span>Review maintenance and service requirements.</span></div><button onClick={() => setActive('Maintenance')}><ArrowUpRight size={16}/></button></div><div className="mini-links"><div><Wifi size={17}/><span>Network & connectivity</span><b>Monitor</b></div><div><Printer size={17}/><span>Printers & peripherals</span><b>Monitor</b></div></div></section></div>
    <div className="panel notice-panel"><div className="notice-symbol"><Bell size={19}/></div><div><strong>Prototype notice</strong><p>The figures and sample records on this screen are demonstration data. New tickets and assets are kept only in the current browser session until your team connects the backend.</p></div></div>
  </>;
}

function Stat({icon:Icon,label,value,detail,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}-bg`}><Icon size={20}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>; }

function TicketTable({tickets, updateTicket}) {
  if (!tickets.length) return <div className="empty-state">No tickets match your search.</div>;
  return <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Issue / requester</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>{tickets.map(t=><tr key={t.id}><td><strong className="ticket-id">{t.id}</strong><small>{t.date}</small></td><td><strong>{t.title}</strong><small>{t.requester} · {t.unit}</small></td><td><span className={`priority ${t.priority.toLowerCase()}`}><i/>{t.priority}</span></td><td><span className={`status ${t.status.toLowerCase().replace(' ','-')}`}>{t.status}</span></td><td>{t.status!=='Resolved' ? <select className="row-select" value={t.status} onChange={e=>updateTicket(t.id,e.target.value)} aria-label={`Update ${t.id}`}><option>Open</option><option>In Progress</option><option>Resolved</option></select> : <span className="done-mark"><CheckCircle2 size={16}/></span>}</td></tr>)}</tbody></table></div>;
}

function TicketsPage({tickets,onAdd,updateTicket,maintenance,onExport}) {
  const rows = maintenance ? tickets.filter(t=>t.status!=='Resolved' || t.priority==='High') : tickets;
  return <><div className="section-intro"><div><div className="eyebrow">SERVICE MANAGEMENT</div><h1>{maintenance?'Maintenance queue':'Helpdesk tickets'}</h1><p>{maintenance?'Follow up on unresolved technical issues and equipment maintenance.':'Register, assign and track IT support requests.'}</p></div><div className="button-row"><button className="btn secondary" onClick={onExport}><Download size={16}/> Export CSV</button><button className="btn primary" onClick={onAdd}><Plus size={17}/> New ticket</button></div></div><div className="stats-grid compact-stats"><Stat icon={Ticket} label="Total shown" value={rows.length} detail="Current records" tone="blue"/><Stat icon={AlertTriangle} label="High priority" value={rows.filter(t=>t.priority==='High'||t.priority==='Urgent').length} detail="Needs attention" tone="orange"/><Stat icon={Clock3} label="In progress" value={rows.filter(t=>t.status==='In Progress').length} detail="Under action" tone="purple"/><Stat icon={CheckCircle2} label="Resolved" value={rows.filter(t=>t.status==='Resolved').length} detail="Completed" tone="green"/></div><section className="panel"><div className="panel-heading"><div><h2>{maintenance?'Items requiring follow-up':'All tickets'}</h2><p>Use the action selector to update ticket status locally.</p></div></div><TicketTable tickets={rows} updateTicket={updateTicket}/></section></>;
}

function AssetsPage({assets,onAdd,active}) {
  return <><div className="section-intro"><div><div className="eyebrow">EQUIPMENT & INVENTORY</div><h1>{active}</h1><p>Maintain a simple register of IT equipment, assignment and condition.</p></div><button className="btn primary" onClick={onAdd}><Plus size={17}/> Register asset</button></div><div className="stats-grid compact-stats"><Stat icon={Monitor} label="Total assets" value={assets.length} detail="Listed records" tone="blue"/><Stat icon={CheckCircle2} label="Good condition" value={assets.filter(a=>a.condition==='Good').length} detail="Operational" tone="green"/><Stat icon={Wrench} label="Need attention" value={assets.filter(a=>a.condition!=='Good').length} detail="Service / repair" tone="orange"/><Stat icon={Users} label="Units represented" value={new Set(assets.map(a=>a.unit)).size} detail="Office locations" tone="purple"/></div><section className="panel"><div className="panel-heading"><div><h2>Asset register</h2><p>Sample equipment records — replace with official inventory later.</p></div></div><div className="table-wrap"><table><thead><tr><th>Asset ID</th><th>Equipment</th><th>Asset tag</th><th>Assigned to</th><th>Office / unit</th><th>Condition</th></tr></thead><tbody>{assets.map(a=><tr key={a.id}><td><strong className="ticket-id">{a.id}</strong></td><td><strong>{a.name}</strong></td><td>{a.tag}</td><td>{a.assigned}</td><td>{a.unit}</td><td><span className={`status ${a.condition==='Good'?'resolved':'open'}`}>{a.condition}</span></td></tr>)}</tbody></table>{!assets.length&&<div className="empty-state">No assets match your search.</div>}</div></section></>;
}

function Reports({tickets,assets,onExport}) {
  const resolved = tickets.filter(t=>t.status==='Resolved').length;
  return <><div className="section-intro"><div><div className="eyebrow">OVERVIEW & EXPORTS</div><h1>IT Reports</h1><p>Basic operational summaries from the local sample data.</p></div><button className="btn primary" onClick={onExport}><Download size={16}/> Export ticket CSV</button></div><div className="stats-grid"><Stat icon={Ticket} label="Total tickets" value={tickets.length} detail="All recorded tickets" tone="blue"/><Stat icon={CheckCircle2} label="Resolution rate" value={`${tickets.length?Math.round(resolved/tickets.length*100):0}%`} detail="Resolved / total" tone="green"/><Stat icon={Monitor} label="Assets registered" value={assets.length} detail="Inventory count" tone="purple"/><Stat icon={Wrench} label="Assets needing service" value={assets.filter(a=>a.condition!=='Good').length} detail="Maintenance follow-up" tone="orange"/></div><section className="panel report-panel"><h2>Ticket status summary</h2>{['Open','In Progress','Resolved'].map(status=>{const count=tickets.filter(t=>t.status===status).length;return <div className="report-row" key={status}><span>{status}</span><div className="report-track"><i style={{width:`${tickets.length?count/tickets.length*100:0}%`}}/></div><strong>{count}</strong></div>})}</section></>;
}

function Notifications({tickets}) {
  const active = tickets.filter(t=>t.status!=='Resolved');
  return <><div className="section-intro"><div><div className="eyebrow">UPDATES</div><h1>Notifications</h1><p>Local reminders based on current demonstration records.</p></div></div><section className="panel"><div className="panel-heading"><div><h2>Needs your attention</h2><p>{active.length} unresolved ticket(s)</p></div></div>{active.map(t=><div className="notification-row" key={t.id}><div className={`quick-icon ${t.priority==='High'?'orange-bg':'blue-bg'}`}><Bell size={18}/></div><div><strong>{t.title}</strong><p>{t.id} · {t.requester} · {t.status}</p></div><span className={`priority ${t.priority.toLowerCase()}`}><i/>{t.priority}</span></div>)}{!active.length&&<div className="empty-state">You’re all caught up.</div>}</section></>;
}

function SettingsPage() {
  return <><div className="section-intro"><div><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p>Initial local prototype settings and future integration notes.</p></div></div><section className="panel settings-list"><div><div className="settings-icon"><ShieldCheck size={19}/></div><div><strong>Authentication</strong><p>Not connected. Team will add backend authentication later.</p></div><span className="status open">Pending integration</span></div><div><div className="settings-icon"><ClipboardList size={19}/></div><div><strong>Data persistence</strong><p>Demo records reset when the page is refreshed.</p></div><span className="status open">Local only</span></div><div><div className="settings-icon"><CalendarDays size={19}/></div><div><strong>Audit history</strong><p>Future work: track who changed a ticket or asset and when.</p></div><span className="status in-progress">Planned</span></div></section></>;
}

function Modal({title,onClose,children}) { return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal"><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={19}/></button></div>{children}</section></div>; }

export default App;