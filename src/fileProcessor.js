const fs = require('fs');
const path = require('path');
const { parseLine } = require('./parser');

function loadPunches(filePath) {
  const resolvedPath = path.resolve(filePath);
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const lines = content.split(/\r?\n/);

  const punches = [];
  lines.forEach((line, index) => {
    const parsed = parseLine(line, index + 1);
    if (parsed) {
      punches.push(parsed);
    }
  });

  return punches;
}

module.exports = {
  loadPunches
};
