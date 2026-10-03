import React, { useState } from 'react';
import { useData } from './Store';
import { Doughnut, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Search, Wallet, Receipt, Landmark, AlertOctagon, Upload, Link as LinkIcon, Trash2, Printer, X } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export function Dashboard() {
  const { students, expenses, requiredDues, gSheetUrl, loadSampleData, resetData, handleFileUpload, updateGSheetUrl } = useData();
  const hasData = students.length > 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [sheetInput, setSheetInput] = useState(gSheetUrl || '');

  const totalCollections = students.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netBalance = totalCollections - totalExpenses;

  const paidCount = students.filter(s => s.status === 'PAID').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const discrepancyCount = students.filter(s => s.status === 'DISCREPANCY').length;
  const unpaidCount = students.filter(s => s.status === 'UNPAID').length;

  const complianceRate = students.length > 0 ? Math.round((paidCount / students.length) * 100) : 0;

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchQuery = (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       (student.id && student.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       (student.ref && student.ref.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filter === 'ALL' || student.status === filter;
    return matchQuery && matchStatus;
  });

  const complianceData = {
    labels: ['Fully Cleared', 'Pending Audit', 'Discrepancy', 'Unpaid'],
    datasets: [{
      data: hasData ? [paidCount, pendingCount, discrepancyCount, unpaidCount] : [0, 0, 0, 1],
      backgroundColor: ['#00C0F3', '#F4B41A', '#EF4444', '#334155'],
      borderWidth: 2,
      borderColor: '#010E21',
    }]
  };

  const dateMap = {};
  if (hasData) {
    students.forEach(s => {
      if (s.date && s.date !== '—') {
        dateMap[s.date] = (dateMap[s.date] || 0) + (Number(s.amount) || 0);
      }
    });
  }
  const sortedDates = Object.keys(dateMap).sort();

  const timelineData = {
    labels: sortedDates.map(d => d.slice(5)),
    datasets: [{
      label: 'Daily Collections (₱)',
      data: sortedDates.map(d => dateMap[d]),
      borderColor: '#00C0F3',
      backgroundColor: 'rgba(0, 192, 243, 0.1)',
      fill: true,
      tension: 0.35,
    }]
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Transparency Portal</h2>
          <p className="text-sm font-mono text-prmsu-cyan">ICpEP PRMSU Dashboard</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono">
           <button onClick={() => setShowScannerModal(true)} className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-prmsu-cyan hover:bg-sky-400 text-slate-950 rounded-lg font-bold transition-colors">
              <Upload size={16} />
              <span>Ingest / Sync</span>
           </button>
           <button onClick={resetData} className="flex items-center gap-2 text-rose-400 hover:text-rose-300">
             <Trash2 size={16} /> Reset
           </button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-prmsu-card border border-prmsu-cyan/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowScannerModal(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-[#010e21] text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-prmsu-cyan/10 text-prmsu-cyan flex items-center justify-center border border-prmsu-cyan/30">
                <Upload size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Automated Document Ingestion & Sync</h3>
                <p className="text-xs text-prmsu-cyan font-mono">Excel (.xlsx) • Word (.docx) • Google Sheets Live Sync</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-slate-700 p-6 rounded-2xl bg-slate-800/30">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Upload size={16}/> File Upload</h4>
                <p className="text-xs text-slate-400 mb-4">Upload your local Excel or Word documents to sync records.</p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-prmsu-cyan hover:bg-sky-400 text-slate-950 rounded-lg font-bold transition-colors">
                  <Upload size={16} />
                  <span>Choose File (.xlsx, .csv, .docx)</span>
                  <input type="file" accept=".xlsx,.csv,.docx" className="hidden" onChange={(e) => {
                    handleFileChange(e);
                    setShowScannerModal(false);
                  }} />
                </label>
              </div>

              <div className="border border-slate-700 p-6 rounded-2xl bg-slate-800/30">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2"><LinkIcon size={16}/> Google Sheets Sync</h4>
                <p className="text-xs text-slate-400 mb-4">Link a published Google Sheet to auto-sync every 60 seconds.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 bg-[#010e21] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-prmsu-cyan"
                  />
                  <button
                    onClick={() => {
                      updateGSheetUrl(sheetInput);
                      setShowScannerModal(false);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    Sync
                  </button>
                </div>
                {gSheetUrl && (
                  <p className="text-xs text-emerald-400 mt-2">Currently syncing: {gSheetUrl.substring(0, 40)}...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasData && (
        <div className="rounded-3xl bg-prmsu-card/80 border-2 border-dashed border-prmsu-cyan/40 p-12 text-center backdrop-blur-md">
          <h3 className="text-3xl font-extrabold text-white font-heading mb-4">No Ingested Records</h3>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Upload your class spreadsheet to automatically generate visual infographics, dues compliance, and search matrices.
          </p>
          <button onClick={loadSampleData} className="px-6 py-3 rounded-xl font-mono text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all">
            Load Sample Data
          </button>
        </div>
      )}

      {hasData && (
        <>
          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gross Collections', val: `₱${totalCollections.toFixed(2)}`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Official Disbursements', val: `₱${totalExpenses.toFixed(2)}`, icon: Receipt, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              { label: 'Net Treasury Vault', val: `₱${netBalance.toFixed(2)}`, icon: Landmark, color: 'text-prmsu-cyan', bg: 'bg-prmsu-cyan/10' },
              { label: 'Flagged Discrepancies', val: discrepancyCount, icon: AlertOctagon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((kpi, i) => (
              <div key={i} className="p-5 rounded-2xl bg-prmsu-card/90 border border-prmsu-royal/60 shadow-xl">
                <div className="flex justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-3">
                  <span>{kpi.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon size={16} />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${kpi.color}`}>{kpi.val}</div>
              </div>
            ))}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-prmsu-card/80 border border-prmsu-royal/50 p-6 shadow-xl h-80 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="font-bold text-white font-heading">Class Dues Clearance</h3>
                    <p className="text-xs text-slate-400 font-mono">Cohort Payment Compliance</p>
                 </div>
                 <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-prmsu-cyan/10 text-prmsu-cyan border border-prmsu-cyan/30">
                    {complianceRate}% Cleared
                 </span>
              </div>
              <div className="relative flex-1">
                <Doughnut data={complianceData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="rounded-2xl bg-prmsu-card/80 border border-prmsu-royal/50 p-6 shadow-xl h-80 flex flex-col">
              <div className="mb-4">
                 <h3 className="font-bold text-white font-heading">Collection Velocity</h3>
                 <p className="text-xs text-slate-400 font-mono">Submission Timeline</p>
              </div>
              <div className="relative flex-1">
                <Line data={timelineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </section>

          {/* Search Matrix */}
          <section className="rounded-2xl bg-prmsu-card/80 border border-prmsu-royal/50 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white font-heading mb-4">Student Clearance Matrix</h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Student ID or Name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#010c1c] border border-prmsu-royal/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-prmsu-cyan outline-none font-sans"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-[#010c1c] border border-prmsu-royal/70 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-prmsu-cyan outline-none font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Verified Paid</option>
                <option value="PENDING">Pending Verification</option>
                <option value="DISCREPANCY">Flagged Discrepancy</option>
                <option value="UNPAID">Unpaid / No Record</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-prmsu-royal/60">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#001736] text-slate-300 font-mono text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Reference No.</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-prmsu-royal/30 font-mono">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-[#02132b]">
                      <td className="py-3 px-4 font-bold text-white">{s.id}</td>
                      <td className="py-3 px-4 text-slate-200">{s.name}</td>
                      <td className="py-3 px-4 text-prmsu-cyan font-semibold">₱{Number(s.amount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{s.ref}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'PAID' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                          s.status === 'DISCREPANCY' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 font-mono">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
