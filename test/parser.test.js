const test = require('node:test');
const assert = require('node:assert');

const { parseLine, LINE_LENGTH } = require('../src/parser');

test('parseLine converte linha em objeto estruturado', () => {
  const line = '000030349281020251305000018933400';
  const result = parseLine(line, 1);
  assert.strictEqual(result.punchId, '000030349');
  assert.strictEqual(result.employeeId, '000018933400');
  assert.strictEqual(result.date, '2025-10-28');
  assert.strictEqual(result.time, '13:05');
  assert.strictEqual(result.timestamp, '2025-10-28T13:05:00');
});

test('parseLine ignora linhas em branco', () => {
  const result = parseLine('   ');
  assert.strictEqual(result, null);
});

test('parseLine lança erro para linhas com tamanho incorreto', () => {
  const shorterLine = '123';
  assert.throws(
    () => parseLine(shorterLine, 2),
    new RegExp(`${LINE_LENGTH}`)
  );
});
