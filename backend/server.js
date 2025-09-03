const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const parseQuestions = require('./questions');

const app = express();
app.use(cors());
app.use(express.json());

const questions = parseQuestions();
const winnersFile = path.join(__dirname, 'winners.json');

// Initialize winners file if not exists
if (!fs.existsSync(winnersFile)) {
  fs.writeFileSync(winnersFile, JSON.stringify([]));
}

// GET /questions - return a random question
app.get('/questions', (req, res) => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];
  res.json({
    id: question.id,
    question: question.question,
    options: question.options,
    correct: question.correct
  });
});

// POST /save-winner - save name and surname
app.post('/save-winner', (req, res) => {
  const { name, surname } = req.body;
  if (!name || !surname) {
    return res.status(400).json({ error: 'Name and surname required' });
  }
  const winners = JSON.parse(fs.readFileSync(winnersFile));
  winners.push({ name, surname });
  fs.writeFileSync(winnersFile, JSON.stringify(winners));
  res.json({ message: 'Winner saved' });
});

// GET /winners - return list of winners
app.get('/winners', (req, res) => {
  const winners = JSON.parse(fs.readFileSync(winnersFile));
  res.json(winners);
});

// GET /raffle - select a random winner
app.get('/raffle', (req, res) => {
  const winners = JSON.parse(fs.readFileSync(winnersFile));
  if (winners.length === 0) {
    return res.json({ winner: null });
  }
  const randomIndex = Math.floor(Math.random() * winners.length);
  res.json({ winner: winners[randomIndex] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
