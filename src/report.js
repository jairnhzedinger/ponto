function groupByEmployee(punches) {
  const employees = new Map();
  punches.forEach((punch) => {
    if (!employees.has(punch.employeeId)) {
      employees.set(punch.employeeId, []);
    }
    employees.get(punch.employeeId).push(punch);
  });

  employees.forEach((list) => {
    list.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  });

  return employees;
}

function groupByDate(punches) {
  const dates = new Map();
  punches.forEach((punch) => {
    if (!dates.has(punch.date)) {
      dates.set(punch.date, []);
    }
    dates.get(punch.date).push(punch);
  });
  dates.forEach((list) => {
    list.sort((a, b) => (a.time < b.time ? -1 : 1));
  });
  return dates;
}

function generateReport(punches) {
  const employees = groupByEmployee(punches);
  const lines = [];

  employees.forEach((employeePunches, employeeId) => {
    lines.push(`Funcionário ${employeeId}`);
    const dates = groupByDate(employeePunches);
    dates.forEach((datePunches, date) => {
      const times = datePunches.map((punch) => punch.time).join(', ');
      lines.push(`  ${date}: ${times}`);
    });
    lines.push('');
  });

  return lines.join('\n').trim();
}

module.exports = {
  groupByEmployee,
  groupByDate,
  generateReport
};
