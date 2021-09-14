// markov guessing game
const N = 0;
const H = 1;
const T = 2;
class MarkovCoin {
  constructor(order = 2) {
    this.order = order;
    this.currentState = [];
    for (let i = 0; i < order; i++) this.currentState.push(N);
    this.history = [];
    for (let i = 0; i < pow(2, order); i++) {
      this.history.push([0, 0]);
    }
    this.guesses = 0;
    this.correct = 0;
    this.currentGuess = N;
    this.guessNextChoice();
  }
  stateToIndex() {
    if (this.currentState.indexOf(N) !== -1) return -1;
    let ind = 0;
    let m = 1;
    for (let i = 0; i < this.order; i++) {
      ind += this.currentState[i] === H ? 0 : m;
      m *= 2;
    }
    return ind;
  }
  getOdds() {
    let ind = this.stateToIndex();
    if (ind !== -1) {
      let o = this.history[ind];
      if (o[0] === 0 && o[1] === 0) {
        return [0, 0];
      } else {
        return o;
      }
    } else {
      return [0, 0];
    }
  }
  updateHistory(playerChoice) {
    const ind = this.stateToIndex();
    if (ind !== -1) {
      this.history[ind][playerChoice === H ? 0 : 1] += 1;
    }
    this.currentState.shift();
    this.currentState.push(playerChoice);
  }
  checkGuess(playerChoice) {
    this.guesses += 1;
    if (playerChoice === this.currentGuess) {
      this.correct += 1;
    }
    this.updateHistory(playerChoice);
    this.guessNextChoice();
  }
  guessNextChoice() {
    let ind = this.stateToIndex();
    if (ind !== -1) {
      let numHeads = this.history[ind][0];
      let numTails = this.history[ind][1];
      if (numHeads + numTails === 0) {
        this.currentGuess = this.getGuess(1,1);
      } else {
        this.currentGuess = this.getGuess(numHeads, numTails);
      } 
    } else {
      this.currentGuess = this.getGuess(1,1);
    }
  }
  getGuess(headsCount, tailsCount) {
    const total = headsCount + tailsCount;
    if (random() <= headsCount / total) {
      return H;
    } else {
      return T;
    }
  }
}

class Button {
  constructor(x,y,w,h,str, cb) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.str = str;
    this.cb = cb;
  }
  show(option = {}) {
    rectMode(CENTER);
    stroke(0);
    if (option.highlight) {
      fill(200);
    } else {
      fill(255);
    }
    rect(this.x,this.y,this.w,this.h);
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(0);
    text(this.str, this.x, this.y);
  }
  inside(mx,my) {
    return ((mx > this.x - this.w/2) && (mx < this.x + this.w/2) && (my > this.y - this.h/2) && (my < this.y + this.h/2));
  }
  callback() {
    this.cb();
  }
}
class GuessButton {
  constructor(markov) {
    this.toggle = false;
    this.markov = markov;
    this.button = new Button(width/2 + 50, height/2 + 120, 260, 100, "Toggle Guess");
  }
  show(option = {}) {
    if (this.toggle) {
      let cg = this.markov.currentGuess === H ? 'H' : this.markov.currentGuess === T ? 'T' : '0';
      let odds = this.markov.getOdds();
      let mStr = `Guess: ${cg}\nOdds: ${odds[0]} : ${odds[1]}`;
      this.button.str = mStr;
    } else {
      this.button.str = "Toggle Guess";
    }
    this.button.show(option);
  }
  inside(mx, my) {
    return this.button.inside(mx, my);
  }
  callback() {
    this.toggle = !this.toggle;
  }
}
class MarkovWidget {
  constructor(x, y, w, h, markov) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.markov = markov;
  }
  getHistory() {
    let str = '';
    const h = this.markov.currentState;
    for (let i = 0; i < h.length; i++) {
      let letter;
      if (h[i] === H) letter = 'H';
      else if (h[i] === T) letter = 'T';
      else letter = '0';
      str += ' ' + letter;
    }
    return str;
  }
  show() {
    rectMode(CENTER);
    stroke(0);
    fill(255);
    rect(this.x, this.y, this.w, this.h);
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(0);
    text(`Markov Coin Guesser Order ${this.markov.order}`, this.x, this.y - 20);
    
    textSize(15);
    text(`Total Prediction: ${this.markov.guesses}`, this.x - 100, this.y + 20);
    text(`Correct Prediction: ${this.markov.correct}`, this.x + 100, this.y + 20);
    
    textSize(10);
    let historyText = this.getHistory();
    textAlign(CENTER, CENTER);
    text(historyText, this.x, this.y + 40);

  }
}
let markov;
let guessButton;
let buttons;
let markovWidget;

let guessH, guessT, showGuess, incMarkov, decMarkov;
function setup() {
  createCanvas(400, 400);
  markov = new MarkovCoin(5);
  
  guessH = () => {
    if (markov.currentGuess === H) {
      console.log("You lose! Markov Correctly predicted H");
    } else {
      console.log("You win! Markov Incorrectly predicted T");
    }
    markov.checkGuess(H);
  };
  guessT = () => {
    if (markov.currentGuess === T) {
      console.log("You lose! Markov Correctly predicted T");
    } else {
      console.log("You win! Markov Incorrectly predicted H");
    }
    markov.checkGuess(T);
  };
  toggleGuess = () => {
    guessButton.toggle = !guessButton.toggle;
  };
  incMarkov = () => {
    
    if (markov.order < 7) markov = new MarkovCoin(markov.order + 1);
    else markov = new MarkovCoin(markov.order);
    markovWidget.markov = markov;
    guessButton.markov = markov;
  };
  decMarkov = () => {
    if (markov.order > 1) markov = new MarkovCoin(markov.order - 1);
    else markov = new MarkovCoin(markov.order);
    markovWidget.markov = markov;
    guessButton.markov = markov;
  };
  
  buttons = [];
  buttons.push(new Button(180, height/2, 100, 100, "H", guessH));
  buttons.push(new Button(width-80, height/2, 100, 100, "T", guessT));
  guessButton = new GuessButton(markov);
  buttons.push(guessButton);
  buttons.push(new Button(35, 140, 50, 50, "INC", incMarkov));
  buttons.push(new Button(35, 200, 50, 50, "DEC", decMarkov));
  
  markovWidget = new MarkovWidget(width/2, 60, 380, 100, markov);
}

function draw() {
  background(220);
  
  for (const button of buttons) {
    let option = {};
    if (button.inside(mouseX, mouseY)) {
      option.highlight = true;
    }
    button.show(option);
  }
  markovWidget.show();
}

function mousePressed() {
  for (const button of buttons) {
    if (button.inside(mouseX, mouseY)) {
      button.callback();
    }
  }
}

function keyPressed() {
  if (keyCode === 72) {
    guessH();
  } else if (keyCode === 84) {
    guessT();
  }
}