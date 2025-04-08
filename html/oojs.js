// Alap GameObject osztály, amelyből a többi játékelem származik
class GameObject {
    constructor(game, size, color) {
        this.game = game;
        this.size = size;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.element = this.createElement();
    }
    
    createElement() {
        const element = document.createElement('div');
        element.className = 'game-object';
        element.style.width = `${this.size}px`;
        element.style.height = `${this.size}px`;
        element.style.backgroundColor = this.color;
        element.style.position = 'absolute';
        element.style.borderRadius = '50%';
        return element;
    }
    
    render() {
        // Az elemet közvetlenül a body-hoz adjuk hozzá, majd pozicionáljuk
        document.body.appendChild(this.element);
        
        // Majd áthelyezzük a játéktérbe
        this.game.gameArea.appendChild(this.element);
        
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class Game {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('scoreValue');
        this.startButton = document.getElementById('startButton');
        this.player = null;
        this.enemies = [];
        this.score = 0;
        this.gameInterval = null;
        this.enemyInterval = null;
        this.isGameRunning = false;
        this.gameAreaWidth = this.gameArea.clientWidth;
        this.gameAreaHeight = this.gameArea.clientHeight;

        // Eseménykezelők beállítása
        this.startButton.addEventListener('click', () => this.toggleGame());
        window.addEventListener('resize', () => this.handleResize());
        
        // Kezdeti méretezés
        this.handleResize();
    }

    handleResize() {
        // Játéktér méretének frissítése
        this.gameAreaWidth = this.gameArea.clientWidth;
        this.gameAreaHeight = this.gameArea.clientHeight;
        
        // Ha van játékos, frissítjük a pozícióját
        if (this.player) {
            // Biztosítjuk, hogy a játékos a játéktéren belül maradjon
            this.player.x = Math.min(this.player.x, this.gameAreaWidth - this.player.size);
            this.player.updatePosition();
        }
        
        // Ellenségek pozícióinak frissítése
        this.enemies.forEach(enemy => {
            enemy.x = Math.min(enemy.x, this.gameAreaWidth - enemy.size);
            enemy.updatePosition();
        });
    }

    toggleGame() {
        if (this.isGameRunning) {
            this.pauseGame();
            this.startButton.textContent = 'Játék folytatása';
        } else {
            if (this.player === null || this.startButton.textContent === 'Új játék') {
                this.startGame();
            } else {
                this.resumeGame();
            }
            this.startButton.textContent = 'Szünet';
        }
        
        this.isGameRunning = !this.isGameRunning;
    }

    startGame() {
        this.resetGame();
        this.player = new Player(this);
        this.player.render();
        this.gameInterval = setInterval(() => this.updateGame(), 20);
        this.enemyInterval = setInterval(() => this.createEnemy(), 2000);
    }

    pauseGame() {
        clearInterval(this.gameInterval);
        clearInterval(this.enemyInterval);
    }

    resumeGame() {
        this.gameInterval = setInterval(() => this.updateGame(), 20);
        this.enemyInterval = setInterval(() => this.createEnemy(), 2000);
    }

    resetGame() {
        // Leállítjuk az összes időzítőt
        clearInterval(this.gameInterval);
        clearInterval(this.enemyInterval);
        
        // Töröljük az összes elemet a játéktérről
        this.gameArea.innerHTML = '';
        
        // Töröljük az ellenségeket a memóriából
        this.enemies.forEach(enemy => {
            enemy.remove();
        });
        this.enemies = [];
        
        // Nullázzuk a pontszámot
        this.score = 0;
        this.updateScore();
        
        // Töröljük a játékost
        if (this.player) {
            this.player.remove();
            this.player = null;
        }
    }

    createEnemy() {
        const enemy = new Enemy(this);
        enemy.render();
        this.enemies.push(enemy);
    }

    updateGame() {
        if (this.player) {
            this.player.move();
            
            // Ellenségek mozgatása és ütközésvizsgálat
            this.enemies.forEach(enemy => {
                enemy.move();
                if (this.checkCollision(this.player, enemy)) {
                    this.endGame();
                }
            });
            
            // Eltávolítjuk a játéktéren kívüli ellenségeket
            this.enemies = this.enemies.filter(enemy => {
                if (enemy.isOutOfBounds()) {
                    enemy.remove();
                    this.increaseScore();
                    return false;
                }
                return true;
            });
        }
    }

    checkCollision(player, enemy) {
        const dx = player.x + player.size/2 - (enemy.x + enemy.size/2);
        const dy = player.y + player.size/2 - (enemy.y + enemy.size/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (player.size + enemy.size) / 2;
    }

    endGame() {
        this.pauseGame();
        this.isGameRunning = false;
        alert(`Játék vége! Pontszám: ${this.score}`);
        this.startButton.textContent = 'Új játék';
    }

    increaseScore() {
        this.score++;
        this.updateScore();
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    // Játéktér méretének lekérdezése
    getGameAreaWidth() {
        return this.gameAreaWidth;
    }
    
    getGameAreaHeight() {
        return this.gameAreaHeight;
    }
}

// Player osztály, amely a GameObject osztályból származik
class Player extends GameObject {
    constructor(game) {
        // Játékos mérete a játéktér méretéhez igazítva
        const size = Math.min(game.getGameAreaWidth(), game.getGameAreaHeight()) * 0.05;
        // Meghívjuk a szülő osztály konstruktorát
        super(game, size, 'blue');
        
        // Kezdőpozíció: alul középen
        this.x = (this.game.getGameAreaWidth() - this.size) / 2;
        this.y = this.game.getGameAreaHeight() - this.size - 10;
        // Sebesség a játéktér szélességéhez igazítva
        this.speed = this.game.getGameAreaWidth() * 0.01;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Érintőképernyő támogatás
        this.game.gameArea.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.game.gameArea.addEventListener('touchmove', (e) => this.handleTouch(e));
    }

    handleKeyPress(e) {
        if (!this.game.isGameRunning) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.x = Math.max(0, this.x - this.speed);
                break;
            case 'ArrowRight':
                this.x = Math.min(this.game.getGameAreaWidth() - this.size, this.x + this.speed);
                break;
        }
        this.updatePosition();
    }
    
    handleTouch(e) {
        if (!this.game.isGameRunning) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const gameAreaRect = this.game.gameArea.getBoundingClientRect();
        const touchX = touch.clientX - gameAreaRect.left;
        
        // A játékos középpontját a touch pozícióhoz igazítjuk
        this.x = Math.max(0, Math.min(touchX - this.size / 2, this.game.getGameAreaWidth() - this.size));
        this.updatePosition();
    }

    move() {
        // Ebben a játékban a játékos csak a felhasználói inputra mozog
        this.updatePosition();
    }
}

// Enemy osztály, amely a GameObject osztályból származik
class Enemy extends GameObject {
    constructor(game) {
        // Ellenség mérete a játéktér méretéhez igazítva
        const size = Math.min(game.getGameAreaWidth(), game.getGameAreaHeight()) * 0.04;
        // Meghívjuk a szülő osztály konstruktorát
        super(game, size, 'red');
        
        // Véletlenszerű kezdőpozíció a játéktér tetején
        this.x = Math.random() * (this.game.getGameAreaWidth() - this.size);
        this.y = -this.size;
        // Sebesség a játéktér magasságához igazítva
        this.speed = this.game.getGameAreaHeight() * 0.005 + Math.random() * this.game.getGameAreaHeight() * 0.005;
    }

    move() {
        this.y += this.speed;
        this.updatePosition();
    }

    isOutOfBounds() {
        return this.y > this.game.getGameAreaHeight();
    }
}

// Játék indítása
const game = new Game();
