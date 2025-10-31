const LINE_LENGTH = 33;
const DATE_LENGTH = 8;
const TIME_LENGTH = 4;
const ID_LENGTH = 9;
const EMPLOYEE_LENGTH = 12;

function parseDate(rawDate) {
  const day = rawDate.slice(0, 2);
  const month = rawDate.slice(2, 4);
  const year = rawDate.slice(4, 8);
  return `${year}-${month}-${day}`;
}

function parseTime(rawTime) {
  return `${rawTime.slice(0, 2)}:${rawTime.slice(2, 4)}`;
}

function parseLine(line, lineNumber = 0) {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length !== LINE_LENGTH) {
    throw new Error(
      `Linha ${lineNumber} inválida: esperado ${LINE_LENGTH} caracteres, recebido ${trimmed.length}`
    );
  }

  const punchId = trimmed.slice(0, ID_LENGTH);
  const rawDate = trimmed.slice(ID_LENGTH, ID_LENGTH + DATE_LENGTH);
  const rawTime = trimmed.slice(ID_LENGTH + DATE_LENGTH, ID_LENGTH + DATE_LENGTH + TIME_LENGTH);
  const employeeId = trimmed.slice(
    ID_LENGTH + DATE_LENGTH + TIME_LENGTH,
    ID_LENGTH + DATE_LENGTH + TIME_LENGTH + EMPLOYEE_LENGTH
  );

  const date = parseDate(rawDate);
  const time = parseTime(rawTime);

  return {
    punchId,
    employeeId,
    date,
    time,
    timestamp: `${date}T${time}:00`
  };
}

module.exports = {
  parseLine,
  parseDate,
  parseTime,
  LINE_LENGTH
};
