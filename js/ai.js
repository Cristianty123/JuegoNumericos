class AI {
    constructor(playerTwoController, ballRect) { // Cambiamos el parámetro de ball a ballRect
        this.playerTwoController = playerTwoController;
        this.ballRect = ballRect; // Ahora almacenamos ballRect directamente
        this.prevY = playerTwoController.rect.y;
        this.prevF = this.calculateF(this.prevY);
    }

    calculateF(y) {
        const yObjetivo = this.ballRect.y; // Accedemos a ballRect en lugar de ball.rect
        return y - yObjetivo;
    }

    update(dt) {
        this.playerTwoController.update(dt);
        const y = this.playerTwoController.rect.y;
        const fY = this.calculateF(y);

        // Método de la secante
        if (Math.abs(fY - this.prevF) > 1e-6) {
            let newY = y - fY * (y - this.prevY) / (fY - this.prevF);

            // Pequeño ajuste aleatorio si el cambio es muy pequeño
            if (Math.abs(newY - y) < 1e-3) {
                newY = y + (Math.random() > 0.5 ? 1 : -1) * dt * 5;
            }

            this.prevY = y;
            this.prevF = fY;

            if (newY < y) {
                this.playerTwoController.moveUp(dt);
            } else {
                this.playerTwoController.moveDown(dt);
            }
        }
    }
}

// Exportar para otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI;
}