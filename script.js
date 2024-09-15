function init(){
    const startButton = document.getElementById('button-start');
    const pauseButton = document.getElementById('button-pause');
    const stopButton = document.getElementById('button-stop');

    startButton.addEventListener('click', game.start);
    pauseButton.addEventListener('click', game.pause);
    stopButton.addEventListener('click', game.stop);

    window.addEventListener('keydown', snake.changeDirection);
    
}

function getRandomNumber(min, max){
    return Math.trunc(Math.random() * (max - min) + min);
}

let moveIntervalId;
const GAME_STATUS_STARTED = "started";
const GAME_STATUS_PAUSED = "paused";
const GAME_STATUS_STOPPED = "stopped";

const SNAKE_DIRECTION_UP = 'up';
const SNAKE_DIRECTION_DOWN = 'down';
const SNAKE_DIRECTION_LEFT = 'left';
const SNAKE_DIRECTION_RIGHT = 'right';

const config = {
    size: 20
};

const game = {
    getElement(){
        return document.getElementById('game');
    },

    score: 0,

    status: GAME_STATUS_STOPPED,

    updateScore(score){
        const element = document.getElementById('score-value');
        element.textContent = score;
    },

    start(){
        if(game.status === GAME_STATUS_STOPPED){
            snake.reset();
        }
        game.setGameStatus(GAME_STATUS_STARTED);
        board.render();
        snake.render();
        food.render();
        moveIntervalId = setInterval(game.move, snake.moveTime);
    },

    pause(){
        if (moveIntervalId) {
            clearInterval(moveIntervalId);
            moveIntervalId = null;
        }
        game.setGameStatus(GAME_STATUS_PAUSED);
    },

    stop(){
        game.setGameStatus(GAME_STATUS_STOPPED);
        clearInterval(moveIntervalId);
        moveIntervalId = null;
        game.showFinalScore();
        game.score = 0;
        game.updateScore(game.score);
    },

    showFinalScore(){
        const bd = board.getElement();
        bd.innerHTML = "";
        const bdInner = document.createElement('div');
        bdInner.className = "final-score";
        const gameOverMessage = document.createElement('div');
        gameOverMessage.innerText = "GAME OVER";
        bdInner.appendChild(gameOverMessage);
        const scoreMessage = document.createElement('div');
        scoreMessage.innerText = `Your score: ${game.score}`;
        bdInner.appendChild(scoreMessage);
        bd.appendChild(bdInner);
    },

    setGameStatus(status){
        const element = game.getElement();
        element.classList.remove(GAME_STATUS_STARTED, GAME_STATUS_PAUSED, GAME_STATUS_STOPPED);
        element.classList.add(status);
        game.status = status;
    },

    move(){
        const nextPosition = snake.getNextPosition();
        const foundFood = food.findPosition(nextPosition);
        const isPartOfSnake = snake.checkPosition(nextPosition);
        if(isPartOfSnake){
            game.stop();
        }
        if(foundFood !== -1){
            snake.setPosition(nextPosition, false);
            food.removeItem(foundFood);
            food.generateItem();
            food.render();
            game.score++;
            game.updateScore(game.score);
        }else{
            snake.setPosition(nextPosition);
        }
        snake.render();
        
    },
}

const board = {
    getElement(){
        return document.getElementById('board');
    },

    render(){
        const element = this.getElement();
        element.innerHTML = "";
        for(let i = 0; i < config.size**2; i++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.top = Math.trunc(i / config.size);
            cell.dataset.left = i % config.size;
            element.appendChild(cell);
        }
    }
};

const cell = {
    getCellElements(){
        return document.getElementsByClassName('cell');
    },

    render(coordinates, className){
        const cells = this.getCellElements();
        
        for(let cell of cells){
            cell.classList.remove(className);
        }

        for(let coordinate of coordinates){
            const cell = document.querySelector(`.cell[data-top="${coordinate.top}"][data-left="${coordinate.left}"]`);
            cell.classList.add(className);
        }
    },
}

const snake = {
    direction: SNAKE_DIRECTION_RIGHT,

    moveTime: 300,

    parts: [
        {top: 0, left: 0},
        {top: 0, left: 1},
        {top: 0, left: 2}
    ],

    render(){
        cell.render(this.parts, 'snake');
    },

    changeDirection(event){
        let direction = null;

        switch(event.keyCode){
            case 37:
                direction = SNAKE_DIRECTION_LEFT;
                break;
            case 38:
                direction = SNAKE_DIRECTION_UP;
                break;
            case 39:
                direction = SNAKE_DIRECTION_RIGHT;
                break;
            case 40:
                direction = SNAKE_DIRECTION_DOWN;
                break;
            default:
                return;
        }

        snake.setDirection(direction);
    },

    setDirection(direction){
        if(this.direction === SNAKE_DIRECTION_DOWN && direction === SNAKE_DIRECTION_UP
            || this.direction === SNAKE_DIRECTION_UP && direction === SNAKE_DIRECTION_DOWN
            || this.direction === SNAKE_DIRECTION_LEFT && direction === SNAKE_DIRECTION_RIGHT
            || this.direction === SNAKE_DIRECTION_RIGHT && direction === SNAKE_DIRECTION_LEFT
        ) return;
        this.direction = direction;
    },

    getNextPosition(){
        const position = {...this.parts[this.parts.length - 1]};

        switch(this.direction){
            case SNAKE_DIRECTION_UP:
                position.top -= 1;
                break;
            case SNAKE_DIRECTION_DOWN:
                position.top += 1;
                break;
            case SNAKE_DIRECTION_LEFT:
                position.left -= 1;
                break;
            case SNAKE_DIRECTION_RIGHT:
                position.left += 1;
                break;
        }

        if(position.top === -1){
            position.top = config.size - 1;
        } else if(position.top > config.size - 1){
            position.top = 0;
        }

        if(position.left === -1){
            position.left = config.size - 1;
        } else if(position.left > config.size - 1){
            position.left = 0;
        }

        return position;
    },

    setPosition(position, shift = true){
        if(shift){
            this.parts.shift();
        }
        this.parts.push(position);
    },

    checkPosition(snakePosition){
        const compareFunction = function(item){
            return item.top === snakePosition.top  && item.left === snakePosition.left;
        }
        return this.parts.findIndex(compareFunction) !== -1;
    },

    reset() {
        this.direction = SNAKE_DIRECTION_RIGHT;
        this.parts = [
            {top: 0, left: 0},
            {top: 0, left: 1},
            {top: 0, left: 2}
        ];
    },
}

const food = {
    items: [
        {top: 5, left: 5}
    ],

    render(){
        cell.render(this.items, 'food');
    },

    findPosition(snakePosition){
        const compareFunction = function(item){
            return item.top === snakePosition.top  && item.left === snakePosition.left;
        }
        return this.items.findIndex(compareFunction);
    },

    removeItem(position){
        this.items.splice(position, 1);
    },

    generateItem(){
        const newItem = {
            top: getRandomNumber(0, config.size - 1),
            left: getRandomNumber(0, config.size - 1)
        };
        if(snake.checkPosition(newItem)){
            this.generateItem();
        }
        this.items.push(newItem);
    }
}

window.addEventListener('load', init);