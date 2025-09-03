const fs = require('fs');
const path = require('path');

const questionsFile = path.join(__dirname, '.', 'pyr.txt');

function parseQuestions() {
  const data = fs.readFileSync(questionsFile, 'utf8');
  const lines = data.split('\n').filter(line => line.trim() !== '');
  const questions = [];
  let currentQuestion = null;

  for (let line of lines) {
    if (/^\d+\./.test(line)) {
      if (currentQuestion) questions.push(currentQuestion);
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      currentQuestion = {
        id: parseInt(match[1]),
        question: match[2],
        options: [],
        correct: null
      };
    } else if (/^[A-D]\./.test(line)) {
      const match = line.match(/^([A-D])\.\s*(.+)$/);
      const option = match[2];
      const isCorrect = option.startsWith('*');
      if (isCorrect) {
        currentQuestion.correct = match[1];
        currentQuestion.options.push(option.substring(1));
      } else {
        currentQuestion.options.push(option);
      }
    }
  }
  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}

module.exports = parseQuestions;
