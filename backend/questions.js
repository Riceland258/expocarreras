const fs = require('fs');
const path = require('path');

function parseQuestions() {
  const questionsFile = path.join(__dirname, 'questions.json');
  const data = fs.readFileSync(questionsFile, 'utf8');
  return JSON.parse(data);
}

module.exports = parseQuestions;
