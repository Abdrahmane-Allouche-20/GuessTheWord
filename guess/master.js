// WORDS
let word = '';
const words = {
  Footballer: ['Messi', 'Cristiano', 'Zidane', 'Maradona', 'Pele', 'Nedved', 'Cruyff', 'Mbappe', 'Neymar', 'Haaland', 'Slimani', 'Hazard'],
  fruits: ['banana', 'orange', 'kiwi', 'apple', 'melon', 'cherry', 'grapes', 'lemon', 'mango', 'peach', 'plum'],
  cars: ['audi', 'bmw', 'ferrari', 'mercedes', 'ford', 'toyota', 'volvo', 'honda', 'jeep', 'mazda', 'fiat', 'porsche'],
  hero: ['batman', 'cyborg', 'robin', 'wanda', 'flash', 'thor', 'hulk', 'vision', 'drax', 'loki', 'rocket'],
  emotions: ['angry', 'sad', 'silly', 'hopeful', 'wonder', 'hate', 'happy', 'curious', 'shame', 'pride', 'guilt', 'love', 'hope', 'faith'],
  personality: ['polite', 'gentle', 'smart', 'loyal', 'brisk', 'warm', 'charm', 'cheer', 'sweet', 'humble', 'funny'],
  animals: ['bird', 'horse', 'mouse', 'rabbit', 'sheep', 'goose', 'panda', 'tiger', 'zebra', 'llama', 'lemur', 'koala', 'giraffe', 'eagle'],
  fish: ['shark', 'orca', 'piranha', 'whale', 'lobster', 'squid', 'salmon', 'tuna', 'crab', 'octopus'],
  country: ['china', 'india', 'japan', 'spain', 'brazil', 'italy', 'egypt', 'mexico', 'poland', 'canada', 'norway'],
};

const keys = Object.keys(words);
let randomKey = keys[Math.floor(Math.random() * keys.length)];
let value = words[randomKey];
word = value[Math.floor(Math.random() * value.length)].toLowerCase();

const lostSound = document.querySelector('#lostSound');
const winSound = document.querySelector('#winSound');

// --- SCORE LOGIC ---
let score = Number(localStorage.getItem('score')) || 0;
const scoreDisplay = document.querySelector('.score');
function updateScore(points) {
  score += points;
  localStorage.setItem('score', score);
  if (scoreDisplay) scoreDisplay.textContent = score;
}
if (scoreDisplay) scoreDisplay.textContent = score;
// --- END SCORE LOGIC ---

document.querySelector('.category').textContent = randomKey;
let letter = Array.from(word);

let numberOfTries = 6;
let numberOfLetters = letter.length;
let currentTry = 1;
let numberOfHints = 3;

const guessBtn = document.querySelector('.check');
const win = document.querySelector('.win');
const lose = document.querySelector('.lose');
const stars = document.querySelector('.stars');
const playAgain = document.querySelectorAll('.playAgain');
document.querySelector('.hint span').textContent = numberOfHints;

const hintButton = document.querySelector('.hint');
hintButton.addEventListener('click', getHint);

// Optional: Reset score button
const resetScoreBtn = document.querySelector('.reset-score');
if (resetScoreBtn) {
  resetScoreBtn.addEventListener('click', () => {
    score = 0;
    localStorage.setItem('score', score);
    if (scoreDisplay) scoreDisplay.textContent = score;
  });
}

function generateInputs() {
  const inputsContainer = document.querySelector('.inputs');
  inputsContainer.innerHTML = '';
  for (let i = 1; i <= numberOfTries; i++) {
    const tryDiv = document.createElement('div');
    tryDiv.classList.add(`try${i}`);
    tryDiv.innerHTML = `<span>try-${i}</span>`;
    if (i !== 1) tryDiv.classList.add('disabled-inputs');
    for (let j = 1; j <= numberOfLetters; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `guess${i}-letter${j}`;
      input.setAttribute('maxlength', '1');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('aria-label', `Letter ${j} of try ${i}`);
      tryDiv.appendChild(input);
    }
    inputsContainer.appendChild(tryDiv);
  }

  // Focus first
  const firstInput = inputsContainer.querySelector('input');
  if (firstInput) firstInput.focus();

  // Disable others
  document.querySelectorAll('.disabled-inputs input').forEach(input => input.disabled = true);

  // Typing and key navigation
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', function () {
      // Only allow letters
      this.value = this.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
      const nextInput = inputs[index + 1];
      if (this.value && nextInput && !nextInput.disabled) nextInput.focus();
    });

    input.addEventListener('keydown', function (event) {
      const currentIndex = Array.from(inputs).indexOf(event.target);
      if (event.key === 'ArrowRight' && inputs[currentIndex + 1])
        inputs[currentIndex + 1].focus();
      if (event.key === 'ArrowLeft' && inputs[currentIndex - 1])
        inputs[currentIndex - 1].focus();
    });
  });
}

guessBtn.addEventListener('click', handleGuess);

function handleGuess() {
  let success = true;
  for (let i = 1; i <= numberOfLetters; i++) {
    const inputField = document.querySelector(`#guess${currentTry}-letter${i}`);
    const letterInput = inputField.value.toLowerCase();
    const realLetter = word[i - 1];

    if (letterInput === realLetter) {
      inputField.classList.add('yes');
    } else if (word.includes(letterInput) && letterInput !== '') {
      inputField.classList.add('maybe');
      success = false;
    } else {
      inputField.classList.add('no');
      success = false;
    }
  }

  if (success) {
    winSound.play();
    document.querySelectorAll('.inputs div').forEach(div => div.classList.add('disabled-inputs'));
    guessBtn.disabled = true;
    win.classList.add('open');
    if (numberOfHints === 3) {
      document.querySelector('.noHint').textContent = 'You\'re Genius';
    }
    hintButton.disabled = true;

    // --- SCORE LOGIC ---
    let points = 10;
    if (currentTry === 1) points += 10;
    points += numberOfHints * 2;
    updateScore(points);
    // --- END SCORE LOGIC ---
  } else {
    document.querySelector(`.try${currentTry}`).classList.add('disabled-inputs');
    document.querySelectorAll(`.try${currentTry} input`).forEach(input => input.disabled = true);
    currentTry++;

    const nextInputs = document.querySelectorAll(`.try${currentTry} input`);
    if (nextInputs.length) {
      // Only copy correct letters from previous try
      for (let i = 1; i <= numberOfLetters; i++) {
        const prevInput = document.querySelector(`#guess${currentTry - 1}-letter${i}`);
        const nextInput = document.querySelector(`#guess${currentTry}-letter${i}`);
        if (prevInput && prevInput.value.toLowerCase() === word[i - 1]) {
          nextInput.value = word[i - 1].toUpperCase();
          nextInput.disabled = true;
          nextInput.classList.add('yes');
        } else {
          nextInput.disabled = false;
        }
      }
      document.querySelector(`.try${currentTry}`).classList.remove('disabled-inputs');
      // Focus first non-disabled input
      const firstEnabled = Array.from(nextInputs).find(input => !input.disabled);
      if (firstEnabled) firstEnabled.focus();
    }

    if (currentTry > 2 && currentTry <= 4) {
      stars.children[2].style.color = 'black';
    }
    if (currentTry > 4) {
      stars.children[1].style.color = 'black';
      stars.children[2].style.color = 'black';
    }

    if (currentTry > numberOfTries) {
      lose.classList.add('open');
      guessBtn.disabled = true;
      hintButton.disabled = true;
      document.querySelector('.wordLose').textContent = word;
      lostSound.play();
    }
  }
}

function getHint() {
  if (numberOfHints <= 0) return;
  // Only consider inputs that are not disabled and are empty or incorrect
  const enabledInputs = Array.from(document.querySelectorAll(`.try${currentTry} input:not([disabled])`));
  const hintableInputs = enabledInputs.filter((input, idx) => {
    const val = input.value.toLowerCase();
    return val === '' || val !== word[idx];
  });

  if (hintableInputs.length > 0) {
    numberOfHints--;
    document.querySelector('.hint span').textContent = numberOfHints;
    if (numberOfHints === 0) {
      document.querySelector('.hint').textContent = 'no hint';
      hintButton.disabled = true;
    }
    // Pick a random input from those that need help
    const randomInput = hintableInputs[Math.floor(Math.random() * hintableInputs.length)];
    const indexToFill = enabledInputs.indexOf(randomInput);
    if (indexToFill !== -1) {
      randomInput.value = word[indexToFill].toUpperCase();
      randomInput.classList.add('yes');
      randomInput.disabled = true;
    }
  }
}

window.onload = function () {
  generateInputs();
};

function restartGame() {
  currentTry = 1;
  numberOfHints = 3;

  randomKey = keys[Math.floor(Math.random() * keys.length)];
  value = words[randomKey];
  word = value[Math.floor(Math.random() * value.length)].toLowerCase();
  document.querySelector('.category').textContent = randomKey;
  letter = Array.from(word);
  numberOfLetters = letter.length;

  document.querySelector('.inputs').innerHTML = '';
  guessBtn.disabled = false;
  hintButton.disabled = false;

  document.querySelector('.hint').innerHTML = `hint (<span>${numberOfHints}</span>)`;
  if (stars.children[1]) stars.children[1].style.color = '';
  if (stars.children[2]) stars.children[2].style.color = '';

  generateInputs();
  const firstInput = document.querySelector('input');
  if (firstInput) firstInput.focus();
}

playAgain.forEach(btn => {
  btn.addEventListener('click', () => {
    win.classList.remove('open');
    lose.classList.remove('open');
    lostSound.currentTime = 0;
    winSound.currentTime = 0;
    lostSound.pause();
    winSound.pause();
    restartGame();
  });
});

function handleBackSpace(event) {
  if (event.key === 'Backspace') {
    const inputs = Array.from(document.querySelectorAll('input:not([disabled])'));
    const index = inputs.indexOf(document.activeElement);
    if (index > 0) {
      inputs[index].value = '';
      inputs[index - 1].value = '';
      inputs[index - 1].focus();
    }
  }
}

document.addEventListener('keydown', handleBackSpace);
