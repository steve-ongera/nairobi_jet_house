// AdminReportsPage.jsx
// Dependencies (add to package.json if not present):
//   recharts          — charts
//   xlsx              — Excel export
//   jspdf             — PDF export
//   jspdf-autotable   — PDF table plugin
//
// npm install recharts xlsx jspdf jspdf-autotable

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  adminOverviewApi, adminFlightApi, adminYachtApi,
  adminInquiryApi, adminUserApi, adminMarketApi,
} from '../../services/api';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Colours ──────────────────────────────────────────────────────────────────
const NAVY   = '#0b1d3a';
const GOLD   = '#C9A84C';
const TEAL   = '#0d7377';
const ROSE   = '#be3a4c';
const SLATE  = '#64748b';
const MINT   = '#10b981';
const AMBER  = '#f59e0b';
const INDIGO = '#6366f1';
const PIE_COLORS = [NAVY, GOLD, TEAL, ROSE, MINT, AMBER, INDIGO, SLATE];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = v => v == null ? '—' : `$${Number(v).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
const fmtN = v => v == null ? '—' : Number(v).toLocaleString();
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const pct  = (a, b) => b ? ((a/b)*100).toFixed(1)+'%' : '—';

const REPORT_TYPES = [
  { id:'revenue',     label:'Revenue & Commissions',   icon:'currency-dollar' },
  { id:'flights',     label:'Flight Bookings',          icon:'airplane' },
  { id:'yachts',      label:'Yacht Charters',           icon:'water' },
  { id:'inquiries',   label:'Inquiries Overview',       icon:'inbox' },
  { id:'members',     label:'Users & Memberships',      icon:'people' },
  { id:'cargo',       label:'Air Cargo',                icon:'box-seam' },
  { id:'sales',       label:'Aircraft Sales',           icon:'tag' },
];

const DATE_PRESETS = [
  { label:'Last 7 days',    days:7 },
  { label:'Last 30 days',   days:30 },
  { label:'Last 90 days',   days:90 },
  { label:'Last 6 months',  days:180 },
  { label:'Last 12 months', days:365 },
  { label:'Custom range',   days:null },
];

function subDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
function today() { return new Date().toISOString().split('T')[0]; }

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function AdminReportsPage() {
  const [reportType,   setReportType]   = useState('revenue');
  const [preset,       setPreset]       = useState(1);          // index into DATE_PRESETS
  const [dateFrom,     setDateFrom]     = useState(subDays(30));
  const [dateTo,       setDateTo]       = useState(today());
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [exporting,    setExporting]    = useState(false);
  const pageRef = useRef(null);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  // Apply preset
  const applyPreset = idx => {
    setPreset(idx);
    const p = DATE_PRESETS[idx];
    if (p.days) { setDateFrom(subDays(p.days)); setDateTo(today()); }
  };

  // Load data based on report type + date range
  const load = useCallback(async () => {
    setLoading(true); setData(null);
    try {
      const months = Math.max(1, Math.ceil((new Date(dateTo) - new Date(dateFrom)) / (1000*60*60*24*30)));
      let result = {};

      if (reportType === 'revenue') {
        const [chart, combined, dash] = await Promise.all([
          adminOverviewApi.revenueChart({ months }),
          adminOverviewApi.combinedRevenue(),
          adminOverviewApi.dashSummary(),
        ]);
        result = { chart: chart.data, combined: combined.data, dash: dash.data };
      }

      if (reportType === 'flights') {
        const [list, chart] = await Promise.all([
          adminFlightApi.list({ page_size:200 }),
          adminOverviewApi.revenueChart({ months }),
        ]);
        result = { list: list.data.results || list.data, chart: chart.data };
      }

      if (reportType === 'yachts') {
        const list = await adminYachtApi.list({ page_size:200 });
        result = { list: list.data.results || list.data };
      }

      if (reportType === 'inquiries') {
        const [summary, contacts, groups, cargo, sales, flightInq, leases] = await Promise.all([
          adminOverviewApi.summary(),
          adminInquiryApi.contacts({ page_size:100 }),
          adminInquiryApi.groups({ page_size:100 }),
          adminInquiryApi.cargo({ page_size:100 }),
          adminInquiryApi.sales({ page_size:100 }),
          adminInquiryApi.flightInq({ page_size:100 }),
          adminInquiryApi.leases({ page_size:100 }),
        ]);
        result = {
          summary: summary.data,
          contacts: contacts.data.results || contacts.data,
          groups:   groups.data.results   || groups.data,
          cargo:    cargo.data.results    || cargo.data,
          sales:    sales.data.results    || sales.data,
          flightInq:flightInq.data.results|| flightInq.data,
          leases:   leases.data.results   || leases.data,
        };
      }

      if (reportType === 'members') {
        const [users, usersSummary, memberships] = await Promise.all([
          adminUserApi.list({ page_size:200 }),
          adminOverviewApi.usersSummary(),
          adminUserApi.memberships(),
        ]);
        result = {
          users:        users.data.results || users.data,
          usersSummary: usersSummary.data,
          memberships:  memberships.data.results || memberships.data,
        };
      }

      if (reportType === 'cargo') {
        const list = await adminInquiryApi.cargo({ page_size:200 });
        result = { list: list.data.results || list.data };
      }

      if (reportType === 'sales') {
        const list = await adminInquiryApi.sales({ page_size:200 });
        result = { list: list.data.results || list.data };
      }

      setData(result);
    } catch (e) {
      showToast('Failed to load report data', 'error');
    } finally { setLoading(false); }
  }, [reportType, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  // ── Export to Excel ──────────────────────────────────────────────────────
  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const wb   = XLSX.utils.book_new();
      const sheets = buildExcelSheets(reportType, data);
      sheets.forEach(({ name, rows }) => {
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, name.substring(0,31));
      });
      XLSX.writeFile(wb, `NairobiJetHouse_${reportType}_${dateFrom}_${dateTo}.xlsx`);
      showToast('Excel report downloaded');
    } catch(e) { showToast('Excel export failed: '+e.message, 'error'); }
    finally { setExporting(false); }
  };

  // ── Export to PDF ────────────────────────────────────────────────────────
  const exportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc    = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
      const W      = doc.internal.pageSize.getWidth();
      const rptDef = REPORT_TYPES.find(r => r.id === reportType);

      // ── Cover header
      doc.setFillColor(11, 29, 58);
      doc.rect(0, 0, W, 28, 'F');
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(18); doc.setFont('helvetica','bold');
      doc.text('NairobiJetHouse', 14, 12);
      doc.setFontSize(10); doc.setFont('helvetica','normal');
      doc.setTextColor(180,180,180);
      doc.text('Private Aviation & Luxury Charter — Operations Report', 14, 20);
      doc.setTextColor(255,255,255);
      doc.text(`Report: ${rptDef?.label}   Period: ${dateFrom} to ${dateTo}`, W-14, 20, { align:'right' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, W-14, 26, { align:'right' });

      let y = 36;
      const tables = buildPDFTables(reportType, data);

      tables.forEach(({ title, head, rows }, idx) => {
        if (idx > 0) { doc.addPage(); y = 36; }
        doc.setFontSize(11); doc.setFont('helvetica','bold');
        doc.setTextColor(11, 29, 58);
        doc.text(title, 14, y); y += 6;

        autoTable(doc, {
          startY: y,
          head:   [head],
          body:   rows,
          theme:  'grid',
          styles: { fontSize:8, cellPadding:2.5, textColor:[55,65,81] },
          headStyles: { fillColor:[11,29,58], textColor:[201,168,76], fontStyle:'bold', fontSize:8.5 },
          alternateRowStyles: { fillColor:[248,249,252] },
          margin: { left:14, right:14 },
        });
        y = doc.lastAutoTable.finalY + 10;
      });

      doc.save(`NairobiJetHouse_${reportType}_${dateFrom}_${dateTo}.pdf`);
      showToast('PDF report downloaded');
    } catch(e) { showToast('PDF export failed: '+e.message, 'error'); }
    finally { setExporting(false); }
  };

  const currentReport = REPORT_TYPES.find(r => r.id === reportType);

  return (
    <AdminLayout title="Reports & Analytics" breadcrumb="Reports">
      <style>{STYLES}</style>

      {toast && (
        <div className={`rpt-toast ${toast.type==='error'?'rpt-toast-err':''}`}>
          <i className={`bi bi-${toast.type==='error'?'exclamation-circle':'check-circle'}`} />
          {toast.msg}
        </div>
      )}

      {/* ── Top controls ── */}
      <div className="rpt-top">
        <div className="rpt-top-left">
          <div className="rpt-title-eyebrow">Analytics &amp; Exports</div>
          <h2 className="rpt-title-main">Reports</h2>
        </div>
        <div className="rpt-export-btns">
          <button className="rpt-btn rpt-btn-excel" onClick={exportExcel} disabled={exporting||loading||!data}>
            <i className="bi bi-file-earmark-spreadsheet" />
            {exporting ? 'Exporting…' : 'Export Excel'}
          </button>
          <button className="rpt-btn rpt-btn-pdf" onClick={exportPDF} disabled={exporting||loading||!data}>
            <i className="bi bi-file-earmark-pdf" />
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="rpt-controls">
        {/* Report type tabs */}
        <div className="rpt-type-tabs">
          {REPORT_TYPES.map(r => (
            <button key={r.id}
              className={`rpt-type-tab ${reportType===r.id?'active':''}`}
              onClick={() => setReportType(r.id)}>
              <i className={`bi bi-${r.icon}`} /> {r.label}
            </button>
          ))}
        </div>

        {/* Date filters */}
        <div className="rpt-date-bar">
          <div className="rpt-presets">
            {DATE_PRESETS.map((p,i) => (
              <button key={i} className={`rpt-preset ${preset===i?'active':''}`}
                onClick={() => applyPreset(i)}>{p.label}</button>
            ))}
          </div>
          <div className="rpt-custom-dates">
            <label>From</label>
            <input type="date" className="rpt-date-input" value={dateFrom}
              onChange={e=>{ setDateFrom(e.target.value); setPreset(DATE_PRESETS.length-1); }} />
            <label>To</label>
            <input type="date" className="rpt-date-input" value={dateTo}
              onChange={e=>{ setDateTo(e.target.value); setPreset(DATE_PRESETS.length-1); }} />
            <button className="rpt-btn rpt-btn-apply" onClick={load} disabled={loading}>
              {loading ? <span className="rpt-spinner"/> : <i className="bi bi-arrow-clockwise"/>}
              {loading ? 'Loading…' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Report content ── */}
      <div ref={pageRef} id="rpt-content">
        {loading && <LoadingState />}
        {!loading && data && (
          <>
            {reportType === 'revenue'   && <RevenueReport   data={data} dateFrom={dateFrom} dateTo={dateTo} />}
            {reportType === 'flights'   && <FlightsReport   data={data} dateFrom={dateFrom} dateTo={dateTo} />}
            {reportType === 'yachts'    && <YachtsReport    data={data} dateFrom={dateFrom} dateTo={dateTo} />}
            {reportType === 'inquiries' && <InquiriesReport data={data} dateFrom={dateFrom} dateTo={dateTo} />}
            {reportType === 'members'   && <MembersReport   data={data} dateFrom={dateFrom} dateTo={dateTo} />}
            {reportType === 'cargo'     && <CargoReport     data={data} dateFrom={dateFrom} dateTo={dateTo} />}
            {reportType === 'sales'     && <SalesReport     data={data} dateFrom={dateFrom} dateTo={dateTo} />}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Revenue Report ────────────────────────────────────────────────────────────
function RevenueReport({ data }) {
  const chart    = data?.chart?.chart    || [];
  const totals   = data?.chart?.totals   || {};
  const combined = data?.combined        || {};
  const dash     = data?.dash            || {};

  const kpis = [
    { label:'Total Gross Revenue',  value: fmt$(combined.combined?.gross),      icon:'graph-up',         accent: NAVY },
    { label:'Platform Commission',  value: fmt$(combined.combined?.commission),  icon:'percent',          accent: GOLD },
    { label:'Net to Operators',     value: fmt$(combined.combined?.net),         icon:'wallet2',          accent: TEAL },
    { label:'Flight Bookings Rev',  value: fmt$(combined.flight_bookings?.gross),icon:'airplane',         accent: INDIGO },
    { label:'Marketplace Rev',      value: fmt$(combined.marketplace_bookings?.gross), icon:'shop',       accent: MINT },
    { label:'Active Members',       value: fmtN(dash.total_members),             icon:'people',           accent: ROSE },
  ];

  const statusData = useMemo(() => {
    const map = {};
    (data?.chart?.chart||[]).forEach(r => { map[r.month] = r; });
    return chart;
  }, [chart, data]);

  const breakdownRows = [
    { source:'Flight Bookings', gross: combined.flight_bookings?.gross, commission: combined.flight_bookings?.commission, net: (combined.flight_bookings?.gross||0)-(combined.flight_bookings?.commission||0) },
    { source:'Marketplace Bookings', gross: combined.marketplace_bookings?.gross, commission: combined.marketplace_bookings?.commission, net: (combined.marketplace_bookings?.gross||0)-(combined.marketplace_bookings?.commission||0) },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Revenue & Commission Analysis" subtitle="Gross revenue, platform earnings and operator net across all booking channels" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Monthly Revenue Trend" span={2}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chart} margin={{top:10,right:20,left:10,bottom:0}}>
              <defs>
                <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={NAVY} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={NAVY} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GOLD} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:11}} />
              <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} tick={{fontSize:11}}/>
              <Tooltip formatter={(v,n)=>[fmt$(v), n==='gross_usd'?'Gross':'Commission']}/>
              <Legend />
              <Area type="monotone" dataKey="gross_usd"      name="Gross"      stroke={NAVY} fill="url(#gGross)" strokeWidth={2}/>
              <Area type="monotone" dataKey="commission_usd" name="Commission"  stroke={GOLD} fill="url(#gComm)"  strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Channel">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={[
                { name:'Flights',     value: combined.flight_bookings?.gross      || 0 },
                { name:'Marketplace', value: combined.marketplace_bookings?.gross || 0 },
              ]} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value"
                label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {[NAVY, GOLD].map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt$(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Monthly Revenue Breakdown"
        columns={['Month','Bookings','Gross Revenue','Commission','Net Revenue','Commission %']}
        rows={chart.map(r=>[
          r.label, fmtN(r.confirmed_count), fmt$(r.gross_usd),
          fmt$(r.commission_usd), fmt$(r.net_usd),
          pct(r.commission_usd, r.gross_usd),
        ])}
        totals={['TOTAL', fmtN(totals.total_bookings), fmt$(totals.total_gross), fmt$(totals.total_commission), fmt$(totals.total_net), pct(totals.total_commission, totals.total_gross)]}
      />

      <DataTable
        title="Revenue by Booking Channel"
        columns={['Source','Gross Revenue','Commission Earned','Net to Operators']}
        rows={breakdownRows.map(r=>[r.source, fmt$(r.gross), fmt$(r.commission), fmt$(r.net)])}
      />
    </div>
  );
}

// ── Flights Report ────────────────────────────────────────────────────────────
function FlightsReport({ data }) {
  const list  = data?.list  || [];
  const chart = data?.chart?.chart || [];

  const byStatus = useMemo(()=>{
    const m={};
    list.forEach(b=>{ m[b.status]=(m[b.status]||0)+1; });
    return Object.entries(m).map(([status,count])=>({status,count}));
  },[list]);

  const byTrip = useMemo(()=>{
    const m={};
    list.forEach(b=>{ m[b.trip_type]=(m[b.trip_type]||0)+1; });
    return Object.entries(m).map(([type,count])=>({type,count}));
  },[list]);

  const totalRevenue = list.filter(b=>b.quoted_price_usd).reduce((s,b)=>s+parseFloat(b.quoted_price_usd||0),0);
  const confirmed    = list.filter(b=>b.status==='confirmed'||b.status==='completed').length;

  const kpis = [
    { label:'Total Bookings',     value:fmtN(list.length),   icon:'airplane',    accent:NAVY },
    { label:'Confirmed/Completed',value:fmtN(confirmed),     icon:'check-circle',accent:MINT },
    { label:'Total Revenue',      value:fmt$(totalRevenue),  icon:'cash-stack',  accent:GOLD },
    { label:'Avg Ticket',         value:fmt$(list.length?totalRevenue/list.length:0), icon:'calculator', accent:TEAL },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Flight Bookings Analysis" subtitle="All flight bookings, statuses, routes and revenue performance" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Bookings by Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byStatus} margin={{top:10,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="status" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="count" name="Bookings" radius={[4,4,0,0]}>
                {byStatus.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trip Type Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byTrip} cx="50%" cy="50%" outerRadius={90} dataKey="count"
                label={({type,percent})=>`${type} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {byTrip.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Confirmed Bookings" span={2}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chart} margin={{top:10,right:20,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="confirmed_count" name="Confirmed" stroke={NAVY} strokeWidth={2} dot={{r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Flight Bookings Detail"
        columns={['Reference','Guest','Route','Trip Type','Date','Passengers','Status','Quoted Price']}
        rows={list.slice(0,50).map(b=>[
          String(b.reference||'').slice(0,12)+'…',
          b.guest_name,
          `${b.origin_detail?.code||b.origin}→${b.destination_detail?.code||b.destination}`,
          b.trip_type_display||b.trip_type,
          fmtDate(b.departure_date),
          b.passenger_count,
          b.status_display||b.status,
          fmt$(b.quoted_price_usd),
        ])}
      />
    </div>
  );
}

// ── Yachts Report ─────────────────────────────────────────────────────────────
function YachtsReport({ data }) {
  const list = data?.list || [];

  const byStatus = useMemo(()=>{ const m={}; list.forEach(c=>{ m[c.status]=(m[c.status]||0)+1; }); return Object.entries(m).map(([s,c])=>({status:s,count:c})); },[list]);
  const totalRev = list.filter(c=>c.quoted_price_usd).reduce((s,c)=>s+parseFloat(c.quoted_price_usd||0),0);
  const avgGuests = list.length ? (list.reduce((s,c)=>s+(c.guest_count||0),0)/list.length).toFixed(1) : 0;

  const kpis = [
    { label:'Total Charters',  value:fmtN(list.length),  icon:'water',         accent:NAVY },
    { label:'Total Revenue',   value:fmt$(totalRev),      icon:'cash-stack',    accent:GOLD },
    { label:'Avg Group Size',  value:avgGuests,           icon:'people',        accent:TEAL },
    { label:'Avg Charter Value',value:fmt$(list.length?totalRev/list.length:0),icon:'graph-up',accent:MINT },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Yacht Charter Analysis" subtitle="Yacht charter bookings, revenue and guest statistics" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Charters by Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="status" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="count" name="Charters" radius={[4,4,0,0]}>
                {byStatus.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue per Charter">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={list.filter(c=>c.quoted_price_usd).slice(0,12).map((c,i)=>({name:`Charter ${i+1}`,value:parseFloat(c.quoted_price_usd)}))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} tick={{fontSize:10}}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:10}} width={60}/>
              <Tooltip formatter={v=>fmt$(v)}/>
              <Bar dataKey="value" fill={NAVY} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Yacht Charters Detail"
        columns={['Reference','Guest','Yacht','Departure Port','Start','End','Guests','Status','Quoted Price']}
        rows={list.slice(0,50).map(c=>[
          String(c.reference||'').slice(0,12)+'…',
          c.guest_name, c.yacht_name||'TBC',
          c.departure_port, fmtDate(c.charter_start), fmtDate(c.charter_end),
          c.guest_count, c.status_display||c.status, fmt$(c.quoted_price_usd),
        ])}
      />
    </div>
  );
}

// ── Inquiries Report ──────────────────────────────────────────────────────────
function InquiriesReport({ data }) {
  const summary = data?.summary || {};
  const pieData = [
    { name:'Flight Bookings',  value: summary.flight_bookings  || 0 },
    { name:'Yacht Charters',   value: summary.yacht_charters   || 0 },
    { name:'Lease Inquiries',  value: summary.lease_inquiries  || 0 },
    { name:'Flight Inquiries', value: summary.flight_inquiries || 0 },
    { name:'Contacts',         value: summary.contacts         || 0 },
    { name:'Group Charters',   value: summary.group_charters   || 0 },
    { name:'Air Cargo',        value: summary.air_cargo        || 0 },
    { name:'Aircraft Sales',   value: summary.aircraft_sales   || 0 },
  ].filter(d=>d.value>0);

  const pendingBar = [
    { name:'Flights',       pending: summary.pending_flight_bookings || 0 },
    { name:'Yachts',        pending: summary.pending_yacht_charters  || 0 },
    { name:'Leases',        pending: summary.pending_lease           || 0 },
    { name:'Contacts',      pending: summary.pending_contacts        || 0 },
    { name:'Group',         pending: summary.pending_group_charters  || 0 },
    { name:'Cargo',         pending: summary.pending_air_cargo       || 0 },
    { name:'Sales',         pending: summary.pending_aircraft_sales  || 0 },
  ];

  const total = pieData.reduce((s,d)=>s+d.value,0);

  const kpis = [
    { label:'Total Inquiries',    value:fmtN(total),                                       icon:'inbox',        accent:NAVY },
    { label:'Pending Action',     value:fmtN(pendingBar.reduce((s,r)=>s+r.pending,0)),     icon:'hourglass',    accent:ROSE },
    { label:'Flight Bookings',    value:fmtN(summary.flight_bookings),                     icon:'airplane',     accent:INDIGO },
    { label:'Group Charters',     value:fmtN(summary.group_charters),                      icon:'people-fill',  accent:TEAL },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Inquiries Overview" subtitle="All inquiry types, volumes and pending action items" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Inquiries by Type">
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={95} innerRadius={45} dataKey="value"
                label={({name,percent})=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip/>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pending Inquiries by Type">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={pendingBar} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:11}} width={60}/>
              <Tooltip/>
              <Bar dataKey="pending" name="Pending" fill={ROSE} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Inquiry Volume Summary"
        columns={['Inquiry Type','Total Volume','Pending','% Pending']}
        rows={[
          ['Flight Bookings',  fmtN(summary.flight_bookings),  fmtN(summary.pending_flight_bookings), pct(summary.pending_flight_bookings, summary.flight_bookings)],
          ['Yacht Charters',   fmtN(summary.yacht_charters),   fmtN(summary.pending_yacht_charters),  pct(summary.pending_yacht_charters, summary.yacht_charters)],
          ['Lease Inquiries',  fmtN(summary.lease_inquiries),  fmtN(summary.pending_lease),           pct(summary.pending_lease, summary.lease_inquiries)],
          ['Flight Inquiries', fmtN(summary.flight_inquiries), '—', '—'],
          ['Contacts',         fmtN(summary.contacts),         fmtN(summary.pending_contacts),        pct(summary.pending_contacts, summary.contacts)],
          ['Group Charters',   fmtN(summary.group_charters),   fmtN(summary.pending_group_charters),  pct(summary.pending_group_charters, summary.group_charters)],
          ['Air Cargo',        fmtN(summary.air_cargo),        fmtN(summary.pending_air_cargo),       pct(summary.pending_air_cargo, summary.air_cargo)],
          ['Aircraft Sales',   fmtN(summary.aircraft_sales),   fmtN(summary.pending_aircraft_sales),  pct(summary.pending_aircraft_sales, summary.aircraft_sales)],
        ]}
      />

      <DataTable
        title="Recent Contact Inquiries"
        columns={['Name','Email','Subject','Date']}
        rows={(data?.contacts||[]).slice(0,20).map(c=>[c.full_name, c.email, c.subject_display||c.subject, fmtDate(c.created_at)])}
      />

      <DataTable
        title="Recent Group Charter Inquiries"
        columns={['Contact','Group Type','Size','From','To','Status','Date']}
        rows={(data?.groups||[]).slice(0,20).map(g=>[g.contact_name, g.group_type_display||g.group_type, g.group_size, g.origin_description, g.destination_description, g.status, fmtDate(g.created_at)])}
      />
    </div>
  );
}

// ── Members Report ────────────────────────────────────────────────────────────
function MembersReport({ data }) {
  const users       = data?.users        || [];
  const summary     = data?.usersSummary || {};
  const memberships = data?.memberships  || [];

  const byRole = [
    { role:'Clients', count:summary.clients||0 },
    { role:'Owners',  count:summary.owners||0 },
  ];

  const membersByTier = useMemo(()=>{
    const m={};
    memberships.forEach(mb=>{ const t=mb.tier_name||'Unknown'; m[t]=(m[t]||0)+1; });
    return Object.entries(m).map(([tier,count])=>({tier,count}));
  },[memberships]);

  const byMemberStatus = useMemo(()=>{
    const m={};
    memberships.forEach(mb=>{ m[mb.status]=(m[mb.status]||0)+1; });
    return Object.entries(m).map(([status,count])=>({status,count}));
  },[memberships]);

  const kpis = [
    { label:'Total Users',      value:fmtN(summary.total_users),    icon:'people',        accent:NAVY },
    { label:'Active Members',   value:fmtN(summary.active_members), icon:'star',          accent:GOLD },
    { label:'Fleet Owners',     value:fmtN(summary.owners),         icon:'airplane',      accent:TEAL },
    { label:'Expired Members',  value:fmtN(summary.expired),        icon:'x-circle',      accent:ROSE },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Users & Memberships" subtitle="Platform users, membership tiers and account status analysis" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Users by Role">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="role" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="count" name="Users" radius={[6,6,0,0]}>
                <Cell fill={NAVY}/><Cell fill={GOLD}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Members by Tier">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={membersByTier} cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                dataKey="count" label={({tier,percent})=>`${tier} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {membersByTier.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Membership Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byMemberStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis dataKey="status" type="category" tick={{fontSize:11}} width={80}/>
              <Tooltip/>
              <Bar dataKey="count" name="Count" radius={[0,4,4,0]}>
                {byMemberStatus.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="User Accounts"
        columns={['ID','Name','Email','Role','Company','Membership','Status','Joined']}
        rows={users.slice(0,50).map(u=>[
          u.id, u.full_name||u.username, u.email, u.role,
          u.company||'—', u.membership_tier||'None',
          u.is_active?'Active':'Inactive', fmtDate(u.created_at),
        ])}
      />

      <DataTable
        title="Active Memberships"
        columns={['User','Email','Tier','Billing','Start','End','Status']}
        rows={memberships.slice(0,50).map(m=>[
          m.user_name||'—', m.user_email||'—', m.tier_name||'—',
          m.billing_cycle, fmtDate(m.start_date), fmtDate(m.end_date),
          m.status,
        ])}
      />
    </div>
  );
}

// ── Cargo Report ──────────────────────────────────────────────────────────────
function CargoReport({ data }) {
  const list = data?.list || [];
  const byType = useMemo(()=>{ const m={}; list.forEach(c=>{ m[c.cargo_type]=(m[c.cargo_type]||0)+1; }); return Object.entries(m).map(([type,count])=>({type,count})); },[list]);
  const byUrgency = useMemo(()=>{ const m={}; list.forEach(c=>{ m[c.urgency]=(m[c.urgency]||0)+1; }); return Object.entries(m).map(([urgency,count])=>({urgency,count})); },[list]);
  const totalKg = list.reduce((s,c)=>s+(parseFloat(c.weight_kg)||0),0);

  const kpis = [
    { label:'Total Inquiries', value:fmtN(list.length),  icon:'box-seam',    accent:NAVY },
    { label:'Total Weight (kg)',value:fmtN(totalKg.toFixed(0)), icon:'truck',accent:GOLD },
    { label:'Critical / AOG',  value:fmtN(list.filter(c=>c.urgency==='critical').length), icon:'exclamation-triangle', accent:ROSE },
    { label:'Hazardous',       value:fmtN(list.filter(c=>c.is_hazardous).length), icon:'radioactive', accent:AMBER },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Air Cargo Inquiries" subtitle="Cargo type, urgency, weight and route analysis" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Cargo by Type">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis dataKey="type" type="category" tick={{fontSize:10}} width={90}/>
              <Tooltip/>
              <Bar dataKey="count" fill={NAVY} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Urgency Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byUrgency} cx="50%" cy="50%" outerRadius={90} dataKey="count"
                label={({urgency,percent})=>`${urgency} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {byUrgency.map((_,i)=><Cell key={i} fill={[MINT,AMBER,ROSE][i]||SLATE}/>)}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Air Cargo Inquiries Detail"
        columns={['Contact','Company','Type','Origin','Destination','Weight (kg)','Urgency','Status','Date']}
        rows={list.slice(0,50).map(c=>[
          c.contact_name, c.company||'—',
          c.cargo_type_display||c.cargo_type,
          c.origin_description, c.destination_description,
          c.weight_kg||'—', c.urgency_display||c.urgency,
          c.status, fmtDate(c.created_at),
        ])}
      />
    </div>
  );
}

// ── Sales Report ──────────────────────────────────────────────────────────────
function SalesReport({ data }) {
  const list = data?.list || [];
  const byType = useMemo(()=>{ const m={}; list.forEach(s=>{ m[s.inquiry_type]=(m[s.inquiry_type]||0)+1; }); return Object.entries(m).map(([type,count])=>({type,count})); },[list]);
  const byBudget = useMemo(()=>{ const m={}; list.forEach(s=>{ if(s.budget_range){m[s.budget_range]=(m[s.budget_range]||0)+1;} }); return Object.entries(m).map(([range,count])=>({range,count})); },[list]);

  const kpis = [
    { label:'Total Inquiries', value:fmtN(list.length),                                     icon:'tag',     accent:NAVY },
    { label:'Buyers',          value:fmtN(list.filter(s=>s.inquiry_type==='buy').length),    icon:'bag',     accent:MINT },
    { label:'Sellers',         value:fmtN(list.filter(s=>s.inquiry_type==='sell').length),   icon:'cash',    accent:GOLD },
    { label:'Pending',         value:fmtN(list.filter(s=>s.status==='pending').length),      icon:'clock',   accent:ROSE },
  ];

  return (
    <div className="rpt-section">
      <SectionHeader title="Aircraft Sales Inquiries" subtitle="Buy, sell and trade inquiry analysis" />
      <KPIGrid kpis={kpis} />

      <div className="rpt-charts-row">
        <ChartCard title="Inquiry Type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byType} cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                dataKey="count" label={({type,percent})=>`${type} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {byType.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Buyer Budget Ranges">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byBudget} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis dataKey="range" type="category" tick={{fontSize:10}} width={90}/>
              <Tooltip/>
              <Bar dataKey="count" fill={GOLD} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DataTable
        title="Aircraft Sales Inquiries Detail"
        columns={['Contact','Company','Type','Make/Model','Year','Hours','Budget / Asking','Status','Date']}
        rows={list.slice(0,50).map(s=>[
          s.contact_name, s.company||'—',
          s.inquiry_type_display||s.inquiry_type,
          `${s.aircraft_make||s.preferred_make_model||'—'} ${s.aircraft_model||''}`.trim(),
          s.year_of_manufacture||'—',
          s.total_flight_hours||'—',
          s.asking_price_usd ? fmt$(s.asking_price_usd) : (s.budget_range_display||s.budget_range||'—'),
          s.status, fmtDate(s.created_at),
        ])}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader({ title, subtitle }) {
  return (
    <div className="rpt-section-hdr">
      <div className="rpt-section-hdr-line" />
      <div>
        <h3 className="rpt-section-title">{title}</h3>
        <p className="rpt-section-sub">{subtitle}</p>
      </div>
    </div>
  );
}

function KPIGrid({ kpis }) {
  return (
    <div className="rpt-kpi-grid">
      {kpis.map((k,i) => (
        <div key={i} className="rpt-kpi" style={{ '--accent': k.accent }}>
          <div className="rpt-kpi-icon"><i className={`bi bi-${k.icon}`} /></div>
          <div className="rpt-kpi-val">{k.value}</div>
          <div className="rpt-kpi-label">{k.label}</div>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children, span }) {
  return (
    <div className="rpt-chart-card" style={span===2?{gridColumn:'span 2'}:{}}>
      <div className="rpt-chart-title">{title}</div>
      {children}
    </div>
  );
}

function DataTable({ title, columns, rows, totals }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="rpt-table-card">
      <div className="rpt-table-hdr" onClick={()=>setExpanded(p=>!p)}>
        <div className="rpt-table-title"><i className="bi bi-table" /> {title}</div>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <span className="rpt-row-count">{rows.length} rows</span>
          <i className={`bi bi-chevron-${expanded?'up':'down'}`} style={{color:'var(--gray-400)',fontSize:'0.85rem'}}/>
        </div>
      </div>
      {expanded && (
        <div className="rpt-table-scroll">
          <table className="rpt-table">
            <thead>
              <tr>{columns.map((c,i)=><th key={i}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={columns.length} className="rpt-empty">No data for this period</td></tr>
                : rows.map((r,i)=>(
                    <tr key={i}>
                      {r.map((cell,j)=><td key={j}>{cell??'—'}</td>)}
                    </tr>
                  ))
              }
            </tbody>
            {totals && (
              <tfoot>
                <tr className="rpt-totals-row">
                  {totals.map((c,i)=><td key={i}><strong>{c}</strong></td>)}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rpt-loading">
      <div className="rpt-loading-inner">
        <div className="rpt-loading-icon"><i className="bi bi-bar-chart-line" /></div>
        <div className="rpt-loading-text">Compiling report data…</div>
        <div className="rpt-loading-bar"><div className="rpt-loading-fill"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DATA BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════
function buildExcelSheets(reportType, data) {
  if (!data) return [];
  if (reportType === 'revenue') {
    const chart = data?.chart?.chart || [];
    return [
      { name:'Monthly Revenue', rows: chart.map(r=>({ Month:r.label, Bookings:r.confirmed_count, Gross_USD:r.gross_usd, Commission_USD:r.commission_usd, Net_USD:r.net_usd })) },
      { name:'Channel Breakdown', rows: [
        { Source:'Flight Bookings', Gross: data?.combined?.flight_bookings?.gross, Commission: data?.combined?.flight_bookings?.commission },
        { Source:'Marketplace',     Gross: data?.combined?.marketplace_bookings?.gross, Commission: data?.combined?.marketplace_bookings?.commission },
      ]},
    ];
  }
  if (reportType === 'flights') {
    const list = data?.list || [];
    return [{ name:'Flight Bookings', rows: list.map(b=>({
      Reference: b.reference, Guest: b.guest_name, Email: b.guest_email,
      Origin: b.origin_detail?.code||b.origin, Destination: b.destination_detail?.code||b.destination,
      Trip_Type: b.trip_type, Departure_Date: b.departure_date, Passengers: b.passenger_count,
      Status: b.status, Quoted_Price_USD: b.quoted_price_usd, Commission_USD: b.commission_usd, Net_USD: b.net_revenue_usd,
    }))}];
  }
  if (reportType === 'yachts') {
    return [{ name:'Yacht Charters', rows: (data?.list||[]).map(c=>({
      Reference:c.reference, Guest:c.guest_name, Email:c.guest_email,
      Yacht:c.yacht_name, Departure_Port:c.departure_port, Start:c.charter_start, End:c.charter_end,
      Guests:c.guest_count, Status:c.status, Price_USD:c.quoted_price_usd,
    }))}];
  }
  if (reportType === 'inquiries') {
    const s = data?.summary || {};
    return [
      { name:'Summary', rows:[
        {Type:'Flight Bookings',Total:s.flight_bookings,Pending:s.pending_flight_bookings},
        {Type:'Yacht Charters',Total:s.yacht_charters,Pending:s.pending_yacht_charters},
        {Type:'Lease Inquiries',Total:s.lease_inquiries,Pending:s.pending_lease},
        {Type:'Group Charters',Total:s.group_charters,Pending:s.pending_group_charters},
        {Type:'Air Cargo',Total:s.air_cargo,Pending:s.pending_air_cargo},
        {Type:'Aircraft Sales',Total:s.aircraft_sales,Pending:s.pending_aircraft_sales},
        {Type:'Contacts',Total:s.contacts,Pending:s.pending_contacts},
      ]},
      { name:'Contacts',      rows:(data?.contacts||[]).map(c=>({Name:c.full_name,Email:c.email,Subject:c.subject,Date:c.created_at}))},
      { name:'Group Charters',rows:(data?.groups||[]).map(g=>({Contact:g.contact_name,Type:g.group_type,Size:g.group_size,From:g.origin_description,To:g.destination_description,Status:g.status,Date:g.created_at}))},
    ];
  }
  if (reportType === 'members') {
    return [
      { name:'Users', rows:(data?.users||[]).map(u=>({ID:u.id,Name:u.full_name||u.username,Email:u.email,Role:u.role,Company:u.company,Membership:u.membership_tier,Status:u.is_active?'Active':'Inactive',Joined:u.created_at}))},
      { name:'Memberships', rows:(data?.memberships||[]).map(m=>({User:m.user_name,Email:m.user_email,Tier:m.tier_name,Billing:m.billing_cycle,Start:m.start_date,End:m.end_date,Status:m.status}))},
    ];
  }
  if (reportType === 'cargo') {
    return [{ name:'Air Cargo', rows:(data?.list||[]).map(c=>({Contact:c.contact_name,Company:c.company,Type:c.cargo_type,Origin:c.origin_description,Destination:c.destination_description,Weight_kg:c.weight_kg,Urgency:c.urgency,Hazardous:c.is_hazardous?'Yes':'No',Status:c.status,Date:c.created_at}))}];
  }
  if (reportType === 'sales') {
    return [{ name:'Aircraft Sales', rows:(data?.list||[]).map(s=>({Contact:s.contact_name,Company:s.company,Type:s.inquiry_type,Make:s.aircraft_make,Model:s.aircraft_model,Year:s.year_of_manufacture,Hours:s.total_flight_hours,Asking_Price:s.asking_price_usd,Budget:s.budget_range,Status:s.status,Date:s.created_at}))}];
  }
  return [];
}

function buildPDFTables(reportType, data) {
  if (!data) return [];
  if (reportType === 'revenue') {
    const chart = data?.chart?.chart || [];
    return [{
      title:'Monthly Revenue Breakdown',
      head:['Month','Bookings','Gross','Commission','Net'],
      rows:chart.map(r=>[r.label, r.confirmed_count, fmt$(r.gross_usd), fmt$(r.commission_usd), fmt$(r.net_usd)]),
    }];
  }
  if (reportType === 'flights') {
    return [{
      title:'Flight Bookings',
      head:['Reference','Guest','Route','Date','Passengers','Status','Quoted Price'],
      rows:(data?.list||[]).slice(0,100).map(b=>[
        String(b.reference||'').slice(0,12), b.guest_name,
        `${b.origin_detail?.code||b.origin}→${b.destination_detail?.code||b.destination}`,
        b.departure_date, b.passenger_count, b.status, fmt$(b.quoted_price_usd),
      ]),
    }];
  }
  if (reportType === 'yachts') {
    return [{
      title:'Yacht Charters',
      head:['Reference','Guest','Yacht','Port','Start','End','Guests','Status','Price'],
      rows:(data?.list||[]).slice(0,100).map(c=>[
        String(c.reference||'').slice(0,12), c.guest_name, c.yacht_name||'TBC',
        c.departure_port, c.charter_start, c.charter_end, c.guest_count, c.status, fmt$(c.quoted_price_usd),
      ]),
    }];
  }
  if (reportType === 'inquiries') {
    const s = data?.summary || {};
    return [{
      title:'Inquiry Volume Summary',
      head:['Type','Total','Pending'],
      rows:[
        ['Flight Bookings',s.flight_bookings,s.pending_flight_bookings],
        ['Yacht Charters',s.yacht_charters,s.pending_yacht_charters],
        ['Group Charters',s.group_charters,s.pending_group_charters],
        ['Air Cargo',s.air_cargo,s.pending_air_cargo],
        ['Aircraft Sales',s.aircraft_sales,s.pending_aircraft_sales],
        ['Contacts',s.contacts,s.pending_contacts],
      ],
    }];
  }
  if (reportType === 'members') {
    return [{
      title:'User Accounts',
      head:['ID','Name','Email','Role','Membership','Status','Joined'],
      rows:(data?.users||[]).slice(0,100).map(u=>[u.id,u.full_name||u.username,u.email,u.role,u.membership_tier||'None',u.is_active?'Active':'Inactive',fmtDate(u.created_at)]),
    }];
  }
  if (reportType === 'cargo') {
    return [{
      title:'Air Cargo Inquiries',
      head:['Contact','Type','Origin','Destination','Weight kg','Urgency','Status'],
      rows:(data?.list||[]).slice(0,100).map(c=>[c.contact_name,c.cargo_type,c.origin_description,c.destination_description,c.weight_kg||'—',c.urgency,c.status]),
    }];
  }
  if (reportType === 'sales') {
    return [{
      title:'Aircraft Sales Inquiries',
      head:['Contact','Type','Make','Model','Year','Budget/Asking','Status'],
      rows:(data?.list||[]).slice(0,100).map(s=>[s.contact_name,s.inquiry_type,s.aircraft_make||'—',s.aircraft_model||'—',s.year_of_manufacture||'—',s.asking_price_usd?fmt$(s.asking_price_usd):(s.budget_range||'—'),s.status]),
    }];
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Layout ── */
  .rpt-top { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
  .rpt-title-eyebrow { font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--gold,#C9A84C); margin-bottom:0.3rem; }
  .rpt-title-main { font-family:'Playfair Display',serif; font-size:1.8rem; color:#0b1d3a; margin:0; }

  /* ── Export buttons ── */
  .rpt-export-btns { display:flex; gap:0.75rem; }
  .rpt-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.6rem 1.1rem; border-radius:8px; font-size:0.85rem; font-weight:600; font-family:'DM Sans',sans-serif; border:none; cursor:pointer; transition:all .2s; }
  .rpt-btn:disabled { opacity:0.55; cursor:not-allowed; }
  .rpt-btn-excel { background:#1d6f42; color:white; }
  .rpt-btn-excel:hover:not(:disabled) { background:#165a35; }
  .rpt-btn-pdf   { background:#be3a4c; color:white; }
  .rpt-btn-pdf:hover:not(:disabled)   { background:#a3303f; }
  .rpt-btn-apply { background:#0b1d3a; color:white; }
  .rpt-btn-apply:hover:not(:disabled) { background:#1e3a6e; }

  /* ── Controls ── */
  .rpt-controls { background:white; border-radius:12px; box-shadow:0 1px 8px rgba(0,0,0,.07); margin-bottom:1.5rem; overflow:hidden; }
  .rpt-type-tabs { display:flex; gap:0; border-bottom:1px solid #f0f0f0; overflow-x:auto; scrollbar-width:none; }
  .rpt-type-tabs::-webkit-scrollbar { display:none; }
  .rpt-type-tab { display:inline-flex; align-items:center; gap:0.45rem; padding:0.85rem 1.1rem; font-size:0.82rem; font-weight:500; font-family:'DM Sans',sans-serif; color:#64748b; background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .18s; }
  .rpt-type-tab:hover { color:#0b1d3a; background:#f8f9fc; }
  .rpt-type-tab.active { color:#0b1d3a; border-bottom-color:#C9A84C; font-weight:600; }

  .rpt-date-bar { display:flex; align-items:center; gap:1rem; padding:0.85rem 1.25rem; flex-wrap:wrap; }
  .rpt-presets { display:flex; gap:0.35rem; flex-wrap:wrap; }
  .rpt-preset { padding:0.35rem 0.85rem; border-radius:20px; font-size:0.78rem; font-weight:500; border:1.5px solid #e5e7eb; background:none; cursor:pointer; color:#64748b; transition:all .15s; white-space:nowrap; }
  .rpt-preset:hover { border-color:#0b1d3a; color:#0b1d3a; }
  .rpt-preset.active { background:#0b1d3a; color:#C9A84C; border-color:#0b1d3a; }
  .rpt-custom-dates { display:flex; align-items:center; gap:0.6rem; margin-left:auto; flex-wrap:wrap; }
  .rpt-custom-dates label { font-size:0.78rem; font-weight:600; color:#64748b; white-space:nowrap; }
  .rpt-date-input { padding:0.4rem 0.75rem; border:1.5px solid #e5e7eb; border-radius:7px; font-size:0.82rem; color:#374151; outline:none; font-family:'DM Sans',sans-serif; }
  .rpt-date-input:focus { border-color:#0b1d3a; }

  /* ── Section ── */
  .rpt-section { display:flex; flex-direction:column; gap:1.5rem; }
  .rpt-section-hdr { display:flex; align-items:center; gap:1rem; }
  .rpt-section-hdr-line { width:4px; height:48px; background:linear-gradient(180deg,#C9A84C,#0b1d3a); border-radius:4px; flex-shrink:0; }
  .rpt-section-title { font-family:'Playfair Display',serif; font-size:1.25rem; color:#0b1d3a; margin:0; }
  .rpt-section-sub { font-size:0.82rem; color:#64748b; margin:0.2rem 0 0; }

  /* ── KPIs ── */
  .rpt-kpi-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:1rem; }
  .rpt-kpi { background:white; border-radius:8px; padding:1.25rem 1.35rem; box-shadow:0 1px 8px rgba(0,0,0,.06); border-left:4px ; position:relative; overflow:hidden; }
  .rpt-kpi::after { content:''; position:absolute; top:-16px; right:-16px; width:64px; height:64px; border-radius:50%; background:var(--accent,.07); opacity:0.07; }
  .rpt-kpi-icon { font-size:1.15rem; color:var(--accent,#0b1d3a); margin-bottom:0.5rem; opacity:0.7; }
  .rpt-kpi-val { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#0b1d3a; line-height:1.1; }
  .rpt-kpi-label { font-size:0.73rem; color:#94a3b8; margin-top:0.25rem; font-weight:500; text-transform:uppercase; letter-spacing:0.04em; }

  /* ── Charts ── */
  .rpt-charts-row { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
  @media(max-width:900px) { .rpt-charts-row { grid-template-columns:1fr; } }
  .rpt-chart-card { background:white; border-radius:12px; padding:1.25rem 1.5rem; box-shadow:0 1px 8px rgba(0,0,0,.06); }
  .rpt-chart-card[style*="span 2"] { grid-column:span 2; }
  @media(max-width:900px) { .rpt-chart-card[style*="span 2"] { grid-column:span 1; } }
  .rpt-chart-title { font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #f4f4f6; }

  /* ── Data tables ── */
  .rpt-table-card { background:white; border-radius:12px; box-shadow:0 1px 8px rgba(0,0,0,.06); overflow:hidden; }
  .rpt-table-hdr { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.35rem; cursor:pointer; border-bottom:1px solid #f4f4f6; transition:background .15s; }
  .rpt-table-hdr:hover { background:#fafafa; }
  .rpt-table-title { font-family:'DM Sans',sans-serif; font-size:0.87rem; font-weight:600; color:#374151; display:flex; align-items:center; gap:0.5rem; }
  .rpt-table-title .bi-table { color:#C9A84C; }
  .rpt-row-count { font-size:0.75rem; background:#f1f5f9; color:#64748b; padding:0.25rem 0.65rem; border-radius:20px; font-weight:500; }
  .rpt-table-scroll { overflow-x:auto; max-height:420px; overflow-y:auto; }
  .rpt-table { width:100%; border-collapse:collapse; font-family:'DM Sans',sans-serif; font-size:0.82rem; }
  .rpt-table thead { position:sticky; top:0; z-index:2; }
  .rpt-table th { background:#0b1d3a; color:#C9A84C; font-weight:600; padding:0.7rem 1rem; text-align:left; white-space:nowrap; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; }
  .rpt-table td { padding:0.65rem 1rem; color:#374151; border-bottom:1px solid #f4f4f6; white-space:nowrap; }
  .rpt-table tbody tr:hover { background:#f8f9ff; }
  .rpt-table tfoot .rpt-totals-row td { background:#f1f5f9; font-size:0.82rem; border-top:2px solid #e2e8f0; padding:0.75rem 1rem; }
  .rpt-empty { text-align:center; color:#94a3b8; padding:2rem; font-style:italic; }

  /* ── Loading ── */
  .rpt-loading { display:flex; align-items:center; justify-content:center; min-height:320px; }
  .rpt-loading-inner { text-align:center; }
  .rpt-loading-icon { font-size:2.5rem; color:#C9A84C; margin-bottom:1rem; animation:rpt-pulse 1.5s ease-in-out infinite; }
  .rpt-loading-text { font-family:'DM Sans',sans-serif; font-size:0.9rem; color:#64748b; margin-bottom:1.25rem; }
  .rpt-loading-bar { width:220px; height:3px; background:#f0f0f0; border-radius:3px; overflow:hidden; }
  .rpt-loading-fill { height:100%; background:linear-gradient(90deg,#0b1d3a,#C9A84C); border-radius:3px; animation:rpt-load 1.4s ease-in-out infinite; }
  @keyframes rpt-load { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
  @keyframes rpt-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.95)} }

  /* ── Toast ── */
  .rpt-toast { position:fixed; top:1.25rem; right:1.25rem; z-index:3000; background:#0b1d3a; color:white; padding:0.8rem 1.25rem; border-radius:10px; font-size:0.85rem; font-family:'DM Sans',sans-serif; box-shadow:0 8px 30px rgba(0,0,0,.2); display:flex; align-items:center; gap:0.6rem; animation:rpt-fadein .3s ease; }
  .rpt-toast .bi { color:#C9A84C; font-size:1rem; }
  .rpt-toast-err { background:#be3a4c; }
  .rpt-toast-err .bi { color:white; }
  @keyframes rpt-fadein { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

  .rpt-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

export default AdminReportsPage;