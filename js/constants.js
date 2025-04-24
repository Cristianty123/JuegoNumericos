class Constants {
    static SCREEN_WIDTH = 800;
    static SCREEN_HEIGHT = 600;
    static SCREEN_TITLE = "Pong - Métodos Numéricos";

    static PADDLE_WIDTH = 10;
    static PADDLE_HEIGHT = 100;
    static PADDLE_COLOR = "#FFFFFF";
    static BALL_WIDTH = 10;
    static HZ_PADDING = 40;
    static PADDLE_SPEED = 250;
    static BALL_SPEED = 200;
    static SPEED_INCREMENT = 20;

    static TOOLBAR_HEIGHT = 0;
    static INSETS_BOTTOM = 0;

    static MAX_ANGLE = 30;

    static TEXT_Y_POS = 70;
    static TEXT_X_POS = 10;
    static TEXT_SIZE = 40;

    static WIN_SCORE = 2;
}

// Exportar para otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Constants;
}