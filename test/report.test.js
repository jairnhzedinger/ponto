const test = require('node:test');
const assert = require('node:assert');

const { generateReport } = require('../src/report');

const SAMPLE_PUNCHES = [
  {
    punchId: '000000001',
    employeeId: '000000000001',
    date: '2025-10-28',
    time: '08:00',
    timestamp: '2025-10-28T08:00:00'
  },
  {
    punchId: '000000002',
    employeeId: '000000000001',
    date: '2025-10-28',
    time: '12:00',
    timestamp: '2025-10-28T12:00:00'
  },
  {
    punchId: '000000003',
    employeeId: '000000000001',
    date: '2025-10-29',
    time: '09:00',
    timestamp: '2025-10-29T09:00:00'
  },
  {
    punchId: '000000004',
    employeeId: '000000000002',
    date: '2025-10-28',
    time: '10:00',
    timestamp: '2025-10-28T10:00:00'
  }
];

test('generateReport agrupa batidas por funcionário e data', () => {
  const report = generateReport(SAMPLE_PUNCHES);
  assert.match(report, /Funcionário 000000000001/);
  assert.match(report, /2025-10-28: 08:00, 12:00/);
  assert.match(report, /2025-10-29: 09:00/);
  assert.match(report, /Funcionário 000000000002/);
  assert.match(report, /2025-10-28: 10:00/);
});
