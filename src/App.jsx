import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "wattwise-energy-demo-v1";
const DEMO_USER = { name: "Emmanuel Anah", email: "Emmanuel@example.com" };
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "consumption", label: "Consumption", icon: "activity" },
  { id: "insights", label: "Insights", icon: "sparkles" },
  { id: "reports", label: "Reports", icon: "file" },
];

function readStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.records && saved?.home && saved?.meters) {
      if (saved.user?.name === "Rukayat Yakubu" && saved.user?.email === "rukayat@example.com") {
        saved.user = DEMO_USER;
      }
      return saved;
    }
  } catch (error) {
    console.warn("Could not read the saved demo workspace.", error);
  }
  return null;
}

function makeInitialState() {
  const saved = readStorage();
  if (saved) return saved;
  const today = new Date();
  const records = Array.from({ length: 90 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (89 - index));
    const day = date.getDate();
    const weekday = date.getDay();
    const seasonal = Math.sin(index * 0.43) * 2.4 + Math.cos(index * 0.17) * 1.4;
    const weekend = weekday === 0 || weekday === 6 ? 2 : 0;
    const spike = [12, 38, 63, 81].includes(index) ? 5 : 0;
    return {
      id: `seed-${index}`,
      date: date.toISOString().slice(0, 10),
      kwh: Number(Math.max(4.2, 8.6 + seasonal + weekend + spike).toFixed(1)),
      meterId: "meter-main",
      note: index === 81 ? "Air conditioner used more than usual" : "",
    };
  });
  return {
    records,
    home: { name: "Faculty of Science Quarters", address: "University of Ibadan, Ibadan" },
    meters: [{ id: "meter-main", name: "Main prepaid meter", serial: "IBQ-2048-7361", type: "Prepaid", status: "Active" }],
    settings: { rate: 225, target: 300, currency: "₦" },
    reports: [],
    user: DEMO_USER,
  };
}

function formatNumber(value, digits = 1) {
  return Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: digits });
}

function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", options);
}

function dateOffset(date, offset) {
  const result = new Date(date);
  result.setDate(result.getDate() + offset);
  return result.toISOString().slice(0, 10);
}

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /><path d="M4 20h16" /></>,
    sparkles: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    bolt: <path d="m13 2-3 8h7L9 22l2-9H5l8-11Z" />,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 15h.01" /><path d="M7 5V3h11" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    meter: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h3M8 16h8M15 12h1" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m7 10 5 5 5-5" />,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 17v3h14v-3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  };
  return <svg {...common}>{paths[name] || paths.info}</svg>;
}

function App() {
  const [data, setData] = useState(makeInitialState);
  const [activePage, setActivePage] = useState("overview");
  const [range, setRange] = useState(30);
  const [search, setSearch] = useState("");
  const [filterRange, setFilterRange] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Could not save the demo workspace in this browser.", error);
    }
  }, [data]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const today = new Date().toISOString().slice(0, 10);
  const sortedRecords = useMemo(() => [...data.records].sort((a, b) => b.date.localeCompare(a.date)), [data.records]);
  const dashboardStats = useMemo(() => {
    const currentStart = dateOffset(today, -29);
    const previousStart = dateOffset(today, -59);
    const current = data.records.filter((row) => row.date >= currentStart && row.date <= today);
    const previous = data.records.filter((row) => row.date >= previousStart && row.date < currentStart);
    const total = current.reduce((sum, row) => sum + Number(row.kwh), 0);
    const previousTotal = previous.reduce((sum, row) => sum + Number(row.kwh), 0);
    const change = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0;
    const dailyAverage = current.length ? total / 30 : 0;
    const peak = current.reduce((best, row) => Number(row.kwh) > Number(best?.kwh || 0) ? row : best, null);
    return { total, previousTotal, change, dailyAverage, peak, records: current.length, estimatedCost: total * Number(data.settings.rate || 0) };
  }, [data.records, data.settings.rate, today]);

  const chartData = useMemo(() => {
    const end = new Date(`${today}T00:00:00`);
    const days = Array.from({ length: range }, (_, index) => {
      const date = new Date(end);
      date.setDate(end.getDate() - (range - index - 1));
      const key = date.toISOString().slice(0, 10);
      const records = data.records.filter((row) => row.date === key);
      return { date: key, label: range === 90 ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: records.reduce((sum, row) => sum + Number(row.kwh), 0) };
    });
    if (range === 90) {
      return Array.from({ length: 12 }, (_, index) => {
        const bucket = days.slice(index * 7, index * 7 + 7);
        return { date: bucket[0]?.date, label: bucket[0]?.label, value: bucket.reduce((sum, item) => sum + item.value, 0) };
      });
    }
    return days;
  }, [data.records, range, today]);

  const allUsage = data.records.reduce((sum, row) => sum + Number(row.kwh), 0);
  const usageByMeter = (meterId) => data.records.filter((row) => row.meterId === meterId).reduce((sum, row) => sum + Number(row.kwh), 0);

  function updateData(updater) {
    setData((current) => typeof updater === "function" ? updater(current) : { ...current, ...updater });
  }

  function notify(message) {
    setToast(message);
  }

  function saveRecord(record) {
    updateData((current) => {
      const exists = current.records.some((row) => row.id === record.id);
      const records = exists ? current.records.map((row) => row.id === record.id ? record : row) : [...current.records, record];
      return { ...current, records };
    });
    setModal(null);
    notify("Consumption record saved.");
  }

  function deleteRecord(id) {
    updateData((current) => ({ ...current, records: current.records.filter((row) => row.id !== id) }));
    notify("Record deleted.");
  }

  function downloadCsv(records = sortedRecords, filename = "wattwise-consumption.csv") {
    const rows = [["Date", "Consumption (kWh)", "Meter", "Note"], ...records.map((record) => [
      record.date,
      record.kwh,
      data.meters.find((meter) => meter.id === record.meterId)?.name || "Unassigned meter",
      record.note || "",
    ])];
    const csv = rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    notify("Your CSV is ready to download.");
  }

  function generateReport() {
    const report = { id: crypto.randomUUID(), name: "Consumption summary", created: new Date().toISOString(), period: "Last 30 days", count: dashboardStats.records, kwh: dashboardStats.total };
    updateData((current) => ({ ...current, reports: [report, ...current.reports] }));
    downloadCsv(data.records.filter((row) => row.date >= dateOffset(today, -29) && row.date <= today), `wattwise-report-${today}.csv`);
    notify("Report generated and downloaded.");
  }

  function pageTitle() {
    return ({ overview: "Overview", consumption: "Consumption", insights: "Insights", reports: "Reports", residence: "Residence & meter", settings: "Settings" })[activePage] || "Overview";
  }

  if (!isAuthenticated) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={(user) => {
      updateData((current) => ({ ...current, user }));
      setIsAuthenticated(true);
      notify(`Welcome back, ${user.name.split(" ")[0]}.`);
    }} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Icon name="bolt" size={23} strokeWidth={2.2} /></div>
          <span>wattwise<span className="brand-period">.</span></span>
          <button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switch" onClick={() => setActivePage("residence")}>
          <span className="workspace-avatar"><Icon name="home" size={17} /></span>
          <span className="workspace-text"><strong>{data.home.name}</strong><small>Residential account</small></span>
          <Icon name="down" size={16} />
        </button>
        <div className="nav-caption">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => { setActivePage(item.id); setMenuOpen(false); }}>
              <Icon name={item.icon} size={19} /><span>{item.label}</span>
              {item.id === "insights" && <span className="nav-new">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="nav-caption manage-caption">MANAGE</div>
        <nav className="main-nav" aria-label="Workspace settings">
          <button className={`nav-item ${activePage === "residence" ? "active" : ""}`} onClick={() => { setActivePage("residence"); setMenuOpen(false); }}><Icon name="home" size={19} /><span>Residence & meter</span></button>
          <button className={`nav-item ${activePage === "settings" ? "active" : ""}`} onClick={() => { setActivePage("settings"); setMenuOpen(false); }}><Icon name="meter" size={19} /><span>Preferences</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><span className="support-icon"><Icon name="sparkles" size={17} /></span><strong>Small changes add up.</strong><p>See how your home is using energy this month.</p><button onClick={() => setActivePage("insights")}>Explore insights <Icon name="arrow" size={15} /></button></div>
          <button className="profile-button" onClick={() => setModal({ type: "profile" })}>
            <span className="profile-avatar">{(data.user?.name || "R").split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>
            <span className="profile-info"><strong>{data.user?.name || "Demo resident"}</strong><small>{data.user?.email || "demo@example.com"}</small></span>
            <Icon name="down" size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={15} /><strong>{pageTitle()}</strong></div>
          <div className="topbar-actions">
            <div className="search-wrap"><Icon name="search" size={18} /><input aria-label="Search records" placeholder="Search anything..." value={search} onChange={(event) => { setSearch(event.target.value); if (event.target.value) setActivePage("consumption"); }} /><kbd>⌘ K</kbd></div>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You're all caught up.")}><Icon name="bell" size={19} /><i /></button>
            <button className="header-avatar" aria-label="Account" onClick={() => setModal({ type: "profile" })}>{(data.user?.name || "R").split(" ").map((word) => word[0]).slice(0, 2).join("")}</button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="demo-banner"><span className="demo-dot" /><strong>YOUR ENERGY WORKSPACE</strong><span>....</span><button onClick={() => { localStorage.removeItem(STORAGE_KEY); updateData(makeInitialState()); notify("Demo data has been reset."); }}>RELOAD WORKSPACE</button></div>
          {activePage === "overview" && <Overview data={data} stats={dashboardStats} chartData={chartData} range={range} setRange={setRange} onAdd={() => setModal({ type: "record" })} onNavigate={setActivePage} records={sortedRecords} />}
          {activePage === "consumption" && <ConsumptionPage records={sortedRecords} meters={data.meters} query={search} setQuery={setSearch} filterRange={filterRange} setFilterRange={setFilterRange} onAdd={() => setModal({ type: "record" })} onEdit={(record) => setModal({ type: "record", record })} onDelete={deleteRecord} onExport={() => downloadCsv()} />}
          {activePage === "insights" && <InsightsPage stats={dashboardStats} records={sortedRecords} settings={data.settings} onAdd={() => setModal({ type: "record" })} />}
          {activePage === "reports" && <ReportsPage reports={data.reports} stats={dashboardStats} records={sortedRecords} onGenerate={generateReport} onExport={() => downloadCsv()} />}
          {activePage === "residence" && <ResidencePage data={data} updateData={updateData} usageByMeter={usageByMeter} onNotify={notify} />}
          {activePage === "settings" && <SettingsPage data={data} updateData={updateData} onNotify={notify} />}
        </div>
      </main>
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      {modal?.type === "record" && <RecordModal record={modal.record} meters={data.meters} onClose={() => setModal(null)} onSave={saveRecord} />}
      {modal?.type === "profile" && <ProfileModal user={data.user} onClose={() => setModal(null)} onLogout={() => { setModal(null); setIsAuthenticated(false); setAuthMode("login"); }} />}
      {toast && <div className="toast"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}</div>}
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Overview({ data, stats, chartData, range, setRange, onAdd, onNavigate, records }) {
  return <>
    <PageIntro eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()} title={`Good morning, ${(data.user?.name || "there").split(" ")[0]} ☀️`} description="Here’s what’s happening with your home’s energy." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={18} /> Add a reading</button>} />
    <div className="snapshot-row"><div className="snapshot-home"><span className="snapshot-icon"><Icon name="home" size={17} /></span><div><span>YOUR RESIDENCE</span><strong>{data.home.name}</strong></div><i /></div><div className="snapshot-meta"><span className="status-pip" /> Meter active <span className="snapshot-sep">·</span> Last reading {records[0] ? formatDate(records[0].date, { day: "numeric", month: "short" }) : "—"}</div><span className="sample-chip">SIMULATED DATA</span></div>
    <div className="metric-grid">
      <MetricCard icon="bolt" accent="green" label="Energy consumed" value={<>{formatNumber(stats.total)} <small>kWh</small></>} change={stats.change} foot="vs. previous 30 days" />
      <MetricCard icon="wallet" accent="violet" label="Estimated cost" value={`${data.settings.currency}${formatNumber(stats.estimatedCost, 0)}`} detail="at your saved electricity rate" />
      <MetricCard icon="trend" accent="amber" label="Daily average" value={<>{formatNumber(stats.dailyAverage)} <small>kWh</small></>} detail={`${stats.records} readings this month`} />
      <MetricCard icon="activity" accent="blue" label="Highest reading" value={<>{formatNumber(stats.peak?.kwh || 0)} <small>kWh</small></>} detail={stats.peak ? formatDate(stats.peak.date) : "No readings yet"} />
    </div>
    <div className="dashboard-grid">
      <section className="panel chart-panel">
        <div className="panel-heading"><div><div className="section-title">Energy consumption</div><div className="section-subtitle">Track your usage over time</div></div><div className="chart-controls"><span className="chart-legend"><i /> Energy used</span><select aria-label="Chart date range" value={range} onChange={(event) => setRange(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></div></div>
        <EnergyChart data={chartData} range={range} />
      </section>
      <section className="panel target-panel">
        <div className="panel-heading"><div><div className="section-title">Monthly target</div><div className="section-subtitle">Your energy goal</div></div><button className="more-button" onClick={() => onNavigate("settings")}>···</button></div>
        <div className="target-orbit"><div className="target-ring" style={{ "--progress": `${Math.min(100, (stats.total / Math.max(data.settings.target, 1)) * 100)}%` }}><div><strong>{Math.round((stats.total / Math.max(data.settings.target, 1)) * 100)}<small>%</small></strong><span>of monthly goal</span></div></div></div>
        <div className="target-numbers"><div><span>Used so far</span><strong>{formatNumber(stats.total)} kWh</strong></div><div><span>Monthly limit</span><strong>{formatNumber(data.settings.target, 0)} kWh</strong></div></div>
        <div className="target-foot"><span className="target-foot-dot" /> {stats.total <= data.settings.target ? `${formatNumber(Math.max(0, data.settings.target - stats.total))} kWh left in your target` : "You’ve passed your monthly target"}</div>
      </section>
    </div>
    <div className="lower-grid">
      <section className="panel recent-panel"><div className="panel-heading"><div><div className="section-title">Recent readings</div><div className="section-subtitle">Your latest meter entries</div></div><button className="text-button" onClick={() => onNavigate("consumption")}>View all <Icon name="arrow" size={15} /></button></div>
        <div className="reading-list">{records.slice(0, 5).map((record, index) => <ReadingRow key={record.id} record={record} meter={data.meters.find((item) => item.id === record.meterId)} index={index} />)}</div>
        {records.length === 0 && <EmptyState title="No readings yet" text="Add a meter reading to start tracking your usage." />}
      </section>
      <section className="tip-card"><div className="tip-top"><span className="tip-icon"><Icon name="sparkles" size={18} /></span><span className="tip-label">YOUR ENERGY INSIGHT</span><span className="tip-sparkle">✳</span></div><h3>{stats.change > 5 ? "Your usage is trending up." : "You’re building a clearer picture."}</h3><p>{stats.change > 5 ? `You used ${Math.abs(stats.change).toFixed(0)}% more energy this month than the last. Review your recent readings to spot what changed.` : "A few more readings make your month-to-month comparisons even more useful. Keep logging your meter usage."}</p><button onClick={() => onNavigate("insights")}>See all insights <Icon name="arrow" size={16} /></button><div className="tip-graphic"><span /><span /><span /><span /><span /><span /><span /></div></section>
    </div>
    <div className="footnote"><Icon name="info" size={15} /> Consumption and cost figures are based on simulated readings and your saved rate. They are for demonstration only.</div>
  </>;
}

function MetricCard({ icon, accent, label, value, change, foot, detail }) {
  return <div className="metric-card"><div className="metric-top"><span className={`metric-icon ${accent}`}><Icon name={icon} size={19} /></span><span className="metric-period">LAST 30 DAYS</span></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div>{change !== undefined ? <div className={`metric-foot ${change <= 0 ? "positive" : "negative"}`}><span className="change-pill">{change <= 0 ? "↓" : "↑"} {Math.abs(change).toFixed(1)}%</span><span>{foot}</span></div> : <div className="metric-foot muted">{detail}</div>}</div>;
}

function EnergyChart({ data, range }) {
  const width = 720;
  const height = 238;
  const pad = { top: 16, right: 12, bottom: 34, left: 44 };
  const values = data.map((item) => item.value);
  const max = Math.max(10, Math.ceil(Math.max(...values, 1) / 5) * 5);
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const points = data.map((item, index) => ({
    x: pad.left + (data.length < 2 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth),
    y: pad.top + chartHeight - (item.value / max) * chartHeight,
    ...item,
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${points.at(-1)?.x || pad.left + chartWidth} ${pad.top + chartHeight} L ${points[0]?.x || pad.left} ${pad.top + chartHeight} Z`;
  const tickIndexes = data.length <= 8 ? data.map((_, index) => index) : [0, Math.floor((data.length - 1) / 4), Math.floor((data.length - 1) / 2), Math.floor(((data.length - 1) * 3) / 4), data.length - 1];
  return <div className="chart-area"><svg className="energy-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Energy consumption chart in kilowatt-hours">
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0ca77a" stopOpacity=".17" /><stop offset="100%" stopColor="#0ca77a" stopOpacity="0" /></linearGradient></defs>
    {[0, 1, 2, 3].map((line) => { const y = pad.top + (chartHeight / 3) * line; return <g key={line}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="chart-gridline" /><text x={pad.left - 10} y={y + 4} textAnchor="end" className="chart-y-label">{formatNumber(max - (max / 3) * line, 0)}</text></g>; })}
    {points.length > 0 && <><path d={area} fill="url(#chartFill)" /><path d={path} className="chart-line" />{points.map((point, index) => <circle key={`${point.date}-${index}`} cx={point.x} cy={point.y} r={range === 7 ? 3.5 : 2} className="chart-point"><title>{formatDate(point.date)}: {formatNumber(point.value)} kWh</title></circle>)}</>}
    {tickIndexes.map((index) => <text key={index} x={points[index]?.x} y={height - 8} textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"} className="chart-x-label">{points[index]?.label}</text>)}
  </svg></div>;
}

function ReadingRow({ record, meter, index }) {
  const colors = ["green", "violet", "amber", "blue", "pink"];
  return <div className="reading-row"><span className={`reading-icon ${colors[index % colors.length]}`}><Icon name="bolt" size={17} /></span><span className="reading-date"><strong>{formatDate(record.date, { day: "numeric", month: "short", year: "numeric" })}</strong><small>{meter?.name || "Unassigned meter"}</small></span><span className="reading-note">{record.note || "Daily reading"}</span><strong className="reading-amount">{formatNumber(record.kwh)} <small>kWh</small></strong></div>;
}

function ConsumptionPage({ records, meters, query, setQuery, filterRange, setFilterRange, onAdd, onEdit, onDelete, onExport }) {
  const cutoff = filterRange === "all" ? "0000-00-00" : dateOffset(new Date(), -Number(filterRange));
  const filtered = records.filter((row) => (row.date >= cutoff) && `${row.date} ${row.kwh} ${row.note || ""} ${meters.find((meter) => meter.id === row.meterId)?.name || ""}`.toLowerCase().includes(query.toLowerCase()));
  const total = filtered.reduce((sum, row) => sum + Number(row.kwh), 0);
  return <>
    <PageIntro eyebrow="YOUR METER HISTORY" title="Consumption" description="Every reading in one place. Add, review, and manage your energy records." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={18} /> Add a reading</button>} />
    <div className="list-summary"><div><span className="summary-icon green"><Icon name="bolt" size={18} /></span><div><strong>{formatNumber(total)} <small>kWh</small></strong><span>Total in selected period</span></div></div><div className="summary-rule" /><div><span className="summary-icon violet"><Icon name="calendar" size={18} /></span><div><strong>{filtered.length} <small>readings</small></strong><span>Records found</span></div></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><div className="section-title">All readings</div><div className="section-subtitle">View and manage your consumption history</div></div><div className="table-actions"><div className="table-search"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search readings" /></div><select value={filterRange} onChange={(event) => setFilterRange(event.target.value)} aria-label="Filter by date"><option value="all">All time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button className="button button-outline small-button" onClick={onExport}><Icon name="download" size={16} /> Export</button></div></div>
      <div className="table-scroll"><table><thead><tr><th>DATE</th><th>METER</th><th>CONSUMPTION</th><th>NOTE</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td><span className="table-date-icon"><Icon name="calendar" size={15} /></span>{formatDate(record.date)}</td><td><span className="meter-name"><span className="meter-table-dot" />{meters.find((meter) => meter.id === record.meterId)?.name || "Unassigned meter"}</span></td><td><strong className="table-kwh">{formatNumber(record.kwh)} <small>kWh</small></strong></td><td className="note-cell">{record.note || <span className="empty-note">—</span>}</td><td className="row-actions"><button title="Edit reading" aria-label={`Edit reading from ${record.date}`} onClick={() => onEdit(record)}><Icon name="edit" size={16} /></button><button title="Delete reading" aria-label={`Delete reading from ${record.date}`} onClick={() => onDelete(record.id)}><Icon name="trash" size={16} /></button></td></tr>)}</tbody></table></div>
      {filtered.length === 0 && <EmptyState title="No readings found" text={query ? "Try a different search or date range." : "Add a meter reading to get started."} />}
      <div className="table-footer"><span>Showing <strong>{filtered.length ? 1 : 0}–{filtered.length}</strong> of <strong>{filtered.length}</strong> readings</span><span>All values are simulated for this demo</span></div>
    </section>
  </>;
}

function InsightsPage({ stats, records, settings, onAdd }) {
  const mostRecent = records.slice(0, 7).reduce((sum, row) => sum + Number(row.kwh), 0);
  const previousWeek = records.slice(7, 14).reduce((sum, row) => sum + Number(row.kwh), 0);
  const weeklyChange = previousWeek ? ((mostRecent - previousWeek) / previousWeek) * 100 : 0;
  const average = stats.dailyAverage;
  const peak = stats.peak;
  return <>
    <PageIntro eyebrow="A LITTLE MORE CONTEXT" title="Energy insights" description="Simple observations to help you understand your household usage." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={18} /> Add a reading</button>} />
    <div className="insight-hero"><div className="insight-hero-copy"><span className="insight-hero-icon"><Icon name="sparkles" size={22} /></span><div className="eyebrow light-eyebrow">YOUR MONTH AT A GLANCE</div><h2>{stats.change <= 0 ? "You’re using less energy." : "Your energy use is on the rise."}</h2><p>{stats.change === 0 ? "Keep adding readings to see how your usage changes over time." : `Your household used ${Math.abs(stats.change).toFixed(1)}% ${stats.change <= 0 ? "less" : "more"} energy than the previous 30-day period.`}</p></div><div className="insight-hero-stat"><span>THIS MONTH</span><strong>{formatNumber(stats.total)} <small>kWh</small></strong><div><Icon name="trend" size={15} /> {Math.abs(stats.change).toFixed(1)}% vs last month</div></div><div className="insight-decoration"><span /><span /><span /><span /><span /></div></div>
    <div className="insights-cards"><section className="panel insight-card"><span className="insight-card-icon blue"><Icon name="calendar" size={18} /></span><div className="insight-card-label">WEEKLY CHECK-IN</div><h3>{weeklyChange <= 0 ? "A lighter week" : "A higher-use week"}</h3><p>You used <strong>{formatNumber(mostRecent)} kWh</strong> in your latest 7 readings{previousWeek ? `, ${Math.abs(weeklyChange).toFixed(0)}% ${weeklyChange <= 0 ? "less" : "more"} than the week before.` : "."}</p></section>
      <section className="panel insight-card"><span className="insight-card-icon amber"><Icon name="bolt" size={18} /></span><div className="insight-card-label">BUSIEST DAY</div><h3>{peak ? formatDate(peak.date, { weekday: "long", day: "numeric", month: "long" }) : "No readings yet"}</h3><p>Your highest logged day was <strong>{formatNumber(peak?.kwh || 0)} kWh</strong>. A note on your reading can help explain unusual spikes.</p></section>
      <section className="panel insight-card"><span className="insight-card-icon green"><Icon name="wallet" size={18} /></span><div className="insight-card-label">COST AT A GLANCE</div><h3>{settings.currency}{formatNumber(stats.estimatedCost, 0)}</h3><p>Estimated for this month using your saved rate of <strong>{settings.currency}{formatNumber(settings.rate, 0)}/kWh</strong>. Actual bills may differ.</p></section></div>
    <div className="insight-disclaimer"><Icon name="info" size={17} /><div><strong>About these insights</strong><p>Insights are calculated from the sample readings in your browser. The study dataset is simulated and does not represent actual consumption at the University of Ibadan Quarters.</p></div></div>
  </>;
}

function ReportsPage({ reports, stats, records, onGenerate, onExport }) {
  return <>
    <PageIntro eyebrow="YOUR ENERGY, SUMMARIZED" title="Reports" description="Create a shareable snapshot of your usage and keep a record of past reports." action={<button className="button button-primary" onClick={onGenerate}><Icon name="plus" size={18} /> Generate report</button>} />
    <div className="report-highlight"><div className="report-illustration"><div className="report-paper"><span /><span /><span /><i /><i /><i /></div><div className="report-orbit" /></div><div className="report-copy"><span className="eyebrow">READY WHEN YOU ARE</span><h2>Your energy, in a nutshell.</h2><p>Generate a CSV summary of your last 30 days, including daily readings, meter details, and estimated costs.</p><button className="button button-dark" onClick={onGenerate}><Icon name="download" size={17} /> Generate 30-day report</button></div><div className="report-preview"><span>LAST 30 DAYS</span><strong>{formatNumber(stats.total)} <small>kWh</small></strong><div>{stats.records} meter readings <i /> {formatNumber(stats.estimatedCost, 0)} estimated</div><div className="report-spark">{records.slice(0, 14).reverse().map((row, index) => <i key={row.id} style={{ height: `${Math.min(100, Number(row.kwh) * 5)}%`, opacity: .46 + (index % 4) * .12 }} />)}</div></div></div>
    <section className="panel report-history"><div className="panel-heading"><div><div className="section-title">Generated reports</div><div className="section-subtitle">Reports created in this browser</div></div><button className="button button-outline small-button" onClick={onExport}><Icon name="download" size={16} /> Export all readings</button></div>
      {reports.length ? <div className="report-list">{reports.map((report) => <div className="report-row" key={report.id}><span className="report-file-icon"><Icon name="file" size={19} /></span><div className="report-name"><strong>{report.name}</strong><small>{report.period} · Generated {new Date(report.created).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</small></div><span className="report-record-count">{report.count} readings</span><strong className="report-kwh">{formatNumber(report.kwh)} kWh</strong><span className="report-status"><i /> Ready</span><button aria-label="Download report" className="icon-button" onClick={onExport}><Icon name="download" size={17} /></button></div>)}</div> : <EmptyState title="No reports just yet" text="Generate your first report to capture a snapshot of your energy use." />}</section>
    <div className="footnote"><Icon name="info" size={15} /> Reports contain simulated consumption data. They are not utility bills.</div>
  </>;
}

function ResidencePage({ data, updateData, usageByMeter, onNotify }) {
  const [home, setHome] = useState(data.home);
  const [meterForm, setMeterForm] = useState(null);
  useEffect(() => setHome(data.home), [data.home]);
  function saveHome(event) {
    event.preventDefault();
    if (!home.name.trim() || !home.address.trim()) return onNotify("Enter both a residence name and address.");
    updateData((current) => ({ ...current, home: { name: home.name.trim(), address: home.address.trim() } }));
    onNotify("Residence details updated.");
  }
  function saveMeter(event) {
    event.preventDefault();
    if (!meterForm?.name.trim() || !meterForm?.serial.trim()) return onNotify("Enter a meter name and serial number.");
    const exists = data.meters.some((meter) => meter.id === meterForm.id);
    updateData((current) => ({ ...current, meters: exists ? current.meters.map((meter) => meter.id === meterForm.id ? { ...meterForm } : meter) : [...current.meters, { ...meterForm }] }));
    setMeterForm(null);
    onNotify(exists ? "Meter details updated." : "Meter added.");
  }
  function removeMeter(meterId) {
    if (data.meters.length <= 1) return onNotify("Keep at least one meter in your residence.");
    updateData((current) => ({ ...current, meters: current.meters.filter((meter) => meter.id !== meterId), records: current.records.map((record) => record.meterId === meterId ? { ...record, meterId: current.meters.find((meter) => meter.id !== meterId)?.id || "" } : record) }));
    onNotify("Meter removed. Its readings remain in your history.");
  }
  return <>
    <PageIntro eyebrow="YOUR HOME SETUP" title="Residence & meter" description="Manage the home and electricity meters connected to your workspace." />
    <section className="panel residence-form-panel"><div className="panel-heading"><div><div className="section-title">Residence details</div><div className="section-subtitle">Where your energy readings come from</div></div><span className="verified-chip"><Icon name="check" size={14} /> Active residence</span></div>
      <form className="residence-form" onSubmit={saveHome}><label>Residence name<input value={home.name} onChange={(event) => setHome({ ...home, name: event.target.value })} required /></label><label>Location<input value={home.address} onChange={(event) => setHome({ ...home, address: event.target.value })} required /></label><div className="residence-save"><span>Updates are saved to this browser only.</span><button className="button button-primary" type="submit">Save changes</button></div></form></section>
    <section className="panel meter-panel"><div className="panel-heading"><div><div className="section-title">Your meters <span className="count-badge">{data.meters.length}</span></div><div className="section-subtitle">Meters linked to this residence</div></div><button className="button button-outline small-button" onClick={() => setMeterForm({ id: crypto.randomUUID(), name: "", serial: "", type: "Prepaid", status: "Active" })}><Icon name="plus" size={16} /> Add meter</button></div>
      <div className="meter-cards">{data.meters.map((meter) => <div className="meter-card" key={meter.id}><div className="meter-card-top"><span className="meter-card-icon"><Icon name="meter" size={19} /></span><span className="meter-status"><i /> {meter.status}</span><button aria-label={`Edit ${meter.name}`} onClick={() => setMeterForm({ ...meter })}><Icon name="edit" size={16} /></button><button aria-label={`Remove ${meter.name}`} onClick={() => removeMeter(meter.id)}><Icon name="trash" size={16} /></button></div><div className="meter-card-title">{meter.name}</div><div className="meter-serial">S/N {meter.serial} <span>·</span> {meter.type} meter</div><div className="meter-card-bottom"><span>Recorded usage</span><strong>{formatNumber(usageByMeter(meter.id))} <small>kWh</small></strong></div></div>)}</div>
      <div className="meter-footnote"><Icon name="info" size={15} /> This demo does not connect to physical meters. Readings are entered manually.</div></section>
    {meterForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMeterForm(null); }}><form className="modal-card" onSubmit={saveMeter}><div className="modal-header"><div><span className="eyebrow">METER DETAILS</span><h2>{data.meters.some((meter) => meter.id === meterForm.id) ? "Edit meter" : "Add a meter"}</h2></div><button type="button" className="icon-button" onClick={() => setMeterForm(null)} aria-label="Close"><Icon name="close" /></button></div><div className="modal-fields"><label>Meter name<input value={meterForm.name} onChange={(event) => setMeterForm({ ...meterForm, name: event.target.value })} placeholder="e.g. Main prepaid meter" required /></label><label>Serial number<input value={meterForm.serial} onChange={(event) => setMeterForm({ ...meterForm, serial: event.target.value })} placeholder="e.g. IBQ-2048-7361" required /></label><label>Meter type<select value={meterForm.type} onChange={(event) => setMeterForm({ ...meterForm, type: event.target.value })}><option>Prepaid</option><option>Postpaid</option><option>Smart meter</option><option>Other</option></select></label></div><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setMeterForm(null)}>Cancel</button><button className="button button-primary" type="submit">Save meter</button></div></form></div>}
  </>;
}

function SettingsPage({ data, updateData, onNotify }) {
  const [rate, setRate] = useState(String(data.settings.rate));
  const [target, setTarget] = useState(String(data.settings.target));
  useEffect(() => { setRate(String(data.settings.rate)); setTarget(String(data.settings.target)); }, [data.settings]);
  function save(event) {
    event.preventDefault();
    const parsedRate = Number(rate);
    const parsedTarget = Number(target);
    if (!Number.isFinite(parsedRate) || parsedRate < 0 || !Number.isFinite(parsedTarget) || parsedTarget <= 0) return onNotify("Enter a valid rate and a monthly target greater than zero.");
    updateData((current) => ({ ...current, settings: { ...current.settings, rate: parsedRate, target: parsedTarget } }));
    onNotify("Preferences saved.");
  }
  return <>
    <PageIntro eyebrow="MAKE IT YOURS" title="Preferences" description="Set the values Wattwise uses to calculate your estimated costs and goals." />
    <section className="panel settings-panel"><div className="panel-heading"><div><div className="section-title">Energy preferences</div><div className="section-subtitle">These values are for estimates only</div></div></div><form className="settings-form" onSubmit={save}><label>Estimated electricity rate <span className="settings-unit">per kWh</span><div className="input-prefix"><span>₦</span><input type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} required /></div><small>Used to estimate your monthly consumption cost.</small></label><label>Monthly consumption target <span className="settings-unit">kWh</span><div className="input-prefix"><Icon name="bolt" size={17} /><input type="number" min="1" step="1" value={target} onChange={(event) => setTarget(event.target.value)} required /></div><small>Set a household usage goal to compare against your readings.</small></label><div className="settings-note"><Icon name="info" size={17} /><p>Currency is currently shown in Nigerian naira (₦). Your saved preferences and readings stay in this browser and are not sent to a server.</p></div><button className="button button-primary settings-save" type="submit">Save preferences</button></form></section>
    <section className="local-data-card"><span className="local-data-icon"><Icon name="meter" size={19} /></span><div><strong>Your data, on this device</strong><p>This is a frontend-only demonstration. There is no backend, meter connection, or account synchronization. Clearing browser storage resets your demo data.</p></div></section>
  </>;
}

function RecordModal({ record, meters, onClose, onSave }) {
  const [date, setDate] = useState(record?.date || new Date().toISOString().slice(0, 10));
  const [kwh, setKwh] = useState(record ? String(record.kwh) : "");
  const [meterId, setMeterId] = useState(record?.meterId || meters[0]?.id || "");
  const [note, setNote] = useState(record?.note || "");
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    const value = Number(kwh);
    if (!date) return setError("Choose the date of this reading.");
    if (date > new Date().toISOString().slice(0, 10)) return setError("A reading date cannot be in the future.");
    if (!Number.isFinite(value) || value <= 0) return setError("Enter a consumption amount greater than zero.");
    if (!meterId || !meters.some((meter) => meter.id === meterId)) return setError("Select an active meter.");
    onSave({ id: record?.id || crypto.randomUUID(), date, kwh: Number(value.toFixed(2)), meterId, note: note.trim() });
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="modal-card" onSubmit={submit}><div className="modal-header"><div><span className="eyebrow">ENERGY RECORD</span><h2>{record ? "Edit reading" : "Add a reading"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div><p className="modal-description">Enter your household’s electricity consumption for a day.</p><div className="modal-fields"><label>Reading date<input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} required /></label><label>Consumption<input type="number" min="0.01" step="0.01" value={kwh} onChange={(event) => setKwh(event.target.value)} placeholder="e.g. 8.5" required /><span className="field-suffix">kWh</span></label><label>Meter<select value={meterId} onChange={(event) => setMeterId(event.target.value)} required>{meters.map((meter) => <option key={meter.id} value={meter.id}>{meter.name}</option>)}</select></label><label>Note <span className="optional-label">Optional</span><textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Anything worth remembering about this reading?" /></label></div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Icon name="check" size={17} /> Save reading</button></div><div className="modal-local-note"><Icon name="info" size={14} /> Demo only — this reading is stored in this browser.</div></form></div>;
}

function ProfileModal({ user, onClose, onLogout }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card profile-modal"><div className="modal-header"><div><span className="eyebrow">YOUR ACCOUNT</span><h2>Resident profile</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div><div className="profile-large"><span className="profile-avatar">{(user?.name || "R").split(" ").map((word) => word[0]).slice(0, 2).join("")}</span><div><strong>{user?.name}</strong><span>{user?.email}</span></div></div><div className="profile-sim-note"><Icon name="info" size={17} /><span>This is a simulated profile. Account information is saved only in your browser.</span></div><button className="button button-outline signout-button" onClick={onLogout}><Icon name="logout" size={17} /> Sign out</button></div></div>;
}

function AuthScreen({ mode, setMode, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("Emmanuel@example.com");
  const [error, setError] = useState("");
  const register = mode === "register";
  function submit(event) {
    event.preventDefault();
    if (register && !name.trim()) return setError("Enter your name to create a demo profile.");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    onLogin({ name: register ? name.trim() : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), email });
  }
  return <main className="auth-screen"><section className="auth-aside"><div className="brand-lockup"><div className="brand-mark"><Icon name="bolt" size={23} strokeWidth={2.2} /></div><span>wattwise<span className="brand-period">.</span></span></div><div className="auth-quote"><span className="auth-kicker">A CLEARER VIEW OF HOME ENERGY</span><h1>Know where your energy goes.</h1><p>One simple place to track, understand, and make the most of your electricity use.</p><div className="auth-quote-chart"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><i /></div><div className="auth-aside-foot"><span className="auth-foot-dot" /> A simulated workspace for the University of Ibadan Quarters</div></div></section><section className="auth-main"><form className="auth-form" onSubmit={submit}><div className="auth-mobile-brand"><div className="brand-mark"><Icon name="bolt" size={21} /></div><strong>wattwise<span>.</span></strong></div><div className="eyebrow">{register ? "GET STARTED" : "WELCOME BACK"}</div><h2>{register ? "Create your profile" : "Welcome back"}</h2><p>{register ? "Set up a profile for your demo workspace." : "Sign in to your energy workspace."}</p>{register && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Emmanuel Anah" required /></label>}<label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" autoComplete={register ? "new-password" : "current-password"} defaultValue="demopassword" placeholder="Enter your password" required /></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary auth-submit" type="submit">{register ? "Create demo account" : "Sign in"} <Icon name="arrow" size={17} /></button><div className="auth-switch">{register ? "Already have a profile?" : "New to Wattwise?"} <button type="button" onClick={() => { setMode(register ? "login" : "register"); setError(""); }}>{register ? "Sign in" : "Create an account"}</button></div><div className="auth-demo-note"><Icon name="info" size={16} /><span>This demo uses local browser storage. No credentials are sent to a server. Use any email and password to continue.</span></div></form><div className="auth-copyright">© 2026 Wattwise <span>·</span> A student research demonstration</div></section></main>;
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="file" size={20} /></span><strong>{title}</strong><p>{text}</p></div>;
}

export default App;
