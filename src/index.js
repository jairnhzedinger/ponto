#!/usr/bin/env node
const { loadPunches } = require('./fileProcessor');
const { generateReport } = require('./report');

function printUsage() {
  console.log('Uso: npm start -- <caminho-do-arquivo>');
}

function main() {
  const [, , ...args] = process.argv;
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const filePath = args[0];

  try {
    const punches = loadPunches(filePath);
    if (!punches.length) {
      console.log('Nenhuma batida encontrada no arquivo.');
      return;
    }

    const report = generateReport(punches);
    console.log(report);
  } catch (error) {
    console.error(`Erro ao processar arquivo: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
