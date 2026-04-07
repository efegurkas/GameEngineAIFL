
class GomokuEngine{
    constructor(size = 15){
        this.size = size; 
        this.board = Array(size).fill().map(() => Array(size).fill(0)); 
        this.currentPlayer = 1; 
        this.isGameOver = false; 
        this.winner = null; 
        this.moveCount = 0; 
    }

    isValidMove(x,y){
        if (x < 0 || x >= this.size || y < 0 ||  y >= this.size) return false; 
        if (this.board[y][x] !== 0) return false; 
        return true; 
    }

    playTurn(x,y){
        if (this.isGameOver) return this.getState(); 
        if (!this.isValidMove(x,y)){
            this.isGameOver = true;
            this.winner = this.currentPlayer === 1 ? 2 : 1; 
            return this.getState(); 
        }

        this.board[y][x] = this.currentPlayer;
        this.moveCount++; 
        
        if (this.checkWin(x,y,this.currentPlayer)){
            this.isGameOver = true;
            this.winner = this.currentPlayer; 
        }
        else if (this.moveCount == this.size * this.size){
            this.isGameOver = true;
            this.winner = 'DRAW'; 
        }
        else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1; 
        }
        return this.getState(); 
    }

    checkWin(x,y,player){
        const dir = [
            [1,0],
            [0,1],
            [1,1],
            [1,-1]
        ];
        
        for (let [dx,dy] of dir){
            let cnt = 1;
            cnt += this.countStones(x,y,dx,dy,player); 
            cnt += this.countStones(x,y,-dx,-dy,player); 
            if (cnt >= 5) return true; 
        }
        return false; 
    }

    countStones(x,y,dx,dy,player){
        let cnt = 0;
        let currX = x + dx;
        let currY = y + dy; 

        while (currX >= 0 && currX < this.size && currY >= 0 && currY < this.size && this.board[currY][currX] === player){
            cnt++;
            currX += dx;
            currY += dy; 
        }
        return cnt; 
    }

    getState(){
        return {
            board : this.board,
            turn : this.currentPlayer,
            isGameOver : this.isGameOver,
            winner : this.winner 
        }; 
    }

}

module.exports = GomokuEngine;
 