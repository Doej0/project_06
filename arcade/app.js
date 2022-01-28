


const board = [];

for (let i = 0; i < 7; i++) {
  board.push([])
}


/* keep track of the players and the board
const gameState = {
    board: board, // from above
    players: ['red', 'yellow'] // or whatever
  }

*/
const board = document.getElementById("board");
const cookieCountEle = document.getElementById("cookieCount");
let state; 


function buildInitialState(){
   state = {
        cookies:0,
}
}

//render
function renderState(){
    cookieCountEle.innerText = "Cookies:" + state.cookies;

}

/**
 * When our board is clicked, run the player turn.
 */

const onBoardClick = function (){
    state.cookies += 1;
    console.log(state.cookies);
    renderState();

  
};



board.addEventListener("click",onBoardClick);