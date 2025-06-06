// game.js
class Ball {
    constructor(rect, leftPaddle, rightPaddle, leftScoreText, rightScoreText, game) {
        this.rect = rect;
        this.leftPaddle = leftPaddle;
        this.rightPaddle = rightPaddle;
        this.leftScoreText = leftScoreText;
        this.rightScoreText = rightScoreText;
        this.game = game;
        this.subtract = false;
        this.vy = 10.0;
        this.vx = -70.0;
    }

    calculateNewVelocityAngle(paddle) {
        const relativeIntersectY = (paddle.y + (paddle.height / 2.0)) - (this.rect.y + (this.rect.height / 2.0));
        const normalIntersectY = relativeIntersectY / (paddle.height / 2.0);
        const theta = normalIntersectY * Constants.MAX_ANGLE;
        return theta * Math.PI / 180; // Convertir a radianes
    }

    update(dt) {
        // Rebote en bordes superior e inferior
        if (this.vy >= 0.0) {
            if (this.rect.y + (this.vy * dt) + this.rect.height > Constants.SCREEN_HEIGHT - Constants.INSETS_BOTTOM) {
                this.vy *= -1.0;
            }
        } else if (this.vy < 0.0) {
            if (this.rect.y + (this.vy * dt) < Constants.TOOLBAR_HEIGHT) {
                this.vy *= -1.0;
            }
        }

        // Colisión con paletas
        if (this.vx < 0.0) {
            if (this.rect.x + (this.vx * dt) < this.leftPaddle.x + this.leftPaddle.width) {
                this.checkPaddleCollision(this.leftPaddle, dt);
            }
        } else if (this.vx >= 0.0) {
            if (this.rect.x + (this.vx * dt) + this.rect.width > this.rightPaddle.x) {
                this.checkPaddleCollision(this.rightPaddle, dt);
            }
        }

        // Actualizar posición
        this.rect.y += this.vy * dt;
        this.rect.x += this.vx * dt;

        // Punto para jugador derecho
        if (this.rect.x + this.rect.width < this.leftPaddle.x) {
            let rightScore = parseInt(this.rightScoreText.text);
            if (this.subtract) {
                rightScore--;
                this.subtract = false;
            }
            rightScore++;
            this.rightScoreText.text = "" + rightScore;
            this.resetBall();

            if (rightScore >= Constants.WIN_SCORE) {
                rightScore--;
                this.game.showVictoryMessage(2);
                return;
            }
        }
        // Punto para jugador izquierdo
        else if (this.rect.x >= this.rightPaddle.x + this.rightPaddle.width) {
            const leftScore = parseInt(this.leftScoreText.text);
            this.leftScoreText.text = "" + (leftScore + 1);
            this.resetBall();

            if (leftScore + 1 >= Constants.WIN_SCORE) {
                this.game.showVictoryMessage(1);
                return;
            }
        }
    }

    resetBall() {
        this.rect.x = Constants.SCREEN_WIDTH / 2.0;
        this.rect.y = Constants.SCREEN_HEIGHT / 2.0;
        this.vy = 10.0;
        this.vx = -150.0;
        Constants.BALL_SPEED = 200;
    }

    checkPaddleCollision(paddle, dt) {
        if (this.rect.y + (this.vy * dt) > paddle.y &&
            this.rect.y + (this.vy * dt) + this.rect.height < paddle.y + paddle.height) {

            const theta = this.calculateNewVelocityAngle(paddle);
            const newVx = Math.abs((Math.cos(theta)) * Constants.BALL_SPEED);
            const newVy = (-Math.sin(theta)) * Constants.BALL_SPEED;

            const oldSign = Math.signum(this.vx);
            this.vx = newVx * (-1.0 * oldSign);
            this.vy = newVy;
            Constants.BALL_SPEED += Constants.SPEED_INCREMENT;
        }
    }
}

class PlayerController {
    constructor(rect, keyListener = null) {
        this.rect = rect;
        this.keyListener = keyListener;
    }

    moveUp(dt) {
        if (this.rect.y - Constants.PADDLE_SPEED * dt > Constants.TOOLBAR_HEIGHT) {
            this.rect.y -= Constants.PADDLE_SPEED * dt;
        }
    }

    moveDown(dt) {
        if ((this.rect.y + Constants.PADDLE_SPEED * dt) + this.rect.height < Constants.SCREEN_HEIGHT - Constants.INSETS_BOTTOM) {
            this.rect.y += Constants.PADDLE_SPEED * dt;
        }
    }
}

class PlayerOneController extends PlayerController {
    update(dt) {
        if (this.keyListener.isKeyPressed("w") || this.keyListener.isKeyPressed("W")) {
            this.moveUp(dt);
        } else if (this.keyListener.isKeyPressed("s") || this.keyListener.isKeyPressed("S")) {
            this.moveDown(dt);
        }
    }
}

class PlayerTwoController extends PlayerController {
    update(dt) {
        if (this.keyListener) {
            if (this.keyListener.isKeyPressed("ArrowDown")) {
                this.moveDown(dt);
            } else if (this.keyListener.isKeyPressed("ArrowUp")) {
                this.moveUp(dt);
            }
        }
    }
}

class KeyListener {
    constructor() {
        this.keyPressed = {};
        window.addEventListener('keydown', (e) => this.keyPressed[e.key] = true);
        window.addEventListener('keyup', (e) => this.keyPressed[e.key] = false);
    }

    isKeyPressed(key) {
        return this.keyPressed[key] || false;
    }
}

class MouseListener {
    constructor(canvas) {
        this.isPressed = false;
        this.x = 0;
        this.y = 0;

        canvas.addEventListener('mousedown', () => this.isPressed = true);
        canvas.addEventListener('mouseup', () => this.isPressed = false);
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.x = e.clientX - rect.left;
            this.y = e.clientY - rect.top;
        });
    }

    getMouseX() { return this.x; }
    getMouseY() { return this.y; }
    isMousePressed() { return this.isPressed; }
}

class PongGame {
    constructor(useAI = false) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = Constants.SCREEN_WIDTH;
        this.canvas.height = Constants.SCREEN_HEIGHT;

        this.keyListener = new KeyListener();
        this.mouseListener = new MouseListener(this.canvas);

        this.isRunning = true;
        this.isPaused = false;
        this.escapePressed = false;
        this.useAI = useAI;

        // Elementos del DOM
        this.pauseMenu = document.getElementById('pauseMenu');
        this.victoryMenu = document.getElementById('victoryMenu');
        this.victoryMessage = document.getElementById('victoryMessage');
        this.playAgainBtn = document.getElementById('playAgain');
        this.resumeBtn = document.getElementById('resume');
        this.backToMenuBtn = document.getElementById('backToMenu');
        this.victoryBackToMenuBtn = document.getElementById('victoryBackToMenu');

        // Configurar eventos
        this.setupEventListeners();

        this.initGameObjects();
        this.pauseMenu.style.display = 'none';
        this.victoryMenu.style.display = 'none';
    }

    setupEventListeners() {
        this.resumeBtn.addEventListener('click', () => {
            this.isPaused = false;
            this.pauseMenu.style.display = 'none';
        });

        this.backToMenuBtn.addEventListener('click', () => {
            window.location.href = "game-menu.html";
        });

        this.playAgainBtn.addEventListener('click', () => {
            // Recargar la página con el mismo modo de juego
            const mode = this.useAI ? 'ai' : 'two';
            window.location.href = `game.html?mode=${mode}`;
        });

        this.victoryBackToMenuBtn.addEventListener('click', () => {
            window.location.href = "game-menu.html";
        });
    }

    showVictoryMessage(winner) {
        this.isPaused = true;
        const winnerText = winner === 1 ?
            'Player 1 Wins!' :
            (this.useAI ? 'AI Wins!' : 'Player 2 Wins!');

        this.victoryMessage.textContent = winnerText;
        this.victoryMenu.style.display = 'flex';
        this.pauseMenu.style.display = 'none'; // Asegurar que el menú de pausa no esté visible
    }

    initGameObjects() {
        const font = `${Constants.TEXT_SIZE}px Times New Roman`;

        this.leftScoreText = new Text("0", font, Constants.TEXT_X_POS, Constants.TEXT_Y_POS);
        this.rightScoreText = new Text("0", font, Constants.SCREEN_WIDTH - Constants.TEXT_X_POS - 16, Constants.TEXT_Y_POS);

        this.playerOne = new Rect(Constants.HZ_PADDING, 40, Constants.PADDLE_WIDTH, Constants.PADDLE_HEIGHT, Constants.PADDLE_COLOR);
        this.playerOneController = new PlayerOneController(this.playerOne, this.keyListener);

        this.playerTwo = new Rect(Constants.SCREEN_WIDTH - Constants.PADDLE_WIDTH - Constants.HZ_PADDING, 40, Constants.PADDLE_WIDTH, Constants.PADDLE_HEIGHT, Constants.PADDLE_COLOR);

        // Primero creamos la pelota
        this.ballRect = new Rect(Constants.SCREEN_WIDTH / 2, Constants.SCREEN_HEIGHT / 2, Constants.BALL_WIDTH, Constants.BALL_WIDTH, Constants.PADDLE_COLOR);
        this.ball = new Ball(this.ballRect, this.playerOne, this.playerTwo, this.leftScoreText, this.rightScoreText, this);

        // Luego creamos los controladores según el modo
        if (this.useAI) {
            this.playerTwoController = new PlayerTwoController(this.playerTwo);
            this.ai = new AI(this.playerTwoController, this.ballRect); // Pasamos ballRect en lugar de ball
        } else {
            this.playerTwoController = new PlayerTwoController(this.playerTwo, this.keyListener);
            this.ai = null;
        }
    }

    start() {
        this.lastFrameTime = Time.getTime();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) {
            window.location.href = "index.html";
            return;
        }

        const currentTime = Time.getTime();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(dt) {
        // Manejo de la tecla ESCAPE
        if (this.keyListener.isKeyPressed("Escape")) {
            if (!this.escapePressed) {
                this.isPaused = !this.isPaused;
                this.escapePressed = true;
                // Mostrar/ocultar menú de pausa
                this.pauseMenu.style.display = this.isPaused ? 'flex' : 'none';
                // Asegurarse de ocultar menú de victoria si se reanuda
                if (!this.isPaused) {
                    this.victoryMenu.style.display = 'none';
                }
            }
        } else {
            this.escapePressed = false;
        }

        if (!this.isPaused) {
            this.playerOneController.update(dt);

            if (this.useAI) {
                this.ai.update(dt);
            } else {
                this.playerTwoController.update(dt);
            }

            this.ball.update(dt);
        }
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, Constants.SCREEN_WIDTH, Constants.SCREEN_HEIGHT);

        // Dibujar objetos del juego
        this.leftScoreText.draw(this.ctx);
        this.rightScoreText.draw(this.ctx);
        this.playerOne.draw(this.ctx);
        this.playerTwo.draw(this.ctx);
        this.ballRect.draw(this.ctx);

    }


}

// Extender Math para incluir signum si no existe
Math.signum = Math.signum || function(x) {
    return x ? x < 0 ? -1 : 1 : 0;
}

// Exportar para otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Ball, PlayerController, PlayerOneController, PlayerTwoController, KeyListener, MouseListener, PongGame };
}