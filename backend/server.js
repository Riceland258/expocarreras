const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PYR_PATH = path.join(__dirname, 'pyr.txt');
const WINNERS_PATH = path.join(__dirname, 'winners.json');

function loadQuestions() {
  let raw = fs.readFileSync(PYR_PATH, 'utf8');
  // strip triple-backticks wrapper if present
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```[\s\S]*?\n/, '');
    raw = raw.replace(/\n```$/, '');
  }

  const regex = /(\d+)\.\s*([\s\S]*?)(?=\n\s*\n\d+\.|$)/g;
  const questions = [];
  let m;
  while ((m = regex.exec(raw)) !== null) {
    const id = parseInt(m[1], 10);
    const block = m[2].trim();
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    const questionLine = lines[0].replace(/^\d+\.\s*/,'');
    const opts = [];
    let correctIndex = null;
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i];
      let starred = false;
      if (line.startsWith('*')) { starred = true; line = line.slice(1).trim(); }
      // Option like "A. Texto"
      const optMatch = /^[A-D]\.\s*(.*)$/.exec(line);
      const text = optMatch ? optMatch[1].trim() : line;
      opts.push(text);
      if (starred) correctIndex = opts.length - 1;
    }
    // If no starred option found, try to detect by leading * in option letter like "*B."
    if (correctIndex === null) {
      for (let i = 1; i < lines.length; i++) {
        if (/^\*[A-D]\.\s*/.test(lines[i])) {
          correctIndex = i-1;
          break;
        }
      }
    }
    questions.push({ id, question: questionLine, options: opts, correctIndex });
  }
  return questions;
}

const QUESTIONS = loadQuestions();

function readWinners() {
  try {
    const raw = fs.readFileSync(WINNERS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeWinners(list) {
  fs.writeFileSync(WINNERS_PATH, JSON.stringify(list, null, 2), 'utf8');
}

app.get('/question', (req, res) => {
  const idx = Math.floor(Math.random() * QUESTIONS.length);
  const q = QUESTIONS[idx];
  // send without correctIndex
  res.json({ id: q.id, question: q.question, options: q.options });
});

app.post('/answer', (req, res) => {
  const { id, choice } = req.body;
  const q = QUESTIONS.find(x => x.id === id);
  if (!q) return res.status(400).json({ error: 'Pregunta no encontrada' });
  const correct = q.correctIndex === choice;
  res.json({ correct, correctIndex: q.correctIndex });
});

app.get('/winners', (req, res) => {
  const list = readWinners();
  res.json(list);
});

app.post('/winners', (req, res) => {
  const { firstName, lastName, questionId } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: 'Nombre y apellido requeridos' });
  const list = readWinners();
  const entry = { id: Date.now(), firstName, lastName, questionId, createdAt: new Date().toISOString() };
  list.push(entry);
  writeWinners(list);
  res.json({ ok: true, entry });
});

app.post('/raffle', (req, res) => {
  const list = readWinners();
  if (!list.length) return res.status(400).json({ error: 'No hay participantes' });
  const idx = Math.floor(Math.random() * list.length);
  const winner = list[idx];
  res.json({ winner });
});

// Serve frontend static files from root/frontend
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
