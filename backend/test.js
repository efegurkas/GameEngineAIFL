const Engine = require('./engine/gomokuEngine.js');

const Game = new Engine(15);
 
function printBoard(board){
    const symbols = {0 : ' . ', 1 : ' X ', 2 : ' O '};
    let output = '\n'; 
    for (let y = 0; y < board.length; y++){
        let row = '';
        for (let x = 0; x < board[y].length; x++){
            row += symbols[board[y][x]];
        }
        output += row + '\n';
    }
    console.log(output); 
}

function getRandomBotMove(board,size){
    let avaibleMoves = []; 
    for (let y = 0; y < size; y++){
        for (let x = 0; x < size; x++){
            if (board[y][x] === 0){
                avaibleMoves.push({x,y}); 
            }
        }
    }
    if (avaibleMoves.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * avaibleMoves.length);
    return avaibleMoves[randomIndex]; 
}

console.log("-------- GOMOKU TEST --------\n");
let turnCnt = 1; 

while (!Game.isGameOver){
    console.log(`--- TUR ${turnCnt} | Sıra : Oyuncu ${Game.currentPlayer} ---\n`);

    const move = getRandomBotMove(Game.board,Game.size); 
    if (move){
        console.log(`Oyuncu ${Game.currentPlayer} hamlesi : (X : ${move.x}, Y : ${move.y})\n`); 
        Game.playTurn(move.x,move.y); 
        printBoard(Game.board); 
    } else {
        console.log("Yapılabilecek hamle kalmadı!\n"); 
        break;
    }

    turnCnt++; 
}

console.log("Oyun bitti!\n");
printBoard(Game.board);  
if (Game.winner === 'DRAW'){
    console.log("Sonuç: Beraberlik! Tahta dolu"); 
}
else {
    console.log(`Sonuç : Kazanan oyuncu ${Game.winner} !!! `); 
}
