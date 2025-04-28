//ai.js
class AI {
    constructor(playerTwoController, ballRect) {
        this.playerTwoController = playerTwoController;
        this.ballRect = ballRect;

        // Variables para seguimiento de la pelota
        this.lastBallX = ballRect.x;
        this.lastBallY = ballRect.y;
        this.lastTime = performance.now();
        this.ballVX = 0;
        this.ballVY = 0;
    }

    update(dt) {
        // 1. Calcular velocidades actuales de la pelota
        this.calculateBallVelocity();

        // 2. Solo actuar si la pelota se mueve hacia la paleta (vx > 0)
        if (this.ballVX > 0) {
            // 3. Predecir posición futura
            const targetY = this.predictFuturePosition();

            // 4. Mover la paleta
            this.movePaddleToTarget(targetY, dt);
        }
    }

    calculateBallVelocity() {
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;

        if (deltaTime > 0) {
            this.ballVX = (this.ballRect.x - this.lastBallX) / deltaTime;
            this.ballVY = (this.ballRect.y - this.lastBallY) / deltaTime;

            // Actualizar valores para el próximo frame
            this.lastBallX = this.ballRect.x;
            this.lastBallY = this.ballRect.y;
            this.lastTime = now;
        }
    }

    predictFuturePosition() {
        const paddleX = this.playerTwoController.rect.x;
        const distanceX = paddleX - this.ballRect.x;

        // Tiempo estimado hasta llegar a la paleta
        const timeToReachPaddle = distanceX / this.ballVX;

        // Posición Y predicha (sin considerar rebotes)
        let predictedY = this.ballRect.y + this.ballVY * timeToReachPaddle;

        // Considerar rebotes en los bordes
        const canvasHeight = Constants.SCREEN_HEIGHT - Constants.TOOLBAR_HEIGHT - Constants.INSETS_BOTTOM;
        const ballHeight = this.ballRect.height;

        // Aplicar rebotes virtuales
        while (predictedY < Constants.TOOLBAR_HEIGHT || predictedY > canvasHeight - ballHeight) {
            if (predictedY < Constants.TOOLBAR_HEIGHT) {
                predictedY = 2 * Constants.TOOLBAR_HEIGHT - predictedY;
            } else {
                predictedY = 2 * (canvasHeight - ballHeight) - predictedY;
            }
            this.ballVY *= -1; // Invertir dirección al rebotar
        }

        return predictedY;
    }

    movePaddleToTarget(targetY, dt) {
        const paddle = this.playerTwoController.rect;
        const paddleCenter = paddle.y + paddle.height / 2;
        const targetPaddleY = targetY - paddle.height / 2;

        // Margen para evitar oscilaciones
        const margin = 5;

        // Limitar movimiento a los bordes del canvas
        const minY = Constants.TOOLBAR_HEIGHT;
        const maxY = Constants.SCREEN_HEIGHT - Constants.INSETS_BOTTOM - paddle.height;
        const clampedTarget = Math.max(minY, Math.min(maxY, targetPaddleY));

        // Decidir dirección de movimiento
        if (paddle.y < clampedTarget - margin) {
            this.playerTwoController.moveDown(dt);
        } else if (paddle.y > clampedTarget + margin) {
            this.playerTwoController.moveUp(dt);
        }
    }
}
// Exportar para otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI;
}