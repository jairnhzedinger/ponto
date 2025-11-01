const { readDatabase, writeDatabase } = require('../storage/jsonStore');
const { parseContent } = require('../fileProcessor');

function normalizePunch(punch) {
  if (!punch) {
    throw new Error('Registro de ponto inválido.');
  }

  const employeeId = String(punch.employeeId ?? '').trim();
  const date = String(punch.date ?? '').trim();
  const time = String(punch.time ?? '').trim();
  const punchId = String(punch.punchId ?? '').trim();

  if (!employeeId) {
    throw new Error('O campo "employeeId" é obrigatório.');
  }

  if (!/\d{4}-\d{2}-\d{2}/.test(date)) {
    throw new Error('O campo "date" deve estar no formato ISO (YYYY-MM-DD).');
  }

  if (!/\d{2}:\d{2}/.test(time)) {
    throw new Error('O campo "time" deve estar no formato HH:MM.');
  }

  const timestamp = `${date}T${time}:00`;

  return {
    employeeId,
    date,
    time,
    punchId,
    timestamp
  };
}

function generatePunchId(existingIds = new Set()) {
  let attempt = 0;
  while (attempt < 5) {
    const base = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const candidate = (base + random).slice(-9);
    if (!existingIds.has(candidate)) {
      return candidate;
    }
    attempt += 1;
  }
  return `${Date.now()}`.slice(-9).padStart(9, '0');
}

function importPunches(punches) {
  const database = readDatabase();
  const existingIds = new Set(database.punches.map((p) => p.punchId));

  const normalized = punches.map((punch) => {
    const candidate = normalizePunch(punch);
    if (!candidate.punchId) {
      candidate.punchId = generatePunchId(existingIds);
    }
    return candidate;
  });

  const deduped = [];
  let duplicates = 0;

  normalized.forEach((punch) => {
    if (existingIds.has(punch.punchId)) {
      duplicates += 1;
      return;
    }
    existingIds.add(punch.punchId);
    deduped.push(punch);
  });

  const punchesToPersist = [...database.punches, ...deduped];
  punchesToPersist.sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));

  const payload = writeDatabase({
    punches: punchesToPersist,
    employees: database.employees,
    meta: {
      ...database.meta,
      lastImport: new Date().toISOString()
    }
  });

  return {
    inserted: deduped.length,
    duplicates,
    total: payload.punches.length,
    punches: payload.punches
  };
}

function importPunchesFromContent(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Conteúdo do arquivo inválido.');
  }
  const punches = parseContent(content);
  return importPunches(punches);
}

function addPunch(punch) {
  const database = readDatabase();
  const existingIds = new Set(database.punches.map((p) => p.punchId));
  const normalized = normalizePunch(punch);

  if (!normalized.punchId) {
    normalized.punchId = generatePunchId(existingIds);
  }

  if (existingIds.has(normalized.punchId)) {
    throw new Error(`O identificador de batida ${normalized.punchId} já está em uso.`);
  }

  const punchesToPersist = [...database.punches, normalized];
  punchesToPersist.sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));

  writeDatabase({
    punches: punchesToPersist,
    employees: database.employees,
    meta: {
      ...database.meta,
      lastImport: database.meta.lastImport ?? null
    }
  });

  return normalized;
}

function listPunches() {
  const database = readDatabase();
  return [...database.punches].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
}

function getDashboardData() {
  const database = readDatabase();
  const punches = [...database.punches];
  const employeeNames =
    database.employees && typeof database.employees === 'object'
      ? database.employees
      : {};

  punches.sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));

  const totalPunches = punches.length;
  const employeesMap = new Map();
  const datesMap = new Map();

  punches.forEach((punch) => {
    const employee = employeesMap.get(punch.employeeId) || {
      employeeId: punch.employeeId,
      totalPunches: 0,
      days: new Map(),
      firstPunch: punch.timestamp,
      lastPunch: punch.timestamp
    };

    employee.totalPunches += 1;
    employee.lastPunch = punch.timestamp;
    if (punch.timestamp < employee.firstPunch) {
      employee.firstPunch = punch.timestamp;
    }

    const dayPunches = employee.days.get(punch.date) || [];
    dayPunches.push(punch.time);
    employee.days.set(punch.date, dayPunches);
    employeesMap.set(punch.employeeId, employee);

    const dateSummary = datesMap.get(punch.date) || {
      date: punch.date,
      totalPunches: 0,
      employees: new Map()
    };

    dateSummary.totalPunches += 1;
    const employeeCount = dateSummary.employees.get(punch.employeeId) || 0;
    dateSummary.employees.set(punch.employeeId, employeeCount + 1);
    datesMap.set(punch.date, dateSummary);
  });

  const employees = Array.from(employeesMap.values()).map((employee) => ({
    employeeId: employee.employeeId,
    name: employeeNames?.[employee.employeeId] ?? null,
    totalPunches: employee.totalPunches,
    firstPunch: employee.firstPunch,
    lastPunch: employee.lastPunch,
    days: Array.from(employee.days.entries()).map(([date, times]) => ({
      date,
      times: times.sort()
    }))
  }));

  employees.sort((a, b) => b.totalPunches - a.totalPunches);

  const timeline = Array.from(datesMap.values())
    .map((item) => ({
      date: item.date,
      totalPunches: item.totalPunches,
      totalEmployees: item.employees.size
    }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const uniqueEmployees = employeesMap.size;
  const periodStart = punches[0]?.date ?? null;
  const periodEnd = punches[punches.length - 1]?.date ?? null;

  return {
    totals: {
      punches: totalPunches,
      employees: uniqueEmployees,
      averagePunchesPerEmployee: uniqueEmployees ? Number((totalPunches / uniqueEmployees).toFixed(2)) : 0,
      period: {
        start: periodStart,
        end: periodEnd
      }
    },
    employees,
    timeline,
    recentPunches: punches.slice(-10).reverse(),
    meta: {
      lastImport: database.meta.lastImport
    }
  };
}

function setEmployeeName(employeeId, name) {
  const database = readDatabase();
  const id = String(employeeId ?? '').trim();

  if (!id) {
    throw new Error('O identificador do colaborador é obrigatório.');
  }

  const employees = {
    ...(database.employees && typeof database.employees === 'object' ? database.employees : {})
  };

  const trimmedName = String(name ?? '').trim();

  if (trimmedName) {
    employees[id] = trimmedName;
  } else {
    delete employees[id];
  }

  writeDatabase({
    punches: database.punches,
    employees,
    meta: database.meta
  });

  return {
    employeeId: id,
    name: trimmedName || null
  };
}

module.exports = {
  addPunch,
  importPunches,
  importPunchesFromContent,
  listPunches,
  getDashboardData,
  setEmployeeName
};
