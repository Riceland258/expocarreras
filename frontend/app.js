const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const API_BASE = (window && window.API_BASE) ? window.API_BASE.replace(/\/$/, '') : '';
document.addEventListener('DOMContentLoaded', () => {
  const mobileScreen = document.getElementById('mobile-screen');
  const pcScreen = document.getElementById('pc-screen');
  if (isMobile) {
    pcScreen.style.display = 'none';
  } else {
    mobileScreen.style.display = 'none';
  }

  // Mobile elements
  const playBtn = document.getElementById('play-btn');
  const questionArea = document.getElementById('question-area');
  const qText = document.getElementById('q-text');
  const optionsEl = document.getElementById('options');
  const resultEl = document.getElementById('result');
  const nameForm = document.getElementById('name-form');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const submitName = document.getElementById('submit-name');

  let currentQuestion = null;
  let answered = false;

  playBtn.addEventListener('click', async () => {
    playBtn.disabled = true;
  const res = await fetch(API_BASE + '/question');
    const q = await res.json();
    currentQuestion = q;
    answered = false;
    renderQuestion(q);
    questionArea.classList.remove('hidden');
  });

  function renderQuestion(q) {
    qText.textContent = q.question;
    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const b = document.createElement('div');
      b.className = 'opt';
      b.textContent = `${String.fromCharCode(65+i)}. ${opt}`;
      b.addEventListener('click', () => onChoose(i, b));
      optionsEl.appendChild(b);
    });
    resultEl.classList.add('hidden');
    nameForm.classList.add('hidden');
  }

  async function onChoose(i, el) {
    if (answered) return;
    answered = true;
  const res = await fetch(API_BASE + '/answer', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: currentQuestion.id, choice: i }) });
    const data = await res.json();
    const correctIndex = data.correctIndex;
    if (data.correct) {
      el.classList.add('correct');
      resultEl.textContent = '¡Correcto! Completá tu nombre y apellido para participar en el sorteo.';
      nameForm.classList.remove('hidden');
    } else {
      el.classList.add('wrong');
      // highlight correct
      const correctEl = optionsEl.children[correctIndex];
      if (correctEl) correctEl.classList.add('correct');
      resultEl.textContent = `Buen intento. La respuesta correcta es ${String.fromCharCode(65+correctIndex)}.`;
      nameForm.classList.add('hidden');
    }
    resultEl.classList.remove('hidden');
  }

  submitName.addEventListener('click', async () => {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    if (!firstName || !lastName) return alert('Ingrese nombre y apellido');
  const res = await fetch(API_BASE + '/winners', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ firstName, lastName, questionId: currentQuestion.id }) });
    const data = await res.json();
    if (data.ok) {
      resultEl.textContent = '¡Listo! Tu participación fue registrada.';
      nameForm.classList.add('hidden');
    }
  });

  // PC elements
  const refreshW = document.getElementById('refresh-winners');
  const raffleBtn = document.getElementById('raffle-btn');
  const winnersList = document.getElementById('winners-list');
  const raffleResult = document.getElementById('raffle-result');

  async function loadWinners() {
  const res = await fetch(API_BASE + '/winners');
    const list = await res.json();
    winnersList.innerHTML = '';
    list.forEach(w => {
      const li = document.createElement('li');
      li.textContent = `${w.firstName} ${w.lastName} (Pregunta ${w.questionId})`;
      winnersList.appendChild(li);
    });
  }

  refreshW.addEventListener('click', loadWinners);
  raffleBtn.addEventListener('click', async () => {
  const res = await fetch(API_BASE + '/raffle', { method: 'POST' });
    const data = await res.json();
    if (data.error) {
      raffleResult.textContent = data.error;
    } else {
      const w = data.winner;
      raffleResult.textContent = `Ganador: ${w.firstName} ${w.lastName}`;
    }
  });

  if (!isMobile) loadWinners();
});
