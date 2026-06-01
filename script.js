const items = [
  "rio",
  "lluvia",
  "maraca",
  "tambor",
  "flauta",
  "aves",
  "rana",
  "fogata"
];

const board = document.getElementById("board");
const winMessage = document.getElementById("win-message");
const winText = document.getElementById("win-text");
const closeWinMessage = document.getElementById("close-win-message");
const timer = document.getElementById("timer");
const bestTimesList = document.getElementById("best-times");
const confettiColors = ["#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#f78c6b"];
const rankingKey = "memoriaAmazonicaBestTimes";

let first = null;
let second = null;
let lock = false;
let matches = 0;
let startTime = null;
let elapsedTime = 0;
let timerInterval = null;
const sounds = {};

function shuffle(array){
  return array.sort(() => Math.random() - 0.5);
}

function formatTime(milliseconds){

  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const tenths = Math.floor((milliseconds % 1000) / 100);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function getBestTimes(){

  const savedTimes = localStorage.getItem(rankingKey);

  if(!savedTimes) return [];

  try{
    return JSON.parse(savedTimes);
  }
  catch(error){
    return [];
  }
}

function saveBestTimes(bestTimes){
  localStorage.setItem(rankingKey, JSON.stringify(bestTimes));
}

function renderBestTimes(){

  const bestTimes = getBestTimes().slice(0, 5);

  bestTimesList.innerHTML = "";

  if(bestTimes.length === 0){
    const empty = document.createElement("li");
    empty.textContent = "Sin tiempos";
    empty.className = "empty-time";
    bestTimesList.appendChild(empty);
    return;
  }

  bestTimes.forEach(time => {

    const item = document.createElement("li");
    item.innerHTML = `<span>${formatTime(time)}</span>`;
    bestTimesList.appendChild(item);
  });
}

function startTimer(){

  if(startTime !== null) return;

  startTime = Date.now() - elapsedTime;

  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    timer.textContent = formatTime(elapsedTime);
  }, 100);
}

function stopTimer(){

  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if(startTime !== null){
    elapsedTime = Date.now() - startTime;
    timer.textContent = formatTime(elapsedTime);
  }
}

function resetTimer(){

  stopTimer();
  startTime = null;
  elapsedTime = 0;
  timer.textContent = formatTime(elapsedTime);
}

function registerTime(time){

  const bestTimes = getBestTimes();
  bestTimes.push(time);
  bestTimes.sort((a, b) => a - b);

  const position = bestTimes.indexOf(time) + 1;

  saveBestTimes(bestTimes);
  renderBestTimes();

  return position;
}

function startGame(){

  board.innerHTML = "";
  winMessage.hidden = true;
  winText.textContent = "Has completado el memorial amazónico";
  first = null;
  second = null;
  lock = false;
  matches = 0;
  resetTimer();
  renderBestTimes();

  let deck = [];

  items.forEach(item => {
    deck.push({
      id:item,
      type:"sound"
    });

    deck.push({
      id:item,
      type:"image"
    });
  });

  shuffle(deck);

  deck.forEach(card => {

    const div = document.createElement("div");

    div.className = "card";

    div.dataset.id = card.id;
    div.dataset.type = card.type;

    div.innerHTML = `
      <div class="inner">

        <div class="face back">
          🌿
        </div>

        <div class="face front">
          <img src="assets/cards/${card.id}_${card.type}.jpg">
        </div>

      </div>
    `;

    div.addEventListener("click", () => flip(div));

    board.appendChild(div);
  });
}

function flip(card){

  if(lock) return;

  if(card.classList.contains("flipped")) return;

  startTimer();

  card.classList.add("flipped");

  if(card.dataset.type === "sound"){

    const soundPath = `assets/sounds/${card.dataset.id}.wav`;
    const audio = sounds[card.dataset.id] || new Audio(soundPath);

    sounds[card.dataset.id] = audio;
    audio.currentTime = 0;

    audio.play();
  }

  if(!first){

    first = card;
    return;
  }

  second = card;

  checkMatch();
}

function celebrateMatch(){

  for(let i = 0; i < 90; i++){

    const confetti = document.createElement("span");

    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.25}s`;
    confetti.style.setProperty("--fall-distance", `${70 + Math.random() * 30}vh`);
    confetti.style.setProperty("--drift", `${Math.random() * 160 - 80}px`);
    confetti.style.setProperty("--spin", `${Math.random() * 720 + 360}deg`);

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 2600);
  }
}

function showWinMessage(position){

  winMessage.hidden = false;
  winText.textContent =
    `Has completado el memorial amazónico en ${formatTime(elapsedTime)}. Quedaste en el puesto ${position}.`;
  celebrateMatch();
}

function checkMatch(){

  const same =
    first.dataset.id === second.dataset.id &&
    first.dataset.type !== second.dataset.type;

  if(same){

    celebrateMatch();
    matches++;

    first = null;
    second = null;

    if(matches === items.length){
      stopTimer();
      const position = registerTime(elapsedTime);
      setTimeout(() => showWinMessage(position), 500);
    }

    return;
  }

  lock = true;

  setTimeout(() => {

    first.classList.remove("flipped");
    second.classList.remove("flipped");

    first = null;
    second = null;

    lock = false;

  }, 900);
}

document
.getElementById("restart")
.addEventListener("click", startGame);

closeWinMessage.addEventListener("click", () => {
  winMessage.hidden = true;
});

startGame();
