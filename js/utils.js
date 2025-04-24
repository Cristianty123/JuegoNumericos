class Rect {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Text {
    constructor(text, font, x, y, color = "#FFFFFF") {
        this.text = text;
        this.font = font;
        this.x = x;
        this.y = y;
        this.color = color;
    }

    draw(ctx) {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }

    get width() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = this.font;
        return ctx.measureText(this.text).width;
    }

    get height() {
        // Estimación simple basada en el tamaño de fuente
        const size = parseInt(this.font.match(/\d+/)[0]);
        return size;
    }
}

class Time {
    static timeStarted = performance.now();

    static getTime() {
        return (performance.now() - Time.timeStarted) / 1000;
    }
}

// Exportar para otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Rect, Text, Time };
}