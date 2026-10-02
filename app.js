// ==========================================================================
// ICPEP PRMSU - Official Financial Transparency Portal Engine
// Tagline: "ICPEP PRMSU, we serve you"
// Computer Engineering (CpE) Microprocessor & Motherboard 3D Architecture
// ==========================================================================

// Pre-defined Sample Data (Only loaded if user explicitly clicks "Load Sample Data")
const ICPEP_SAMPLE_DATA = {
  requiredDues: 200.00,
  expenses: [
    { category: 'CpE General Assembly & Orientation', amount: 3500.00, date: '2026-09-05' },
    { category: 'Embedded Systems & Arduino Lab Kits', amount: 5200.00, date: '2026-09-14' },
    { category: 'Official ICpEP PRMSU Org Shirts', amount: 4800.00, date: '2026-09-20' },
    { category: 'Commission on Audit Printing & Folders', amount: 650.00, date: '2026-09-23' },
    { category: 'Student Welfare & Emergency Reserve', amount: 2000.00, date: '2026-09-28' }
  ],
  students: [
    { id: '2024-1001', name: 'Santos, Juan Miguel', amount: 200.00, date: '2026-09-10', ref: 'GCASH-982144', status: 'PAID', notes: 'Verified in bank account' },
    { id: '2024-1002', name: 'Reyes, Maria Nicole', amount: 200.00, date: '2026-09-11', ref: 'GCASH-119284', status: 'PAID', notes: 'Cleared by Treasury' },
    { id: '2024-1003', name: 'Dela Cruz, Carlos', amount: 200.00, date: '2026-09-11', ref: 'GCASH-472910', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1004', name: 'Tan, Kimberly Joy', amount: 100.00, date: '2026-09-12', ref: 'GCASH-829103', status: 'DISCREPANCY', notes: 'Partial Payment (₱100 of ₱200 required dues)' },
    { id: '2024-1005', name: 'Aquino, Drexler', amount: 200.00, date: '2026-09-12', ref: 'CASH-TREAS-01', status: 'PAID', notes: 'Direct Cash to Treasury Officer' },
    { id: '2024-1006', name: 'Garcia, Patrick Ethan', amount: 200.00, date: '2026-09-14', ref: 'GCASH-339182', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1007', name: 'Mendoza, Bea Camille', amount: 200.00, date: '2026-09-15', ref: 'GCASH-982144', status: 'DISCREPANCY', notes: 'Duplicate GCash Ref detected (reused reference)' },
    { id: '2024-1008', name: 'Bautista, Christian', amount: 200.00, date: '2026-09-16', ref: 'GCASH-552019', status: 'PENDING', notes: 'Receipt attached, pending officer check' },
    { id: '2024-1009', name: 'Flores, Angela Mae', amount: 200.00, date: '2026-09-17', ref: 'GCASH-441029', status: 'PAID', notes: 'Cleared' },
    { id: '2024-1010', name: 'Lim, Joshua David', amount: 0.00, date: '—', ref: '—', status: 'UNPAID', notes: 'No payment record submitted' }
  ]
};

// Global App State - STARTS EMPTY AS REQUESTED
let state = {
  students: [],
  expenses: [],
  requiredDues: 200.00,
  gSheetUrl: localStorage.getItem('icpep_prmsu_gsheet_url') || '',
  autoSyncTimer: 60,
  charts: {
    compliance: null,
    expenses: null,
    timeline: null
  }
};

// ==========================================================================
// DOM Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Check localStorage for previously ingested data
  const savedData = localStorage.getItem('icpep_prmsu_local_data');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed.students && parsed.students.length > 0) state.students = parsed.students;
      if (parsed.expenses && parsed.expenses.length > 0) state.expenses = parsed.expenses;
    } catch (e) {
      console.warn('Could not parse local data', e);
    }
  }

  // Start Real-Time Philippine Standard Time Clock
  initLivePHTClock();

  // Start Interactive CpE Microprocessor 3D Animation
  init3DCpEMotherboardIntro();

  // Initialize UI & Scanners
  initCharts();
  setupUIEventListeners();
  setupMultiSourceScanner();

  // Render Dashboard
  renderDashboard();

  // If Google Sheets link exists, trigger sync
  if (state.gSheetUrl) {
    fetchGoogleSheetData(state.gSheetUrl, false);
  }

  // Start 60-Second background sync ticker
  startSyncTicker();
});

// ==========================================================================
// 1. 3D INTERACTIVE CPE MOTHERBOARD & MICROCHIP ANIMATION (THREE.JS)
// ==========================================================================
function init3DCpEMotherboardIntro() {
  const introScreen = document.getElementById('intro-screen');
  const btnEnter = document.getElementById('btn-enter-portal');
  const btnSkip = document.getElementById('btn-skip-intro');
  const btnReplay = document.getElementById('btn-replay-intro');
  const canvas = document.getElementById('three-intro-canvas');

  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010a18, 0.0018);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, -35, 75);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x00C0F3, 3, 200);
  cyanLight.position.set(30, 30, 40);
  scene.add(cyanLight);

  const goldLight = new THREE.PointLight(0xF4B41A, 2.5, 200);
  goldLight.position.set(-30, -30, 40);
  scene.add(goldLight);

  // Group containing the entire 3D Motherboard Assembly
  const cpeAssembly = new THREE.Group();

  // 1. PCB Motherboard Substrate (Matte dark blue-green)
  const pcbGeometry = new THREE.PlaneGeometry(110, 80, 20, 20);
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: 0x021631,
    roughness: 0.7,
    metalness: 0.3
  });
  const pcbMesh = new THREE.Mesh(pcbGeometry, pcbMaterial);
  cpeAssembly.add(pcbMesh);

  // 2. PCB Circuit Grid Lines (Wireframe overlay)
  const gridHelper = new THREE.GridHelper(100, 30, 0x00C0F3, 0x062854);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.z = 0.2;
  cpeAssembly.add(gridHelper);

  // 3. Central Microprocessor / CPU Chip (Silicon Die + Gold Heatspreader)
  const cpuGroup = new THREE.Group();
  cpuGroup.position.z = 1.5;

  // CPU Substrate (Dark ceramic)
  const cpuSubstrateGeo = new THREE.BoxGeometry(22, 22, 1.2);
  const cpuSubstrateMat = new THREE.MeshStandardMaterial({
    color: 0x010814,
    roughness: 0.4,
    metalness: 0.8
  });
  const cpuSubstrate = new THREE.Mesh(cpuSubstrateGeo, cpuSubstrateMat);
  cpuGroup.add(cpuSubstrate);

  // CPU Integrated Heat Spreader (Gold / Metallic)
  const ihsGeo = new THREE.BoxGeometry(16, 16, 0.8);
  const ihsMat = new THREE.MeshStandardMaterial({
    color: 0xF4B41A,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x3d2800
  });
  const ihsMesh = new THREE.Mesh(ihsGeo, ihsMat);
  ihsMesh.position.z = 0.9;
  cpuGroup.add(ihsMesh);

  // CPU Pins (perimeter gold pins)
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xF4B41A, metalness: 1 });
  const pinGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);

  for (let i = -10; i <= 10; i += 2.5) {
    // Top & Bottom pins
    const p1 = new THREE.Mesh(pinGeo, pinMat);
    p1.position.set(i, 11.5, 0);
    p1.rotation.x = Math.PI / 2;
    cpuGroup.add(p1);

    const p2 = new THREE.Mesh(pinGeo, pinMat);
    p2.position.set(i, -11.5, 0);
    p2.rotation.x = Math.PI / 2;
    cpuGroup.add(p2);

    // Left & Right pins
    const p3 = new THREE.Mesh(pinGeo, pinMat);
    p3.position.set(11.5, i, 0);
    p3.rotation.z = Math.PI / 2;
    cpuGroup.add(p3);

    const p4 = new THREE.Mesh(pinGeo, pinMat);
    p4.position.set(-11.5, i, 0);
    p4.rotation.z = Math.PI / 2;
    cpuGroup.add(p4);
  }

  cpeAssembly.add(cpuGroup);

  // 4. Glowing Data Packet Pulses (Electrons streaming along bus lines into CPU)
  const pulseCount = 80;
  const pulseGeo = new THREE.BufferGeometry();
  const pulsePos = new Float32Array(pulseCount * 3);
  const pulseVel = [];

  for (let i = 0; i < pulseCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 32;
    pulsePos[i * 3] = Math.cos(angle) * dist;
    pulsePos[i * 3 + 1] = Math.sin(angle) * dist;
    pulsePos[i * 3 + 2] = 0.8 + Math.random() * 0.5;

    pulseVel.push({
      speed: 0.15 + Math.random() * 0.25,
      angle: angle,
      dist: dist
    });
  }

  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulseMat = new THREE.PointsMaterial({
    color: 0x00C0F3,
    size: 1.8,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
  cpeAssembly.add(pulsePoints);

  // 5. Surrounding 3D Holographic Orbit Rings
  const ringGeo = new THREE.TorusGeometry(36, 0.25, 16, 100);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x00C0F3,
    emissive: 0x004393,
    metalness: 0.8,
    roughness: 0.2
  });
  const orbitRing = new THREE.Mesh(ringGeo, ringMat);
  orbitRing.position.z = 2;
  cpeAssembly.add(orbitRing);

  scene.add(cpeAssembly);

  // Interactive Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Subtle 3D tilt of the motherboard
    cpeAssembly.rotation.x = -0.4 + targetY * 0.8;
    cpeAssembly.rotation.y = targetX * 1.2;
    cpeAssembly.rotation.z += 0.0015;

    orbitRing.rotation.z -= 0.004;

    // Animate electrical data packets flowing into chip
    const positions = pulseGeo.attributes.position.array;
    for (let i = 0; i < pulseCount; i++) {
      pulseVel[i].dist -= pulseVel[i].speed;
      if (pulseVel[i].dist < 10) {
        pulseVel[i].dist = 40 + Math.random() * 10;
      }
      positions[i * 3] = Math.cos(pulseVel[i].angle) * pulseVel[i].dist;
      positions[i * 3 + 1] = Math.sin(pulseVel[i].angle) * pulseVel[i].dist;
    }
    pulseGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Dismiss Intro Function
  function dismissIntro() {
    if (!introScreen) return;
    introScreen.style.opacity = '0';
    introScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      introScreen.classList.add('hidden');
    }, 1000);
  }

  if (btnEnter) btnEnter.addEventListener('click', dismissIntro);
  if (btnSkip) btnSkip.addEventListener('click', dismissIntro);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !introScreen.classList.contains('hidden')) {
      dismissIntro();
    }
  });

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      introScreen.classList.remove('hidden');
      introScreen.style.opacity = '1';
      introScreen.style.pointerEvents = 'auto';
    });
  }
}

// ==========================================================================
// 2. REAL-TIME PHILIPPINE STANDARD TIME (PST) CLOCK
// ==========================================================================
function initLivePHTClock() {
  const clockEl = document.getElementById('live-pht-clock');
  function tick() {
    if (!clockEl) return;
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now);
    clockEl.textContent = `PST: ${formatted}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ==========================================================================
// 3. DASHBOARD CALCULATIONS & RE-RENDERING
// ==========================================================================
function renderDashboard() {
  const students = state.students;
  const expenses = state.expenses;
  const hasData = students.length > 0;

  // Toggle Empty State Banner vs Ingested Dashboard
  const emptyBanner = document.getElementById('empty-state-banner');
  const datasetBadge = document.getElementById('dataset-status-badge');

  if (emptyBanner) {
    if (hasData) {
      emptyBanner.classList.add('hidden');
    } else {
      emptyBanner.classList.remove('hidden');
    }
  }

  if (datasetBadge) {
    if (hasData) {
      datasetBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-prmsu-cyan border border-cyan-500/30 flex items-center gap-1.5';
      datasetBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-prmsu-cyan animate-pulse"></span><span>Live Ingested (${students.length} Records)</span>`;
    } else {
      datasetBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5';
      datasetBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-500"></span><span>Awaiting Ingestion (Empty)</span>`;
    }
  }

  // KPI Calculations
  const totalCollections = students.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netBalance = totalCollections - totalExpenses;

  const paidCount = students.filter(s => s.status === 'PAID').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const discrepancyCount = students.filter(s => s.status === 'DISCREPANCY').length;
  const unpaidCount = students.filter(s => s.status === 'UNPAID').length;

  const complianceRate = students.length > 0 ? Math.round((paidCount / students.length) * 100) : 0;

  // Update DOM Elements
  const elTotalCollections = document.getElementById('kpi-total-collections');
  const elSubmissionsCount = document.getElementById('kpi-submissions-count');
  const elTotalExpenses = document.getElementById('kpi-total-expenses');
  const elExpensesCount = document.getElementById('kpi-expenses-count');
  const elNetBalance = document.getElementById('kpi-net-balance');
  const elDiscrepanciesCount = document.getElementById('kpi-discrepancies-count');
  const elComplianceBadge = document.getElementById('badge-compliance-rate');
  const elClearedCount = document.getElementById('stat-cleared-count');
  const elPendingStatCount = document.getElementById('stat-pending-count');
  const elDiscrepancyActiveBadge = document.getElementById('badge-discrepancy-active');

  if (elTotalCollections) elTotalCollections.textContent = formatCurrency(totalCollections);
  if (elSubmissionsCount) elSubmissionsCount.textContent = hasData ? `${students.filter(s => s.amount > 0).length} recorded entries` : '0 recorded entries';
  if (elTotalExpenses) elTotalExpenses.textContent = formatCurrency(totalExpenses);
  if (elExpensesCount) elExpensesCount.textContent = hasData ? `${expenses.length} audited expense vouchers` : '0 audited expense vouchers';
  if (elNetBalance) elNetBalance.textContent = formatCurrency(netBalance);
  if (elDiscrepanciesCount) elDiscrepanciesCount.textContent = discrepancyCount;
  if (elComplianceBadge) elComplianceBadge.textContent = `${complianceRate}% Cleared`;
  if (elClearedCount) elClearedCount.textContent = `${paidCount} students`;
  if (elPendingStatCount) elPendingStatCount.textContent = `${pendingCount + unpaidCount} students`;
  if (elDiscrepancyActiveBadge) elDiscrepancyActiveBadge.textContent = `${discrepancyCount} Discrepancies`;

  // Update Charts
  updateCharts({
    hasData,
    paidCount,
    pendingCount,
    discrepancyCount,
    unpaidCount,
    expenses,
    students
  });

  // Render Table & Discrepancies
  renderTableRows();
  renderDiscrepancyCenter();

  if (window.lucide) {
    lucide.createIcons();
  }
}

function formatCurrency(val) {
  return '₱' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==========================================================================
// 4. CHART.JS INFOGRAPHICS MANAGEMENT
// ==========================================================================
function initCharts() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = '"Inter", sans-serif';

  // Compliance Chart
  const ctxCompliance = document.getElementById('chart-compliance');
  if (ctxCompliance) {
    state.charts.compliance = new Chart(ctxCompliance, {
      type: 'doughnut',
      data: {
        labels: ['Fully Cleared', 'Pending Audit', 'Discrepancy', 'Unpaid'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: ['#00C0F3', '#F4B41A', '#EF4444', '#334155'],
          borderWidth: 2,
          borderColor: '#010E21',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }
        },
        cutout: '70%'
      }
    });
  }

  // Expense Allocation Chart
  const ctxExpenses = document.getElementById('chart-expenses');
  if (ctxExpenses) {
    state.charts.expenses = new Chart(ctxExpenses, {
      type: 'pie',
      data: {
        labels: ['Awaiting Expense Ingestion'],
        datasets: [{
          data: [1],
          backgroundColor: ['#1e293b'],
          borderWidth: 2,
          borderColor: '#010E21'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } }
        }
      }
    });
  }

  // Timeline / Velocity Chart
  const ctxTimeline = document.getElementById('chart-timeline');
  if (ctxTimeline) {
    state.charts.timeline = new Chart(ctxTimeline, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Daily Collections (₱)',
          data: [],
          borderColor: '#00C0F3',
          backgroundColor: 'rgba(0, 192, 243, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#00C0F3',
          pointBorderColor: '#ffffff',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(0, 67, 147, 0.3)' } },
          y: { 
            grid: { color: 'rgba(0, 67, 147, 0.3)' },
            ticks: { callback: (v) => '₱' + v }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function updateCharts({ hasData, paidCount, pendingCount, discrepancyCount, unpaidCount, expenses, students }) {
  if (state.charts.compliance) {
    state.charts.compliance.data.datasets[0].data = hasData ? [paidCount, pendingCount, discrepancyCount, unpaidCount] : [0, 0, 0, 0];
    state.charts.compliance.update();
  }

  if (state.charts.expenses) {
    if (hasData && expenses.length > 0) {
      state.charts.expenses.data.labels = expenses.map(e => e.category);
      state.charts.expenses.data.datasets[0].data = expenses.map(e => e.amount);
      state.charts.expenses.data.datasets[0].backgroundColor = ['#00C0F3', '#F4B41A', '#004393', '#10B981', '#FF6B00'];
    } else {
      state.charts.expenses.data.labels = ['Awaiting Expense Ingestion'];
      state.charts.expenses.data.datasets[0].data = [1];
      state.charts.expenses.data.datasets[0].backgroundColor = ['#1e293b'];
    }
    state.charts.expenses.update();
  }

  if (state.charts.timeline) {
    if (hasData) {
      const dateMap = {};
      students.forEach(s => {
        if (s.date && s.date !== '—') {
          dateMap[s.date] = (dateMap[s.date] || 0) + (Number(s.amount) || 0);
        }
      });
      const sortedDates = Object.keys(dateMap).sort();
      state.charts.timeline.data.labels = sortedDates.map(d => d.slice(5));
      state.charts.timeline.data.datasets[0].data = sortedDates.map(d => dateMap[d]);
    } else {
      state.charts.timeline.data.labels = [];
      state.charts.timeline.data.datasets[0].data = [];
    }
    state.charts.timeline.update();
  }
}

// ==========================================================================
// 5. TABLE SEARCH & CLEARANCE MATRIX
// ==========================================================================
function setupUIEventListeners() {
  const searchInput = document.getElementById('student-search-input');
  const filterStatus = document.getElementById('filter-status');
  const btnReset = document.getElementById('btn-reset-data');

  if (searchInput) searchInput.addEventListener('input', () => renderTableRows());
  if (filterStatus) filterStatus.addEventListener('change', () => renderTableRows());

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset portal back to clean empty state?')) {
        state.students = [];
        state.expenses = [];
        localStorage.removeItem('icpep_prmsu_local_data');
        renderDashboard();
      }
    });
  }

  // Empty state button shortcuts
  const btnEmptyUpload = document.getElementById('btn-empty-upload');
  const btnEmptyGsheet = document.getElementById('btn-empty-gsheet');
  const btnEmptyDemo = document.getElementById('btn-empty-demo');
  const modal = document.getElementById('scanner-modal');

  if (btnEmptyUpload && modal) {
    btnEmptyUpload.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.getElementById('tab-btn-file').click();
    });
  }

  if (btnEmptyGsheet && modal) {
    btnEmptyGsheet.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.getElementById('tab-btn-gsheet').click();
    });
  }

  if (btnEmptyDemo) {
    btnEmptyDemo.addEventListener('click', () => {
      state.students = [...ICPEP_SAMPLE_DATA.students];
      state.expenses = [...ICPEP_SAMPLE_DATA.expenses];
      localStorage.setItem('icpep_prmsu_local_data', JSON.stringify({
        students: state.students,
        expenses: state.expenses
      }));
      renderDashboard();
    });
  }
}

function renderTableRows() {
  const tbody = document.getElementById('student-records-tbody');
  const searchInput = document.getElementById('student-search-input');
  const filterStatus = document.getElementById('filter-status');
  const counterText = document.getElementById('records-counter-text');

  if (!tbody) return;

  if (state.students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-500 font-mono">
          <i data-lucide="cpu" class="w-8 h-8 mx-auto mb-2 text-prmsu-cyan/40"></i>
          <div>No student financial records loaded yet.</div>
          <div class="text-xs text-slate-500 mt-1">Upload your class Excel file (.xlsx) or link Google Sheets to populate.</div>
        </td>
      </tr>
    `;
    if (counterText) counterText.textContent = 'Showing 0 student records';
    if (window.lucide) lucide.createIcons();
    return;
  }

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
    counterText.textContent = `Showing ${filtered.length} of ${state.students.length} student records`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500 font-mono">
          No records match query "${escapeHtml(query)}".
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
      badgeLabel = 'Verified Cleared';
    } else if (s.status === 'PENDING') {
      badgeClass = 'badge-pending';
      badgeLabel = 'Pending Audit';
    } else if (s.status === 'DISCREPANCY') {
      badgeClass = 'badge-discrepancy';
      badgeLabel = 'Discrepancy';
    }

    return `
      <tr class="hover:bg-[#02132b] transition-colors">
        <td class="py-3 px-4 font-bold text-white">${escapeHtml(s.id)}</td>
        <td class="py-3 px-4 text-slate-200 font-sans font-medium">${escapeHtml(s.name)}</td>
        <td class="py-3 px-4 text-slate-400">₱${state.requiredDues.toFixed(2)}</td>
        <td class="py-3 px-4 font-semibold ${s.amount > 0 ? 'text-prmsu-cyan' : 'text-slate-500'}">
          ₱${Number(s.amount || 0).toFixed(2)}
        </td>
        <td class="py-3 px-4 text-xs text-slate-400">${escapeHtml(s.ref || '—')}</td>
        <td class="py-3 px-4">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
            ${badgeLabel}
          </span>
        </td>
        <td class="py-3 px-4 text-right text-xs text-slate-400 font-sans">
          ${escapeHtml(s.notes || '—')}
        </td>
      </tr>
    `;
  }).join('');
}

function renderDiscrepancyCenter() {
  const container = document.getElementById('discrepancy-items-container');
  if (!container) return;

  const discrepancies = state.students.filter(s => s.status === 'DISCREPANCY');

  if (state.students.length === 0) {
    container.innerHTML = `
      <div class="p-3.5 rounded-xl bg-[#001736] border border-prmsu-royal/60 text-slate-400 text-xs">
        No active records ingested. Upload files to run automatic discrepancy audits.
      </div>
    `;
    return;
  }

  if (discrepancies.length === 0) {
    container.innerHTML = `
      <div class="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-prmsu-cyan text-xs flex items-center gap-2">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-prmsu-cyan"></i>
        <span>All ingested entries verified. Zero reference collisions or underpayments detected.</span>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = discrepancies.map(d => `
    <div class="p-3.5 rounded-xl bg-[#001736] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div>
        <div class="font-bold text-white flex items-center gap-2">
          <span>${escapeHtml(d.name)}</span>
          <span class="text-prmsu-cyan">(${escapeHtml(d.id)})</span>
        </div>
        <div class="text-slate-400 mt-0.5">
          Ref: <span class="text-slate-200">${escapeHtml(d.ref)}</span> • Recorded: <span class="text-prmsu-cyan">₱${Number(d.amount).toFixed(2)}</span>
        </div>
      </div>
      <div class="px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-sans">
        ⚠️ ${escapeHtml(d.notes || 'Discrepancy flagged')}
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 6. MULTI-SOURCE SCANNER & INGESTION (EXCEL, WORD, GOOGLE SHEETS)
// ==========================================================================
function setupMultiSourceScanner() {
  const modal = document.getElementById('scanner-modal');
  const btnOpen = document.getElementById('btn-open-scanner');
  const btnClose = document.getElementById('btn-close-scanner');
  const tabBtnFile = document.getElementById('tab-btn-file');
  const tabBtnGsheet = document.getElementById('tab-btn-gsheet');
  const tabContentFile = document.getElementById('tab-content-file');
  const tabContentGsheet = document.getElementById('tab-content-gsheet');

  if (btnOpen && modal) btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
  if (btnClose && modal) btnClose.addEventListener('click', () => modal.classList.add('hidden'));

  if (tabBtnFile && tabBtnGsheet) {
    tabBtnFile.addEventListener('click', () => {
      tabBtnFile.className = 'py-2.5 px-4 font-bold border-b-2 border-prmsu-cyan text-prmsu-cyan';
      tabBtnGsheet.className = 'py-2.5 px-4 text-slate-400 hover:text-slate-200';
      tabContentFile.classList.remove('hidden');
      tabContentGsheet.classList.add('hidden');
    });

    tabBtnGsheet.addEventListener('click', () => {
      tabBtnGsheet.className = 'py-2.5 px-4 font-bold border-b-2 border-prmsu-cyan text-prmsu-cyan';
      tabBtnFile.className = 'py-2.5 px-4 text-slate-400 hover:text-slate-200';
      tabContentGsheet.classList.remove('hidden');
      tabContentFile.classList.add('hidden');
    });
  }

  // Drag & Drop
  const dropZone = document.getElementById('file-drop-zone');
  const fileInput = document.getElementById('file-input');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      window.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      window.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
      });
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleUploadedFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleUploadedFile(e.target.files[0]);
      }
    });
  }

  // Google Sheets Save
  const btnSaveGsheet = document.getElementById('btn-save-gsheet');
  const inputGsheet = document.getElementById('input-gsheet-url');
  if (btnSaveGsheet && inputGsheet) {
    if (state.gSheetUrl) inputGsheet.value = state.gSheetUrl;
    btnSaveGsheet.addEventListener('click', () => {
      const url = inputGsheet.value.trim();
      if (!url) {
        alert('Please enter a valid Google Sheets URL.');
        return;
      }
      state.gSheetUrl = url;
      localStorage.setItem('icpep_prmsu_gsheet_url', url);
      fetchGoogleSheetData(url, true);
      if (modal) modal.classList.add('hidden');
    });
  }
}

function handleUploadedFile(file) {
  const scanStatus = document.getElementById('file-scan-status');
  if (scanStatus) {
    scanStatus.classList.remove('hidden');
    scanStatus.textContent = `Ingesting ${file.name}...`;
  }

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
        parseAndApplyCSV(csv);
        if (scanStatus) scanStatus.textContent = `✅ Successfully ingested ${file.name}!`;
        setTimeout(() => {
          const modal = document.getElementById('scanner-modal');
          if (modal) modal.classList.add('hidden');
        }, 1000);
      } catch (err) {
        console.error(err);
        if (scanStatus) scanStatus.textContent = `❌ Parsing error: ${err.message}`;
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (fileName.endsWith('.docx')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!window.mammoth) return;
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then((result) => {
          if (scanStatus) {
            scanStatus.textContent = `✅ Scanned Word Document (${result.value.length} chars).`;
          }
        })
        .catch(err => {
          if (scanStatus) scanStatus.textContent = `❌ Docx error: ${err.message}`;
        });
    };
    reader.readAsArrayBuffer(file);
  } else {
    if (scanStatus) scanStatus.textContent = '⚠️ Please upload a valid .xlsx, .csv, or .docx file.';
  }
}

function parseAndApplyCSV(csvText) {
  if (!window.XLSX) return;
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!rawRows || rawRows.length < 2) return;

  const headers = rawRows[0].map(h => String(h || '').trim().toLowerCase());

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

    const id = colId !== -1 ? String(row[colId] || `2024-${1000 + i}`) : `2024-${1000 + i}`;
    const name = colName !== -1 ? String(row[colName] || 'Student Roster Entry') : 'Student Roster Entry';
    const rawAmt = colAmount !== -1 ? parseFloat(String(row[colAmount]).replace(/[^0-9.]/g, '')) || 0 : state.requiredDues;
    const ref = colRef !== -1 ? String(row[colRef] || '—') : '—';
    const date = colDate !== -1 ? String(row[colDate] || '').slice(0, 10) : new Date().toISOString().slice(0, 10);

    let status = 'PAID';
    let notes = 'Cleared by Treasury';

    if (rawAmt === 0) {
      status = 'UNPAID';
      notes = 'Unpaid dues';
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
    localStorage.setItem('icpep_prmsu_local_data', JSON.stringify({
      students: state.students,
      expenses: state.expenses
    }));
    renderDashboard();
  }
}

async function fetchGoogleSheetData(url, showAlert = false) {
  try {
    let fetchUrl = url;
    if (url.includes('/edit')) {
      fetchUrl = url.split('/edit')[0] + '/export?format=csv';
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    parseAndApplyCSV(csv);
    if (showAlert) alert('Successfully connected live Google Sheet!');
  } catch (err) {
    console.error('Google Sheet fetch error:', err);
    if (showAlert) alert('Could not fetch Google Sheet. Make sure it is published to web as CSV.');
  }
}

function startSyncTicker() {
  const timerDisplay = document.getElementById('sync-timer-display');
  setInterval(() => {
    state.autoSyncTimer -= 1;
    if (state.autoSyncTimer <= 0) {
      state.autoSyncTimer = 60;
      if (state.gSheetUrl) {
        fetchGoogleSheetData(state.gSheetUrl, false);
      }
    }
    if (timerDisplay && state.gSheetUrl) {
      timerDisplay.classList.remove('hidden');
      timerDisplay.textContent = `(Auto-sync in ${state.autoSyncTimer}s)`;
    }
  }, 1000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
