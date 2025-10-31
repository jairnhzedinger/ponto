const express = require('express');
const path = require('path');
const {
  listPunches,
  addPunch,
  importPunchesFromContent,
  getDashboardData
} = require('./services/punchService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/punches', (req, res) => {
  try {
    const { employeeId, date } = req.query;
    let punches = listPunches();

    if (employeeId) {
      punches = punches.filter((punch) => punch.employeeId === String(employeeId));
    }

    if (date) {
      punches = punches.filter((punch) => punch.date === String(date));
    }

    res.json({ punches });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar as batidas.' });
  }
});

app.post('/api/punches', (req, res) => {
  try {
    const punch = addPunch(req.body);
    res.status(201).json({
      message: 'Batida registrada com sucesso.',
      punch,
      dashboard: getDashboardData()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const { content } = req.body;
    const importResult = importPunchesFromContent(content);
    const dashboard = getDashboardData();

    res.json({
      message: 'Importação concluída com sucesso.',
      importResult,
      dashboard
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/dashboard', (req, res) => {
  try {
    const data = getDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar dados do painel.' });
  }
});

const publicDir = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Painel de ponto disponível em http://localhost:${PORT}`);
});
