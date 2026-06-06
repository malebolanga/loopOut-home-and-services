// script.js – core logic for the Premium API Log Dashboard

// Utility: debounce for input events
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const tableBody = document.querySelector('#logTable tbody');
const searchBox = document.getElementById('searchBox');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const exportBtn = document.getElementById('exportBtn');
const themeToggle = document.getElementById('themeToggle');

let logs = [];
let filteredLogs = [];
let sortState = { key: null, asc: true };

// Load logs (static JSON file). Adjust path if you host via live API.
async function loadLogs() {
  try {
    const resp = await fetch('logs.json');
    const data = await resp.json();
    // Expect each log entry to have: method, endpoint, status, duration, timestamp
    logs = data.map(item => ({
      method: item.method || 'GET',
      endpoint: item.endpoint || '',
      status: item.status || 200,
      duration: item.duration || 0,
      timestamp: new Date(item.timestamp) // keep as Date
    }));
    applyFilters();
  } catch (e) {
    console.error('Failed to load logs.json', e);
    // Show placeholder row
    tableBody.innerHTML = '<tr><td colspan="5" class="placeholder">Unable to load logs.</td></tr>';
  }
}

function renderTable(data) {
  const rows = data.map(log => {
    const timeStr = log.timestamp.toLocaleString();
    return `<tr>
      <td>${log.method}</td>
      <td>${log.endpoint}</td>
      <td>${log.status}</td>
      <td>${log.duration}</td>
      <td>${timeStr}</td>
    </tr>`;
  }).join('');
  tableBody.innerHTML = rows || '<tr><td colspan="5" class="placeholder">No logs match the criteria.</td></tr>';
}

function applyFilters() {
  const query = searchBox.value.trim().toLowerCase();
  const start = startDate.value ? new Date(startDate.value) : null;
  const end = endDate.value ? new Date(endDate.value) : null;

  filteredLogs = logs.filter(l => {
    const matchesSearch = !query || [l.method, l.endpoint, String(l.status)].some(v => v.toLowerCase().includes(query));
    const withinStart = !start || l.timestamp >= start;
    const withinEnd = !end || l.timestamp <= end;
    return matchesSearch && withinStart && withinEnd;
  });

  // Apply sorting if any
  if (sortState.key) {
    const key = sortState.key;
    filteredLogs.sort((a, b) => {
      let vA = a[key];
      let vB = b[key];
      // For dates compare numeric timestamps
      if (vA instanceof Date) vA = vA.getTime();
      if (vB instanceof Date) vB = vB.getTime();
      if (vA < vB) return sortState.asc ? -1 : 1;
      if (vA > vB) return sortState.asc ? 1 : -1;
      return 0;
    });
  }

  renderTable(filteredLogs);
}

// Sorting handler – click on th elements
function setupSorting() {
  const headers = document.querySelectorAll('#logTable th');
  headers.forEach(th => {
    const key = th.dataset.key;
    if (!key) return;
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      if (sortState.key === key) {
        sortState.asc = !sortState.asc; // toggle direction
      } else {
        sortState.key = key;
        sortState.asc = true;
      }
      // Update UI indication (simple arrow)
      headers.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
      th.classList.add(sortState.asc ? 'sorted-asc' : 'sorted-desc');
      applyFilters();
    });
  });
}

// CSV export
function exportCSV() {
  const header = ['Method', 'Endpoint', 'Status', 'Duration (ms)', 'Timestamp'];
  const rows = filteredLogs.map(l => [
    l.method,
    l.endpoint,
    l.status,
    l.duration,
    l.timestamp.toISOString()
  ].join(','));
  const csvContent = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'api_logs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Theme toggle – uses data-theme attribute for CSS variables
function applyTheme(isDark) {
  const theme = isDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  // Persist preference
  localStorage.setItem("prefers-dark", isDark ? "1" : "0");
}

function initTheme() {
  const saved = localStorage.getItem("prefers-dark");
  const prefersDark = saved ? saved === "1" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  themeToggle.checked = prefersDark;
  applyTheme(prefersDark);
}
  const prefersDark = saved ? saved === '1' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeToggle.checked = prefersDark;
  applyTheme(prefersDark);
}

themeToggle.addEventListener('change', e => applyTheme(e.target.checked));
searchBox.addEventListener('input', debounce(applyFilters, 300));
startDate.addEventListener('change', applyFilters);
endDate.addEventListener('change', applyFilters);
exportBtn.addEventListener('click', exportCSV);

// Initialize
initTheme();
setupSorting();
loadLogs();
