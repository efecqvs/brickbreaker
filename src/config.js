export const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 650,
    BRICK_COLS: 10,
    PADDING: 4,
    get BRICK_SIZE() {
        return this.CANVAS_WIDTH / this.BRICK_COLS - this.PADDING;
    }
};

export function getBallColor(value) {
    const power = Math.log2(value || 1);
    const hue = (power * 40) % 360; 
    return `hsl(${hue}, 85%, 65%)`;
}
