const svgNS = "http://www.w3.org/2000/svg";

function makeRangeIterator(start = 0, end = Infinity, step = 1) {
  let nextIndex = start;
  let iterationCount = 0;

  const rangeIterator = {
    next: function () {
      let result;
      if (nextIndex < end) {
        result = { value: nextIndex, done: false };
        nextIndex += step;
        iterationCount++;
        return result;
      }
      return { value: iterationCount, done: true };
    },
  };
  return rangeIterator;
}

class Model {
    // data
    observer;
    lastFilledSquare;
    winner;
    isWinner = false;
    isDraw = false;
    isConnectBot = false;
    
    // initialize
    constructor() {
        this.reset();
    }

    reset() {
        this.isDraw = false;
        this.isWinner = false;
        this.state = {
            move: 0,
            players: ['purple', 'green'],
            board: [
       // row --> 0     1     2     3     4     5 
                'a0', 'a1', 'a2', 'a3', 'a4', 'a5',     // --> cola
                'b0', 'b1', 'b2', 'b3', 'b4', 'b5',     // --> colb
                'c0', 'c1', 'c2', 'c3', 'c4', 'c5',     // --> colc
                'd0', 'd1', 'd2', 'd3', 'd4', 'd5',     // --> cold
                'e0', 'e1', 'e2', 'e3', 'e4', 'e5',     // --> cole
                'f0', 'f1', 'f2', 'f3', 'f4', 'f5',     // --> colf
                'g0', 'g1', 'g2', 'g3', 'g4', 'g5'],    // --> colg
        }
    }
   
    get board() {
        return this.state.board;
    }

    get currentPlayer() {
        return this.state.players[this.state.move % 2];
    }

    get square() {
        return this.lastFilledSquare;
    }

    set selection(slot) {
        // slot is the whole column.
        // slot * 6 gets the next column as the index increases
        // slot * 6 + 6 gets 1 past the last element for the slice
        let selection = this.board.slice(slot*6, slot*6+6);
        this.insertDisc(slot, selection);
    }

    set connectBot(slot) {
        if (
            this.lastFilledSquare.col === 1 ||
            this.lastFilledSquare.col === 2 ||
            this.lastFilledSquare.col === 5 ||
            this.lastFilledSquare.col === 6)
        {
            let select = this.board.slice(slot*6, slot*6+6);
            let square = select.find(elem => elem !== "purple" && elem !== "green");
            if (square) {
                this.board[this.board.indexOf(square)] = this.currentPlayer;
                this.lastFilledSquare = {
                    col: slot,
                    row: select.indexOf(square),
                    color: this.currentPlayer,
                }
                console.log(this.lastFilledSquare);
                this.notify();
            }
        }

        else if (
            this.lastFilledSquare.col === 0 ||
            this.lastFilledSquare.col === 3 ||
            this.lastFilledSquare.col === 4)
        {
            let choices = [0,3,4];
            let randomSlot = choices[Math.floor(Math.random() * choices.length)];
            let select = this.board.slice(randomSlot*6, randomSlot*6+6);
            let square = select.find(elem => elem !== "purple" && elem !== "green");
            if (square) {
                this.board[this.board.indexOf(square)] = this.currentPlayer;
                this.lastFilledSquare = {
                    col: randomSlot,
                    row: select.indexOf(square),
                    color: this.currentPlayer,
                }
                console.log(this.lastFilledSquare);
                this.notify();
            }
        }
    }
    
    attach(observer) {
        this.observer = observer;
    }

    insertDisc(slot, selection) {
        // find the next square in the slot that hasn't been played yet.
        const nextEmptySquare 
            = selection.find(elem => elem !== "purple" && elem !== "green")

        if (nextEmptySquare) {
            // if the column is not full, insert the disc at the found square
            this.board[this.board.indexOf(nextEmptySquare)] = this.currentPlayer;

            // update last filled square
            this.lastFilledSquare = {
                col: slot,
                row: selection.indexOf(nextEmptySquare),
                color: this.currentPlayer,
            };

            // notify the observer (GameController) of changed state
            this.notify();   
        }
    }

    notify() {
        // GameController will trigger render on update
        this.observer.update(this.square);
        
        // check for the win.
        if (this.checkHorizontal() === true || 
            this.checkVertical() === true ||
            this.checkDiagonal() === true) {
            let winningMove = this.state.move;
            this.winner = `${this.state.players[winningMove % 2]} wins :) ... Reset to Play Again`;
            this.isWinner = true;
            this.observer.presentWinner(this.winner);
        } else if (this.state.move > 40){
            this.isDraw = true;
            this.observer.draw();
        } 
        else {
            this.observer.showNextMove();
        }
    }

    // numIter - number of iterations
    // horizontal check = 6
    // vertical check = 7
    // sliceLength - length of array to check per step (column or row)
    // horizontal check = 7;
    // vertical check = 6;
    check(board, numIter, shiftCount,sliceLength) {
        for (let j = 0; j < numIter; j++) {
            for (let i = 0; i < shiftCount; i++) {
                let first = i + j * sliceLength;
                let last = first + 4;
                const isConnectFour = (elem, n, arr) => elem === arr[0];
                if (board.slice(first, last).every(isConnectFour)) {
                    return true;
                }
            }
        }
    }

    checkHorizontal() {
        return this.check(this.flattenRow(), 6,4,7);
    }

    checkVertical() {
        return this.check(this.board, 7,3,6);
    }

    checkDiagonal() {
    for (let j = 0; j < 3; j++) {
      const diagonal1 = [];
      const diagonal2 = [];
      let n1 = 0;
      let n2 = 3;

      let k = 0;
      for (let i = 0; i < 4; i++) {
        diagonal1[i] = this.board.slice(j + k * 6, j + k * 6 + 4)[n1];
        diagonal2[i] = this.board.slice(j + k * 6, j + k * 6 + 4)[n2];
        k++;
        n1++;
        n2--;
      }
      //console.log(diagonal1);
      //console.log(diagonal2);
      const isConnectFour = (elem, n, arr) => elem === arr[0];
      if (diagonal1.every(isConnectFour) || diagonal2.every(isConnectFour)) {
        return true;
      }
    }
  }
    

    // helper function to rearrange row  to work like columns
    // allows for one check function that handles both horizontal
    // and vertical checks given a board, steps and slicelength
    flattenRow() {
        const rowArray = [];
        for (let i = 0; i < 6; i++) {
            const it = makeRangeIterator(i, this.board.length, 6);

            let result = it.next();
            while (!result.done) {
                rowArray.push(this.board[result.value]);
                result = it.next();
            }
        }
        return rowArray;
    }
}

// access the board html slots through DOM
class BoardView {
    // data
    selection;

    // initialize
    constructor(controller) {
        this.controller = controller;
        this.boardElem = document.getElementById("board");
        this.slotList = document.querySelectorAll(".slot");
        
        // each slot handles the mouseenter event by setting
        // the current selected slot.
        for (const slot of this.slotList) {
            slot.addEventListener('mouseenter', e => {
                this.selection = Array.from(this.slotList).indexOf(slot);
            });
        }

        // inform the controller of the click event
        this.boardElem.addEventListener('click', e => {
            this.controller.changed(this);
        });
    }

    render(square) {
        const svg = document.getElementById("grid");
        const disc = document.createElementNS(svgNS,"use")
        disc.setAttribute("class", "disc");
        disc.setAttribute("href", "#disc0");
        disc.setAttribute("x", `${square.col*200}`);
        disc.setAttribute("y", `${1200-square.row*200}`);
        disc.setAttribute("fill", `${square.color}`);
        svg.appendChild(disc);
    }

    undraw() {
        const discList = document.querySelectorAll(".disc");
        for (const disc of discList) {
            disc.remove();
        }
    }
}

// controlling and coordinating the interaction of the UI.
class GameController {
    // initialize 
    constructor(model) {
        this.board = new BoardView(this);
        this.resetButton = document.getElementById("reset");
        this.statusBox = document.getElementById("stats");
        this.toggleBot = document.getElementById("play2");
        this.player1 = document.getElementById("player1");
        this.player2 = document.getElementById("player2");
        this.model = model;
        this.model.attach(this);

        this.resetButton.addEventListener('click', e => {
            this.reset();
            this.resetButton.style.animation = 'none';
        });

        this.toggleBot.addEventListener('click', e => {
            this.connectBot();
            this.player2.style.animation = 'none';
        });
    }

    connectBot() {
        if (this.toggleBot.checked === true){
            this.model.isConnectBot = false;
            this.player2.innerHTML = '';
            this.player2.innerHTML = "Player 2";
            this.statusBox.innerHTML = '';
            this.statusBox.innerHTML = 'Player 1 vs Player 2';
        } else {
            this.model.isConnectBot = true;
            this.player2.innerHTML = '';
            this.player2.innerHTML = 'Connect Bot';
            this.statusBox.innerHTML = '';
            this.statusBox.innerHTML = 'Player 1 vs Connect Bot';
        }
    }

    changed(view) {
        if (view === this.board) {
            this.player2.style.animation = 'none';
            this.model.selection = view.selection;
            if (this.toggleBot.checked === false  && this.model.isWinner === false) {
                this.model.connectBot = view.selection;
            }
        }
    }

    update(square) {
        this.board.render(square);
    }

    showNextMove() {
        // increment move counter to get next move
        this.model.state.move++;

        this.statusBox.innerHTML = '';
        this.statusBox.innerHTML = `${this.model.currentPlayer} turn :)`;
    }

    presentWinner(winner) {
        this.statusBox.innerHTML = '';
        this.statusBox.innerHTML = winner;
        this.resetButton.style.animation = 'glowing 1300ms infinite';
    }

    draw() {
        this.statusBox.innerHTML = '';
        this.statusBox.innerHTML = "Draw no winner :/";
        this.resetButton.style.animation = 'glowing 1300ms infinite';
    }


    reset() {
        this.model.reset();
        this.board.undraw();
        this.board = new BoardView(this);
        this.model.attach(this);
        this.statusBox.innerHTML = '';
        this.statusBox.innerHTML = 'lets play';
    }
}

const model = new Model();
const gameController = new GameController(model);
