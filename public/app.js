const totalPunchesEl = document.getElementById('total-punches');
const totalEmployeesEl = document.getElementById('total-employees');
const avgPerEmployeeEl = document.getElementById('avg-per-employee');
const periodEl = document.getElementById('period');
const lastImportEl = document.getElementById('last-import');
const employeesTable = document.getElementById('employees-table');
const recentTable = document.getElementById('recent-table');
const importForm = document.getElementById('import-form');
const importFileInput = document.getElementById('import-file');
const importContentInput = document.getElementById('import-content');
const importFeedback = document.getElementById('import-feedback');
const manualForm = document.getElementById('manual-form');
const manualFeedback = document.getElementById('manual-feedback');
const refreshButton = document.getElementById('refresh-dashboard');
const manualDateInput = document.getElementById('manual-date');
const manualTimeInput = document.getElementById('manual-time');

let timelineChart;

function formatDate(date) {
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(time) {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || 'Não foi possível completar a operação.';
    throw new Error(message);
  }

  return data;
}

function setFeedback(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('status-success', 'status-error');
  if (type === 'success') {
    element.classList.add('status-success');
  } else if (type === 'error') {
    element.classList.add('status-error');
  }
}

function renderSummary(data) {
  totalPunchesEl.textContent = data.totals.punches;
  totalEmployeesEl.textContent = data.totals.employees;
  avgPerEmployeeEl.textContent = data.totals.averagePunchesPerEmployee;

  const { start, end } = data.totals.period;
  if (!start && !end) {
    periodEl.textContent = '-';
  } else if (start === end) {
    periodEl.textContent = formatDate(start);
  } else {
    periodEl.textContent = `${formatDate(start)} até ${formatDate(end)}`;
  }

  const { lastImport } = data.meta;
  lastImportEl.textContent = lastImport
    ? `Última importação: ${formatDateTime(lastImport)}`
    : 'Última importação: -';
}

function renderEmployees(employees) {
  employeesTable.innerHTML = '';

  if (!employees.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'Nenhuma batida registrada até o momento.';
    employeesTable.appendChild(row);
    row.appendChild(cell);
    return;
  }

  employees.forEach((employee) => {
    const row = document.createElement('tr');
    const firstPunch = formatDateTime(employee.firstPunch);
    const lastPunch = formatDateTime(employee.lastPunch);

    row.innerHTML = `
      <td>${employee.employeeId}</td>
      <td>${employee.totalPunches}</td>
      <td>${firstPunch}</td>
      <td>${lastPunch}</td>
    `;

    const detailCell = document.createElement('td');
    const details = document.createElement('details');
    details.classList.add('day-details');

    const summary = document.createElement('summary');
    summary.textContent = `${employee.days.length} dia(s)`;
    details.appendChild(summary);

    const list = document.createElement('ul');
    employee.days.forEach((day) => {
      const item = document.createElement('li');
      item.textContent = `${formatDate(day.date)} • ${day.times.join(', ')}`;
      list.appendChild(item);
    });

    details.appendChild(list);
    detailCell.appendChild(details);
    row.appendChild(detailCell);
    employeesTable.appendChild(row);
  });
}

function renderRecentPunches(punches) {
  recentTable.innerHTML = '';

  if (!punches.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'Nenhuma batida registrada até o momento.';
    row.appendChild(cell);
    recentTable.appendChild(row);
    return;
  }

  punches.forEach((punch) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(punch.date)}</td>
      <td>${formatTime(punch.time)}</td>
      <td>${punch.employeeId}</td>
      <td>${punch.punchId}</td>
    `;
    recentTable.appendChild(row);
  });
}

function renderTimeline(timeline) {
  const ctx = document.getElementById('timeline-chart').getContext('2d');
  const labels = timeline.map((item) => formatDate(item.date));
  const punchesData = timeline.map((item) => item.totalPunches);
  const employeesData = timeline.map((item) => item.totalEmployees);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Batidas por dia',
        data: punchesData,
        fill: false,
        borderColor: 'rgba(56, 189, 248, 1)',
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Colaboradores ativos',
        data: employeesData,
        fill: false,
        borderColor: 'rgba(52, 211, 153, 1)',
        backgroundColor: 'rgba(52, 211, 153, 0.25)',
        tension: 0.35,
        borderDash: [6, 6],
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0'
        }
      },
      tooltip: {
        callbacks: {
          title: (items) => items.map((item) => `Dia ${item.label}`),
          label: (item) => `${item.dataset.label}: ${item.formattedValue}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)'
        }
      }
    }
  };

  if (!timelineChart) {
    timelineChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  } else {
    timelineChart.data = chartData;
    timelineChart.options = chartOptions;
    timelineChart.update();
  }
}

function updateDashboardUI(data) {
  renderSummary(data);
  renderEmployees(data.employees);
  renderRecentPunches(data.recentPunches);
  renderTimeline(data.timeline);
}

async function loadDashboard() {
  try {
    const data = await fetchJson('/api/dashboard');
    updateDashboardUI(data);
  } catch (error) {
    setFeedback(importFeedback, error.message, 'error');
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'));
    reader.readAsText(file, 'utf-8');
  });
}

async function handleImport(event) {
  event.preventDefault();
  setFeedback(importFeedback, 'Processando importação...');

  try {
    let content = importContentInput.value.trim();
    const file = importFileInput.files?.[0];
    if (file) {
      content = await readFileAsText(file);
    }

    if (!content) {
      throw new Error('Selecione um arquivo ou cole o conteúdo das batidas.');
    }

    const response = await fetchJson('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    setFeedback(
      importFeedback,
      `Importação concluída: ${response.importResult.inserted} novas batidas adicionadas (${response.importResult.duplicates} duplicadas).`,
      'success'
    );

    importForm.reset();
    updateDashboardUI(response.dashboard);
  } catch (error) {
    setFeedback(importFeedback, error.message, 'error');
  }
}

async function handleManualSubmit(event) {
  event.preventDefault();
  setFeedback(manualFeedback, 'Enviando batida...');

  const formData = new FormData(manualForm);
  const payload = Object.fromEntries(formData.entries());

  payload.employeeId = payload.employeeId.trim();
  payload.date = payload.date.trim();
  payload.time = payload.time.trim();
  payload.punchId = payload.punchId.trim();

  if (!payload.employeeId || !payload.date || !payload.time) {
    setFeedback(manualFeedback, 'Preencha todos os campos obrigatórios.', 'error');
    return;
  }

  try {
    const response = await fetchJson('/api/punches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setFeedback(
      manualFeedback,
      `Batida registrada para ${response.punch.employeeId} às ${formatTime(response.punch.time)}.`,
      'success'
    );

    manualForm.reset();
    setDefaultDateTime();
    updateDashboardUI(response.dashboard);
  } catch (error) {
    setFeedback(manualFeedback, error.message, 'error');
  }
}

function setDefaultDateTime() {
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  manualDateInput.value = isoDate;
  manualTimeInput.value = `${hours}:${minutes}`;
}

refreshButton.addEventListener('click', loadDashboard);
importForm.addEventListener('submit', handleImport);
manualForm.addEventListener('submit', handleManualSubmit);

setDefaultDateTime();
loadDashboard();
