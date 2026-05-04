import Entity from './Entity.js';

export default class XPOrb extends Entity {
    constructor() {
        super();
    }

    spawn(x, y, amount) {
        this.x = x;
        this.y = y;
        this.amount = amount;
        this.radius = 6; // Küreleri iki kat büyüttük!
        this.active = true;
        this.vy = -3; // Daha yükseğe zıplar
        this.vx = (Math.random() - 0.5) * 6; // Daha yana saçar
        this.gravity = 0.2;
        this.color = Math.random() > 0.5 ? '#00ff00' : '#ffff00'; // Tam fosforlu Yeşil/Sarı
    }

    update(canvas, fireX, playerLevelStats) {
        // Fizik: Yerçekimi ile sekme
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Duvarlardan sekme
        if(this.x < 0 || this.x > canvas.width) this.vx *= -1;

        // Yere değince Mıknatıs (Magnet) efekti başlar
        if(this.y > canvas.height - 30) {
            this.y = canvas.height - 30;
            this.vy = 0;
            
            // fireX noktasına doğru akma (Magnetization)
            let dx = fireX - this.x;
            if(Math.abs(dx) < 10) {
                this.active = false;
                return this.amount; // Toplandı!
            } else {
                this.x += (dx > 0 ? 1 : -1) * 12; // Çok daha hızlı çekilir
            }
        }
        return 0;
    }

    draw(ctx) {
        ctx.imageSmoothingEnabled = false;
        
        const size = this.radius * 2;
        const drawX = this.x - this.radius;
        const drawY = this.y - this.radius;

        // Ana renk (Fosforlu)
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, drawY, size, size);
        
        // İç parlama (Daha belirgin)
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(drawX + 2, drawY + 2, size - 4, size - 4);
        
        // Kalın siyah çerçeve
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, size, size);

        ctx.imageSmoothingEnabled = true;
    }
}