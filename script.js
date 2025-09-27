document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.getElementById('game-board');
  let selectedCards = [];
  let isChecking = false;
  let score = 0;
  let countdownTime = 240;
  let countdownInterval;
  let selectedTheme = 'animaux';
  let selectedMode = 'solo';
  let currentPlayer = 1;
  let playerScores = { 1: 0, 2: 0 };
  let currentLevel = 1;
  let isOrdiTurn = false;
  let zoomEnabled = false;
  let muted = false;

  const successSound = new Audio('musique/succes.mp3');
  const failSound = new Audio('musique/fail.mp3');

  const themes = {
    animaux: [
      'images/chien.png', 'images/chat.png', 'images/lion.png', 'images/tigre.png',
      'images/ours.png', 'images/lapin.png', 'images/éléphant.png', 'images/zèbre.png',
      'images/koala.png', 'images/panda.png', 'images/renard.png', 'images/singe.png',
      'images/poisson.png', 'images/oiseau.png', 'images/écureuil.png', 'images/crocodile.png',
      'images/kangourou.png', 'images/mouton.png', 'images/vache.png', 'images/cheval.png'
    ],
    fruits: [
      'images/pomme.png', 'images/banane.png', 'images/fraise.png', 'images/raisin.png',
      'images/orange.png', 'images/kiwi.png', 'images/cerise.png', 'images/ananas.png',
      'images/poire.png', 'images/pêche.png', 'images/framboise.png', 'images/myrtille.png',
      'images/citron.png', 'images/pastèque.png', 'images/mangue.png', 'images/figue.png',
      'images/noix.png', 'images/cassis.png', 'images/groseille.png', 'images/carambole.png'
    ]
  };

  document.getElementById('start-button').addEventListener('click', () => {
    resetGame();
  });

  function shuffleArray(array) {
    return array.slice().sort(() => Math.random() - 0.5);
  }

  function duplicateArray(array) {
    return array.concat(array);
  }

  function createCard(imagePath) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = imagePath;

    const content = document.createElement('img');
    content.src = imagePath;
    content.classList.add('card-content');

    card.appendChild(content);
    card.addEventListener('click', onCardClick);
    return card;
  }

  function updateCountdown() {
    const minutes = String(Math.floor(countdownTime / 60)).padStart(2, '0');
    const seconds = String(countdownTime % 60).padStart(2, '0');
    document.getElementById('countdown').textContent = `Temps restant : ${minutes}:${seconds}`;
  }

  function startCountdown() {
    clearInterval(countdownInterval);
    updateCountdown();
    countdownInterval = setInterval(() => {
      countdownTime--;
      updateCountdown();
      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        alert("⏰ Temps écoulé !");
      }
    }, 1000);
  }

  function updatePlayerTurn() {
    const turnDisplay = document.getElementById('player-turn');
    if (selectedMode === '2joueurs' || selectedMode === 'vsordi') {
      turnDisplay.style.display = 'block';
      turnDisplay.textContent = `Tour du joueur ${currentPlayer}`;
    } else {
      turnDisplay.style.display = 'none';
    }
  }

  function showAllCardsTemporarily() {
    document.querySelectorAll('.card').forEach(card => card.classList.add('flip'));
    setTimeout(() => {
      document.querySelectorAll('.card').forEach(card => card.classList.remove('flip'));
    }, 3000);
  }

  function onCardClick(e) {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains("flip") || isChecking || isOrdiTurn) return;
    card.classList.add("flip");
    selectedCards.push(card);

    if (selectedCards.length === 2) {
      isChecking = true;
      setTimeout(checkPair, 1000);
    }
  }

  function checkPair() {
    const [card1, card2] = selectedCards;
    if (card1.dataset.value === card2.dataset.value) {
      card1.classList.add("matched");
      card2.classList.add("matched");
      card1.removeEventListener('click', onCardClick);
      card2.removeEventListener('click', onCardClick);
      score++;
      if (!muted) successSound.play();
      if (selectedMode === '2joueurs' || selectedMode === 'vsordi') playerScores[currentPlayer]++;

      if (document.querySelectorAll('.card:not(.matched)').length === 0) {
        clearInterval(countdownInterval);
        saveScore(score * 100 + countdownTime, selectedTheme, currentLevel);
        alert(`Bravo ! Niveau ${currentLevel} terminé.`);
        currentLevel++;
        resetGame();
        return;
      }
    } else {
      if (!muted) failSound.play();
      countdownTime = Math.max(0, countdownTime - 5);
      updateCountdown();
      card1.classList.remove("flip");
      card2.classList.remove("flip");
      if (selectedMode === '2joueurs' || selectedMode === 'vsordi') {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerTurn();
      }
    }

    selectedCards = [];
    isChecking = false;

    if (selectedMode === 'vsordi' && currentPlayer === 2) {
      isOrdiTurn = true;
      setTimeout(playOrdiTurn, 1000);
    }
  }

  function playOrdiTurn() {
    const availableCards = Array.from(document.querySelectorAll('.card:not(.flip):not(.matched)'));
    if (availableCards.length < 2) return;

    const [card1, card2] = shuffleArray(availableCards).slice(0, 2);
    card1.classList.add("flip");
    selectedCards.push(card1);

    setTimeout(() => {
      card2.classList.add("flip");
      selectedCards.push(card2);
      setTimeout(checkPair, 1000);
      isOrdiTurn = false;
    }, 500);
  }
  function getLevelSettings(level) {
    return {
      pairCount: parseInt(document.getElementById('pair-count').value),
      timeLimit: Math.max(60, 240 - level * 10)
    };
  }

  function resetGame(customTime = null) {
    gameBoard.innerHTML = '';
    selectedCards = [];
    isChecking = false;
    score = 0;
    currentPlayer = 1;
    playerScores = { 1: 0, 2: 0 };
    updatePlayerTurn();

    const settings = getLevelSettings(currentLevel);
    countdownTime = customTime !== null ? customTime : settings.timeLimit;

    const totalCards = settings.pairCount * 2;
    let columns = 4;
    if (totalCards === 16) columns = 4;
    else if (totalCards === 24) columns = 4;
    else if (totalCards === 30) columns = 5;
    else if (totalCards === 40) columns = 5;
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gameBoard.style.gap = totalCards >= 30 ? '4px' : '6px';

    const selectedImages = shuffleArray(themes[selectedTheme]).slice(0, settings.pairCount);
    const allCards = shuffleArray(duplicateArray(selectedImages));
    allCards.forEach(card => {
      const cardHtml = createCard(card);
      cardHtml.style.animation = 'appear 0.4s ease';
      gameBoard.appendChild(cardHtml);
    });

    startCountdown();

    if (selectedMode === 'memoire') {
      showAllCardsTemporarily();
    }

    if (selectedMode === 'vsordi' && currentPlayer === 2) {
      isOrdiTurn = true;
      setTimeout(playOrdiTurn, 1000);
    }
  }

  function saveScore(score, theme, level) {
    const scores = JSON.parse(localStorage.getItem("memoryScores") || "[]");
    scores.push({ score, theme, level, date: new Date().toLocaleDateString() });
    localStorage.setItem("memoryScores", JSON.stringify(scores));
  }

  function showTopScores() {
    const scores = JSON.parse(localStorage.getItem("memoryScores") || "[]");
    if (scores.length === 0) return alert("Aucun score enregistré.");
    const top = scores.sort((a, b) => b.score - a.score).slice(0, 5);
    let message = "Meilleurs scores :\n";
    top.forEach((s, i) => {
      message += `#${i + 1} → ${s.score} pts - ${s.theme} - Niveau ${s.level} - ${s.date}\n`;
    });
    alert(message);
  }

  // Sélecteurs
  document.getElementById('theme-selector').addEventListener('change', (e) => {
    selectedTheme = e.target.value;
    resetGame();
  });

  document.getElementById('mode-selector').addEventListener('change', (e) => {
    selectedMode = e.target.value;
    resetGame();
  });

  document.getElementById('pair-count').addEventListener('change', () => {
    currentLevel = 1;
    resetGame();
  });

  // Bouton Mode Rapide
  document.getElementById('fast-mode').addEventListener('click', (e) => {
    resetGame(60); // Mode rapide = 60 secondes
    e.target.classList.add('active');
    setTimeout(() => e.target.classList.remove('active'), 1000);
  });

  // Bouton Rejouer
  document.getElementById('replay-button').addEventListener('click', () => {
    currentLevel = 1;
    resetGame();
  });

  // Bouton Zoom
  document.getElementById('zoom-toggle').addEventListener('click', (e) => {
    zoomEnabled = !zoomEnabled;
    document.body.classList.toggle('zoom-mode', zoomEnabled);
    e.target.classList.toggle('active', zoomEnabled);
  });

  // Bouton Son ON/OFF
  document.getElementById('mute-button').addEventListener('click', (e) => {
    muted = !muted;
    e.target.classList.toggle('active', muted);
  });

  // Bouton Scores
  document.getElementById('show-scores').addEventListener('click', showTopScores);
});
