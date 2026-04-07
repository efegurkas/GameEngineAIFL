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


module.exports = {printBoard}