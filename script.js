const scene = document.getElementById("scene");
const board = document.getElementById("board");
let boardSize;

let boardDim;
let boardTop;
let boardLeft;
let boardSide;

const distance = 10;
const player = document.createElement("div");
player.id = "player";

let firstClick = true;
let invisible = false;
let message = document.getElementById("message");

let allTiles;
let map = new Map();

class Cell extends HTMLDivElement {
    constructor() {
        super();
    }

    startGame() {
        player.remove();
        board.innerHTML = "";
        message.textContent = "";
        button.textContent = "Start Game";
        firstClick = true;

        boardSize = parseInt(document.getElementById("size").value);
        if (Number.isNaN(boardSize) || boardSize < 6) {
            message.textContent = "Enter a number greater than 6.";
            return;
        }

        board.style.width = 30 * boardSize + "px";
        scene.style.width = 30 * boardSize + "px";

        boardDim = board.getBoundingClientRect();
        boardTop = boardDim.y;
        boardLeft = boardDim.x;
        boardSide = boardDim.width;
        
        for (let i = 1; i <= boardSize + 2; i++) {
            let cellContainer = document.createElement("cell");
            cellContainer.id = "cellContainer";
            cellContainer.style.width = "" + 30 * boardSize + "px";

            for (let j = 1; j <= boardSize + 2; j++) {
                if (i == 1 || i == boardSize + 2 || j == 1 || j == boardSize + 2) {
                    let cell = new EmptyCell();
                    cellContainer.append(cell);
                }
                else {
                    let cell = new Cell();
                    cell.id = "cell";
        
                    let rand = Math.random() < 0.3;
                    if (rand) {
                        cell.className = "mine";
                    }
                    else {
                        cell.className = "safe";
                    }
    
                cell.style.backgroundColor = "white";
        
                cellContainer.append(cell);
                }
            }

            board.append(cellContainer);
        }

        board.addEventListener('click', new Cell().sweep);
    }
    
    countMines() {
        let parent = this.parentElement;
        //row of the tile
        let i = Array.prototype.indexOf.call(parent.children, this);
        //column of the tile
        let j = Array.prototype.indexOf.call(parent.parentElement.children, parent);
    
        return this.nextSibling.count() + this.previousSibling.count() 
        + parent.nextSibling.children[i].count() + parent.previousSibling.children[i].count()
        + parent.nextSibling.children[i+1].count() + parent.nextSibling.children[i-1].count()
        + parent.previousSibling.children[i+1].count() + parent.previousSibling.children[i-1].count();
    }

    count() {
        if (this.className == "mine") {
            return 1;
        }
        else {
            return 0;
        }
    }

    sweep(event) {
        let tile = event.target;
    
        if (firstClick) {
            scene.append(player);
            player.style.left = parseInt(event.clientX) + "px";
            player.style.top = parseInt(event.clientY) + "px";

            if (tile.className == "mine") {
                tile.className = "safe";
            }

            allTiles = document.querySelectorAll("#cell");
            allTiles.forEach(element => {
                let count = element.countMines();
                map.set(element, count);
            });
    
            let parent = tile.parentElement;
            //row of the tile
            let i = Array.prototype.indexOf.call(parent.children, tile);
            //column of the tile
            let j = Array.prototype.indexOf.call(parent.parentElement.children, parent);
    
            tile.sweepSurrounding();
            tile.nextSibling.sweepSurrounding();
            tile.previousSibling.sweepSurrounding();
            parent.nextSibling.children[i].sweepSurrounding();
            parent.previousSibling.children[i].sweepSurrounding();
            
            firstClick = false;
        }

        window.addEventListener('keydown', movePlayer);
    }
    
    sweepSurrounding() {
        let parent = this.parentElement;
        //row of the tile
        let i = Array.prototype.indexOf.call(parent.children, this);
        //column of the tile
        let j = Array.prototype.indexOf.call(parent.parentElement.children, parent);
    
        this.clear();
        this.nextSibling.clear();
        this.previousSibling.clear();
        parent.nextSibling.children[i].clear();
        parent.previousSibling.children[i].clear();
    }
    
    clear() {
        if (this.className == "safe" && !invisible) {
            this.style.backgroundColor = "grey";
            this.textContent = map.get(this);
            this.style.textAlign = "center";
        }
        else {
            if (!firstClick && !invisible) {
                message.textContent = "You Lost :(";
                button.textContent = "Restart Game";
                window.removeEventListener('keydown', movePlayer);
            }
        }
    }
}

class EmptyCell extends HTMLDivElement {
    constructor() {
        super();
    }

    count(tile) {
        return 0;
    }
    
    sweepSurrounding(tile) {}
    
    clear(tile) {}
}

customElements.define("cell-tile", Cell, {extends: 'div'});
customElements.define("empty-cell-tile", EmptyCell, {extends: 'div'});
const c = new Cell();

const button = document.getElementById("start");
button.textContent = "Start Game";
button.addEventListener('click', c.startGame);

function movePlayer(event) {
    if (event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == " ") {
        switch (event.key) {
            case "ArrowLeft":
                if (parseInt(player.style.left) >= boardLeft + distance) {
                    player.style.left = parseInt(player.style.left) - distance + "px";
                }
                else {
                    player.style.left = boardLeft + "px";
                }
                break;
            case "ArrowRight":
                if (parseInt(player.style.left) <= boardLeft + boardSide - distance - 10) {
                    player.style.left = parseInt(player.style.left) + distance + "px";
                }
                else {
                    player.style.left = boardLeft + boardSide - 10 + "px";
                }
                break;
            case "ArrowUp":
                if (parseInt(player.style.top) >= boardTop + distance) {
                    player.style.top = parseInt(player.style.top) - distance + "px";
                }
                else {
                    player.style.top = boardTop + "px";
                }
                break;
            case "ArrowDown":
                if (parseInt(player.style.top) <= boardTop + boardSide - distance - 10) {
                    player.style.top = parseInt(player.style.top) + distance + "px";
                }
                else {
                    player.style.top = boardTop + boardSide - 10 + "px";
                }
                break;
            case " ":
                invisible = true;
                player.style.backgroundColor = "blue";
                setTimeout(invisibilityOff, 1000);
        }
        scene.append(player);
        playerClear();
        if (win()) {
            message.textContent = "You Won!";
            button.textContent = "Restart Game";
            window.removeEventListener('keydown', movePlayer);
        }
    }
}

function playerClear() {
    let x = Math.floor((parseInt(player.style.left) + 5 - boardLeft) / 30);
    let y = Math.floor((parseInt(player.style.top) + 5 - boardTop) / 30);
    let index = y * boardSize + x;
    
    allTiles[index].clear();
}

function invisibilityOff() {
    invisible = false;
    player.style.backgroundColor = "red";
    playerClear();
}

function win() {
    let endGame = true;

    allTiles.forEach(element => {
        if (element.className == "safe" && element.style.backgroundColor != "grey") {
            endGame = false;
        }
    });

    return endGame;
}