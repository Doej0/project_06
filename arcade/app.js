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