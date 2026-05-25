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
const confettiColors = ["#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#f78c6b"];

let first = null;
let second = null;
let lock = false;
let matches = 0;
const sounds = {};

function shuffle(array){
  return array.sort(() => Math.random() - 0.5);
}

function startGame(){

  board.innerHTML = "";
  winMessage.hidden = true;
  first = null;
  second = null;
  lock = false;
  matches = 0;

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

function showWinMessage(){

  winMessage.hidden = false;
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
      setTimeout(showWinMessage, 500);
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

startGame();
