import Entity from './Entity.js';

export default class FloatingText extends Entity {
    constructor() {
        super();
    }

    spawn(x, y, text, isCrit) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.isCrit = isCrit;
        this.active = true;
        
        this.life = 1.0; // 1.0'dan 0'a kadar saydamlaşacak
        this.vy = isCrit ? -1.5 : -1; // Kritikler biraz daha hızlı çıkar
        this.vx = (Math.random() - 0.5) * 1; // Hafif sağa sola saçılma
        
        // Kritikse hafif bir rastgele ofset (titreme) için kullanılacak
        this.wobble = isCrit ? 2 : 0; 
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02; // Yaklaşık 50 frame yaşar (1 saniye altı)
        
        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        
        let drawX = this.x;
        let drawY = this.y;

        if (this.isCrit) {
            // Kritik titreşim efekti
            drawX += (Math.random() - 0.5) * this.wobble;
            drawY += (Math.random() - 0.5) * this.wobble;
            
            ctx.fillStyle = "#ffcc00"; // Altın sarısı
            ctx.font = "bold 18px 'Press Start 2P', 'Courier New', monospace";
            ctx.strokeStyle = "#ff0000"; // Kırmızı dış çizgi
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px 'Courier New', monospace";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
        }

        ctx.textAlign = "center";
        
        ctx.strokeText(this.text, drawX, drawY);
        ctx.fillText(this.text, drawX, drawY);
        
        ctx.globalAlpha = 1.0;
    }
}