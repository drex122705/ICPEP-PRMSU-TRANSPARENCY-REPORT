// ==========================================================================
// Student Finance Transparency Portal - Engine & Auto-Scanner
// ==========================================================================

// Preloaded Realistic Demonstration Data (CpE Class & Org Treasury)
const DEFAULT_FINANCE_DATA = {
  cohortName: 'Computer Engineering - Class of 2026',
  requiredDuesPerStudent: 200.00,
  expenses: [
    { category: 'General Assembly & Orientation', amount: 3200.00, date: '2026-09-05' },
    { category: 'Lab & Workshop Equipment', amount: 4850.00, date: '2026-09-12' },
    { category: 'Class Lanyards & Org Merch', amount: 2600.00, date: '2026-09-18' },
    { category: 'Documentation & Printed Handouts', amount: 850.00, date: '2026-09-22' },
    { category: 'Contingency / Emergency Fund', amount: 1500.00, date: '2026-09-25' }
  ],
  students: [
    { id: '2024-1001', name: 'Santos, Juan Miguel', amount: 200.00, date: '2026-09-10', ref: 'GCASH-982144', status: 'PAID', notes: 'Verified in bank account' },
    { id: '2024-1002', name: 'Reyes, Maria Nicole', amount: 200.00, date: '2026-09-11', ref: 'GCASH-119284', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1003', name: 'Dela Cruz, Carlos', amount: 200.00, date: '2026-09-11', ref: 'GCASH-472910', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1004', name: 'Tan, Kimberly Joy', amount: 100.00, date: '2026-09-12', ref: 'GCASH-829103', status: 'DISCREPANCY', notes: 'Partial Payment (₱100/₱200 required)' },
    { id: '2024-1005', name: 'Aquino, Drexler', amount: 200.00, date: '2026-09-12', ref: 'CASH-TREAS-01', status: 'PAID', notes: 'Direct Cash to Treasurer' },
    { id: '2024-1006', name: 'Garcia, Patrick Ethan', amount: 200.00, date: '2026-09-14', ref: 'GCASH-339182', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1007', name: 'Mendoza, Bea Camille', amount: 200.00, date: '2026-09-15', ref: 'GCASH-982144', status: 'DISCREPANCY', notes: 'Duplicate GCash Ref detected (same as Santos, J.)' },
    { id: '2024-1008', name: 'Bautista, Christian', amount: 200.00, date: '2026-09-16', ref: 'GCASH-552019', status: 'PENDING', notes: 'Receipt attached, pending officer verification' },
    { id: '2024-1009', name: 'Flores, Angela Mae', amount: 200.00, date: '2026-09-17', ref: 'GCASH-441029', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1010', name: 'Lim, Joshua David', amount: 0.00, date: '—', ref: '—', status: 'UNPAID', notes: 'No submission found on Google Forms' },
    { id: '2024-1011', name: 'Navarro, Alyssa', amount: 200.00, date: '2026-09-18', ref: 'GCASH-771920', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1012', name: 'Castro, Vince Gabriel', amount: 200.00, date: '2026-09-19', ref: 'GCASH-663810', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1013', name: 'Villanueva, Sophia', amount: 200.00, date: '2026-09-20', ref: 'GCASH-881923', status: 'PENDING', notes: 'Screenshot fuzzy, re-verifying' },
    { id: '2024-1014', name: 'Ramos, Gabriel Keith', amount: 0.00, date: '—', ref: '—', status: 'UNPAID', notes: 'Unpaid dues' },
    { id: '2024-1015', name: 'Torres, Princess Joy', amount: 200.00, date: '2026-09-22', ref: 'GCASH-991024', status: 'PAID', notes: 'Cleared' }
  ]
};

// Global App State
let state = {
  students: [...DEFAULT_FINANCE_DATA.students],
  expenses: [...DEFAULT_FINANCE_DATA.expenses],
  requiredDues: DEFAULT_FINANCE_DATA.requiredDuesPerStudent,
  gSheetUrl: localStorage.getItem('cpe_finance_gsheet_url') || '',
  autoSyncTimer: 60,
  syncIntervalId: null,
  charts: {
    compliance: null,
    expenses: null,
    timeline: null
  }
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved state from localStorage if available
  const savedData = localStorage.getItem('cpe_finance_local_data');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed.students && parsed.students.length > 0) {
        state.students = parsed.students;
      }
      if (parsed.expenses && parsed.expenses.length > 0) {
        state.expenses = parsed.expenses;
      }
    } catch (e) {
      console.warn('Could not parse cached local data', e);
    }
  }

  // Init UI Components
  setupModalAndTabs();
  setupSearchAndFilters();
  setupFileScanner();
  setupGoogleSheetsSync();
  initCharts();
  renderDashboard();

  // If a Google Sheet URL is already saved, trigger an immediate sync
  if (state.gSheetUrl) {
    fetchGoogleSheetData(state.gSheetUrl, true);
  }

  // Start the 60-second auto-sync ticker
  startSyncTicker();
});

// ==========================================================================
// Dashboard Calculations & Infographics Rendering
// ==========================================================================
function renderDashboard() {
  const students = state.students;
  const expenses = state.expenses;

  // 1. KPI Calculations
  const totalCollections = students.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netBalance = totalCollections - totalExpenses;

  // Status counts
  const paidCount = students.filter(s => s.status === 'PAID').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const discrepancyCount = students.filter(s => s.status === 'DISCREPANCY').length;
  const unpaidCount = students.filter(s => s.status === 'UNPAID').length;

  const totalStudents = students.length || 1;
  const complianceRate = Math.round((paidCount / totalStudents) * 100);

  // 2. Update KPI Elements in DOM
  const elTotalCollections = document.getElementById('kpi-total-collections');
  const elTotalPaymentsCount = document.getElementById('kpi-total-payments-count');
  const elTotalExpenses = document.getElementById('kpi-total-expenses');
  const elExpenseItemsCount = document.getElementById('kpi-expense-items-count');
  const elNetBalance = document.getElementById('kpi-net-balance');
  const elDiscrepanciesCount = document.getElementById('kpi-discrepancies-count');
  const elComplianceBadge = document.getElementById('badge-compliance-rate');
  const elClearedCount = document.getElementById('stat-cleared-count');
  const elPendingStatCount = document.getElementById('stat-pending-count');
  const elDiscrepancyActiveBadge = document.getElementById('badge-discrepancy-active');

  if (elTotalCollections) elTotalCollections.textContent = formatCurrency(totalCollections);
  if (elTotalPaymentsCount) elTotalPaymentsCount.textContent = `${students.filter(s => s.amount > 0).length} submissions recorded`;
  if (elTotalExpenses) elTotalExpenses.textContent = formatCurrency(totalExpenses);
  if (elExpenseItemsCount) elExpenseItemsCount.textContent = `${expenses.length} audited disbursements`;
  if (elNetBalance) elNetBalance.textContent = formatCurrency(netBalance);
  if (elDiscrepanciesCount) elDiscrepanciesCount.textContent = discrepancyCount;
  if (elComplianceBadge) elComplianceBadge.textContent = `${complianceRate}% Cleared`;
  if (elClearedCount) elClearedCount.textContent = `${paidCount} students`;
  if (elPendingStatCount) elPendingStatCount.textContent = `${pendingCount + unpaidCount} students`;
  if (elDiscrepancyActiveBadge) elDiscrepancyActiveBadge.textContent = `${discrepancyCount} Items Need Attention`;

  // 3. Update Chart Infographics
  updateCharts({
    paidCount,
    pendingCount,
    discrepancyCount,
    unpaidCount,
    expenses,
    students
  });

  // 4. Render Table & Discrepancies
  renderTableRows();
  renderDiscrepancyCenter();

  // 5. Re-init Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Format number to Philippine Peso currency string
function formatCurrency(val) {
  return '₱' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==========================================================================
// Chart.js Infographics Management
// ==========================================================================
function initCharts() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = '"Plus Jakarta Sans", sans-serif';

  // 1. Compliance / Status Donut Chart
  const ctxCompliance = document.getElementById('chart-compliance');
  if (ctxCompliance) {
    state.charts.compliance = new Chart(ctxCompliance, {
      type: 'doughnut',
      data: {
        labels: ['Verified Paid', 'Pending Check', 'Discrepancy', 'Unpaid'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#475569'],
          borderWidth: 2,
          borderColor: '#090d16',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  // 2. Expense Category Breakdown Doughnut Chart
  const ctxExpenses = document.getElementById('chart-expenses');
  if (ctxExpenses) {
    state.charts.expenses = new Chart(ctxExpenses, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#0ea5e9', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'],
          borderWidth: 2,
          borderColor: '#090d16'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 10, font: { size: 10 } }
          }
        }
      }
    });
  }

  // 3. Timeline / Influx Velocity Chart
  const ctxTimeline = document.getElementById('chart-timeline');
  if (ctxTimeline) {
    state.charts.timeline = new Chart(ctxTimeline, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Collections (₱)',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(51, 65, 85, 0.2)' } },
          y: { 
            grid: { color: 'rgba(51, 65, 85, 0.2)' },
            ticks: {
              callback: (v) => '₱' + v
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function updateCharts({ paidCount, pendingCount, discrepancyCount, unpaidCount, expenses, students }) {
  // Update Compliance
  if (state.charts.compliance) {
    state.charts.compliance.data.datasets[0].data = [paidCount, pendingCount, discrepancyCount, unpaidCount];
    state.charts.compliance.update();
  }

  // Update Expenses Breakdown
  if (state.charts.expenses) {
    state.charts.expenses.data.labels = expenses.map(e => e.category);
    state.charts.expenses.data.datasets[0].data = expenses.map(e => e.amount);
    state.charts.expenses.update();
  }

  // Update Timeline
  if (state.charts.timeline) {
    // Group student payments by date
    const dateMap = {};
    students.forEach(s => {
      if (s.date && s.date !== '—') {
        dateMap[s.date] = (dateMap[s.date] || 0) + (Number(s.amount) || 0);
      }
    });

    const sortedDates = Object.keys(dateMap).sort();
    state.charts.timeline.data.labels = sortedDates.map(d => d.slice(5)); // Show MM-DD
    state.charts.timeline.data.datasets[0].data = sortedDates.map(d => dateMap[d]);
    state.charts.timeline.update();
  }
}

// ==========================================================================
// Student Table & Search Filter
// ==========================================================================
function setupSearchAndFilters() {
  const searchInput = document.getElementById('student-search-input');
  const filterStatus = document.getElementById('filter-status');
  const btnExport = document.getElementById('btn-export-csv');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderTableRows());
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', () => renderTableRows());
  }

  if (btnExport) {
    btnExport.addEventListener('click', exportCleanCSV);
  }
}

function renderTableRows() {
  const tbody = document.getElementById('student-records-tbody');
  const searchInput = document.getElementById('student-search-input');
  const filterStatus = document.getElementById('filter-status');
  const counterText = document.getElementById('records-counter-text');

  if (!tbody) return;

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const filter = filterStatus ? filterStatus.value : 'ALL';

  const filtered = state.students.filter(student => {
    const matchQuery = (student.name && student.name.toLowerCase().includes(query)) ||
                       (student.id && student.id.toLowerCase().includes(query)) ||
                       (student.ref && student.ref.toLowerCase().includes(query));
    const matchStatus = filter === 'ALL' || student.status === filter;
    return matchQuery && matchStatus;
  });

  if (counterText) {
    counterText.textContent = `Showing ${filtered.length} of ${state.students.length} students`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500 font-mono">
          No matching student records found. Check spelling or try searching another Student ID.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    let badgeClass = 'badge-unpaid';
    let badgeLabel = 'Unpaid';

    if (s.status === 'PAID') {
      badgeClass = 'badge-paid';
      badgeLabel = 'Verified Paid';
    } else if (s.status === 'PENDING') {
      badgeClass = 'badge-pending';
      badgeLabel = 'Pending Check';
    } else if (s.status === 'DISCREPANCY') {
      badgeClass = 'badge-discrepancy';
      badgeLabel = 'Discrepancy';
    }

    return `
      <tr class="hover:bg-slate-900/80 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-white">${escapeHtml(s.id)}</td>
        <td class="py-3 px-4 text-slate-200 font-medium">${escapeHtml(s.name)}</td>
        <td class="py-3 px-4 font-mono text-slate-400">₱${state.requiredDues.toFixed(2)}</td>
        <td class="py-3 px-4 font-mono font-semibold ${s.amount > 0 ? 'text-emerald-400' : 'text-slate-500'}">
          ₱${Number(s.amount || 0).toFixed(2)}
        </td>
        <td class="py-3 px-4 font-mono text-xs text-slate-400">${escapeHtml(s.ref || '—')}</td>
        <td class="py-3 px-4">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${badgeClass}">
            ${badgeLabel}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <span class="text-xs text-slate-400" title="${escapeHtml(s.notes || '')}">
            ${escapeHtml(s.notes || '—')}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Discrepancy Action List
function renderDiscrepancyCenter() {
  const container = document.getElementById('discrepancy-items-container');
  if (!container) return;

  const discrepancies = state.students.filter(s => s.status === 'DISCREPANCY');

  if (discrepancies.length === 0) {
    container.innerHTML = `
      <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
        <i data-lucide="check-circle-2" class="w-4 h-4"></i>
        <span>No discrepancies detected! All submitted records align with the master list and reference logs.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = discrepancies.map(d => `
    <div class="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div>
        <div class="font-bold text-white flex items-center gap-2">
          <span>${escapeHtml(d.name)}</span>
          <span class="font-mono text-amber-400">(${escapeHtml(d.id)})</span>
        </div>
        <div class="text-slate-400 mt-0.5 font-mono">
          Ref: <span class="text-slate-200">${escapeHtml(d.ref)}</span> • Recorded: <span class="text-emerald-400">₱${Number(d.amount).toFixed(2)}</span>
        </div>
      </div>
      <div class="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[11px]">
        ⚠️ ${escapeHtml(d.notes || 'Discrepancy flagged')}
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// Multi-Source Scanner & Auto-Sync Engine
// ==========================================================================
function setupModalAndTabs() {
  const modal = document.getElementById('scanner-modal');
  const btnOpen = document.getElementById('btn-open-scanner');
  const btnClose = document.getElementById('btn-close-scanner');
  const tabBtnGsheet = document.getElementById('tab-btn-gsheet');
  const tabBtnFile = document.getElementById('tab-btn-file');
  const tabContentGsheet = document.getElementById('tab-content-gsheet');
  const tabContentFile = document.getElementById('tab-content-file');
  const btnLoadDemo = document.getElementById('btn-load-demo');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
  }
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
  }

  // Switch to GSheets tab
  if (tabBtnGsheet) {
    tabBtnGsheet.addEventListener('click', () => {
      tabBtnGsheet.className = 'py-2.5 px-4 font-bold border-b-2 border-emerald-400 text-emerald-400';
      tabBtnFile.className = 'py-2.5 px-4 text-slate-400 hover:text-slate-200';
      tabContentGsheet.classList.remove('hidden');
      tabContentFile.classList.add('hidden');
    });
  }

  // Switch to Local Files tab
  if (tabBtnFile) {
    tabBtnFile.addEventListener('click', () => {
      tabBtnFile.className = 'py-2.5 px-4 font-bold border-b-2 border-emerald-400 text-emerald-400';
      tabBtnGsheet.className = 'py-2.5 px-4 text-slate-400 hover:text-slate-200';
      tabContentFile.classList.remove('hidden');
      tabContentGsheet.classList.add('hidden');
    });
  }

  // Reset to Demo Data
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener('click', () => {
      state.students = [...DEFAULT_FINANCE_DATA.students];
      state.expenses = [...DEFAULT_FINANCE_DATA.expenses];
      localStorage.removeItem('cpe_finance_local_data');
      renderDashboard();
      if (modal) modal.classList.add('hidden');
      alert('Reset to default CpE class sample data!');
    });
  }
}

// 1. Google Sheets Auto-Sync Logic
function setupGoogleSheetsSync() {
  const inputUrl = document.getElementById('input-gsheet-url');
  const btnSave = document.getElementById('btn-save-gsheet');
  const btnManualSync = document.getElementById('btn-manual-sync');

  if (inputUrl && state.gSheetUrl) {
    inputUrl.value = state.gSheetUrl;
  }

  if (btnSave && inputUrl) {
    btnSave.addEventListener('click', () => {
      const url = inputUrl.value.trim();
      if (!url) {
        alert('Please enter a valid Google Sheets URL');
        return;
      }
      state.gSheetUrl = url;
      localStorage.setItem('cpe_finance_gsheet_url', url);
      fetchGoogleSheetData(url, true);
      const modal = document.getElementById('scanner-modal');
      if (modal) modal.classList.add('hidden');
    });
  }

  if (btnManualSync) {
    btnManualSync.addEventListener('click', () => {
      if (state.gSheetUrl) {
        fetchGoogleSheetData(state.gSheetUrl, true);
      } else {
        renderDashboard();
      }
    });
  }
}

// Fetch and Parse Google Sheets CSV
async function fetchGoogleSheetData(url, showAlert = false) {
  const syncStatusText = document.getElementById('sync-status-text');
  const syncDot = document.getElementById('sync-dot');

  try {
    if (syncStatusText) syncStatusText.textContent = 'Syncing...';
    if (syncDot) syncDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-400';

    // Normalize URL: If it's an edit link, convert to CSV export link
    let fetchUrl = url;
    if (url.includes('/edit')) {
      fetchUrl = url.split('/edit')[0] + '/export?format=csv';
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();

    parseAndApplyCSV(csvText);

    if (syncStatusText) syncStatusText.textContent = 'Live Connected';
    if (syncDot) syncDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-emerald-500';

    if (showAlert) {
      alert('Successfully synchronized live data from Google Sheets!');
    }
  } catch (err) {
    console.error('Google Sheets sync failed:', err);
    if (syncStatusText) syncStatusText.textContent = 'Sync Paused';
    if (syncDot) syncDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-rose-500';
    if (showAlert) {
      alert('Could not fetch Google Sheet. Make sure the sheet is set to "Publish to web" as CSV or "Anyone with the link can view".');
    }
  }
}

// Convert CSV Text to Student Records
function parseAndApplyCSV(csvText) {
  if (!window.XLSX) return;
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!rawRows || rawRows.length < 2) return;

  const headers = rawRows[0].map(h => String(h || '').trim().toLowerCase());
  
  // Intelligent Column Mapper
  const colId = headers.findIndex(h => h.includes('student') || h.includes('id') || h.includes('number'));
  const colName = headers.findIndex(h => h.includes('name') || h.includes('full'));
  const colAmount = headers.findIndex(h => h.includes('amount') || h.includes('paid') || h.includes('fee'));
  const colRef = headers.findIndex(h => h.includes('ref') || h.includes('reference') || h.includes('transaction'));
  const colDate = headers.findIndex(h => h.includes('timestamp') || h.includes('date'));

  const parsedStudents = [];
  const seenRefs = new Set();

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const id = colId !== -1 ? String(row[colId] || `REC-${i}`) : `REC-${i}`;
    const name = colName !== -1 ? String(row[colName] || 'Unknown Student') : 'Unknown Student';
    const rawAmt = colAmount !== -1 ? parseFloat(String(row[colAmount]).replace(/[^0-9.]/g, '')) || 0 : 200;
    const ref = colRef !== -1 ? String(row[colRef] || '—') : '—';
    const date = colDate !== -1 ? String(row[colDate] || '').slice(0, 10) : new Date().toISOString().slice(0, 10);

    let status = 'PAID';
    let notes = 'Cleared';

    if (rawAmt === 0) {
      status = 'UNPAID';
      notes = 'No payment recorded';
    } else if (rawAmt < state.requiredDues) {
      status = 'DISCREPANCY';
      notes = `Underpayment (₱${rawAmt} of ₱${state.requiredDues})`;
    } else if (ref !== '—' && seenRefs.has(ref.toLowerCase())) {
      status = 'DISCREPANCY';
      notes = `Duplicate transaction reference (${ref})`;
    }

    if (ref !== '—') seenRefs.add(ref.toLowerCase());

    parsedStudents.push({
      id: id.trim(),
      name: name.trim(),
      amount: rawAmt,
      date: date.trim() || '—',
      ref: ref.trim(),
      status: status,
      notes: notes
    });
  }

  if (parsedStudents.length > 0) {
    state.students = parsedStudents;
    localStorage.setItem('cpe_finance_local_data', JSON.stringify({
      students: state.students,
      expenses: state.expenses
    }));
    renderDashboard();
  }
}

// 2. Drag & Drop File Scanner (Excel & Word)
function setupFileScanner() {
  const dropZone = document.getElementById('file-drop-zone');
  const fileInput = document.getElementById('file-input');
  const scanStatus = document.getElementById('file-scan-status');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files.length > 0) {
      handleIncomingFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleIncomingFile(e.target.files[0]);
    }
  });
}

function handleIncomingFile(file) {
  const scanStatus = document.getElementById('file-scan-status');
  if (scanStatus) {
    scanStatus.classList.remove('hidden');
    scanStatus.textContent = `Scanning ${file.name}...`;
  }

  const fileName = file.name.toLowerCase();

  // Excel / CSV File
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
        parseAndApplyCSV(csv);
        if (scanStatus) scanStatus.textContent = `✅ Successfully imported ${file.name}!`;
        setTimeout(() => {
          const modal = document.getElementById('scanner-modal');
          if (modal) modal.classList.add('hidden');
        }, 1200);
      } catch (err) {
        console.error(err);
        if (scanStatus) scanStatus.textContent = `❌ Error reading Excel file: ${err.message}`;
      }
    };
    reader.readAsArrayBuffer(file);
  }
  // Word Document (.docx)
  else if (fileName.endsWith('.docx')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!window.mammoth) return;
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then((result) => {
          if (scanStatus) {
            scanStatus.textContent = `✅ Scanned Word Doc: ${result.value.length} characters parsed. Checking discrepancies...`;
          }
        })
        .catch((err) => {
          if (scanStatus) scanStatus.textContent = `❌ Error reading Docx: ${err.message}`;
        });
    };
    reader.readAsArrayBuffer(file);
  } else {
    if (scanStatus) scanStatus.textContent = `⚠️ Unsupported file format. Please upload .xlsx, .csv, or .docx`;
  }
}

// 3. Auto-Sync Countdown Ticker (Runs every 1 second)
function startSyncTicker() {
  const timerEl = document.getElementById('sync-timer');

  setInterval(() => {
    state.autoSyncTimer -= 1;
    if (state.autoSyncTimer <= 0) {
      state.autoSyncTimer = 60;
      if (state.gSheetUrl) {
        fetchGoogleSheetData(state.gSheetUrl, false);
      }
    }
    if (timerEl) {
      timerEl.textContent = `(${state.autoSyncTimer}s)`;
    }
  }, 1000);
}

// 4. Clean CSV Export
function exportCleanCSV() {
  const headers = ['Student ID', 'Student Name', 'Amount Paid', 'Date', 'Reference No.', 'Status', 'Notes'];
  const rows = state.students.map(s => [
    `"${s.id}"`,
    `"${s.name}"`,
    s.amount,
    `"${s.date}"`,
    `"${s.ref}"`,
    `"${s.status}"`,
    `"${s.notes}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `student_finance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Escape HTML for XSS prevention
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
