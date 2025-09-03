const API_BASE = 'http://localhost:3000'; // Cambiar a la URL de Render cuando se despliegue

document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 768) {
    // Mobile view
    const playBtn = document.getElementById('play-btn');
    const questionContainer = document.getElementById('question-container');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const resultEl = document.getElementById('result');
    const saveForm = document.getElementById('save-form');
    const saveBtn = document.getElementById('save-btn');

    let currentQuestion = null;

    playBtn.addEventListener('click', async () => {
      const response = await fetch(`${API_BASE}/questions`);
      const data = await response.json();
      currentQuestion = data;
      questionEl.textContent = data.question;
      optionsEl.innerHTML = '';
      data.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        btn.addEventListener('click', () => checkAnswer(String.fromCharCode(65 + index)));
        optionsEl.appendChild(btn);
      });
      questionContainer.style.display = 'block';
      playBtn.style.display = 'none';
    });

    function checkAnswer(selected) {
      if (selected === currentQuestion.correct) {
        resultEl.textContent = '¡Correcto!';
        saveForm.style.display = 'block';
      } else {
        resultEl.textContent = `Buen intento. La respuesta correcta es ${currentQuestion.correct}.`;
      }
      resultEl.style.display = 'block';
      optionsEl.style.display = 'none';
    }

    saveBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value;
      const surname = document.getElementById('surname').value;
      if (name && surname) {
        await fetch(`${API_BASE}/save-winner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, surname })
        });
        // Ocultar el form y mostrar mensaje de éxito
        saveForm.style.display = 'none';
        const successEl = document.getElementById('success-message');
        successEl.textContent = '¡Te has registrado al sorteo!';
        successEl.style.display = 'block';
        successEl.style.fontSize = '18px';
        successEl.style.fontWeight = 'bold';
        successEl.style.marginTop = '20px';
      }
    });
  } else {
    // Desktop view
    const winnersList = document.getElementById('winners-list');
    const raffleBtn = document.getElementById('raffle-btn');
    const raffleResult = document.getElementById('raffle-result');

    async function loadWinners() {
      const response = await fetch(`${API_BASE}/winners`);
      const winners = await response.json();
      winnersList.innerHTML = '';
      winners.forEach(winner => {
        const li = document.createElement('li');
        li.textContent = `${winner.name} ${winner.surname}`;
        winnersList.appendChild(li);
      });
    }

    loadWinners();

    raffleBtn.addEventListener('click', async () => {
      const response = await fetch(`${API_BASE}/raffle`);
      const data = await response.json();
      if (data.winner) {
        raffleResult.textContent = `Ganador del sorteo: ${data.winner.name} ${data.winner.surname}`;
      } else {
        raffleResult.textContent = 'No hay ganadores para sortear.';
      }
      raffleResult.style.display = 'block';
    });
  }
});
