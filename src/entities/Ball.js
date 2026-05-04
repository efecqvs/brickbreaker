import Entity from './Entity.js';
import { getBallColor } from '../config.js';
import { audioController } from '../audio.js';

export default class Ball extends Entity {
    constructor() {
        super();
        this.returning = false;
    }

    spawn(x, y, dx, dy, value) {
        this.x = x; 
        this.y = y; 
        this.dx = dx; 
        this.dy = dy;
        this.active = true; 
        this.returning = false;
        this.radius = 5;
        this.value = value || 1;
    }

    update(canvas, bricks, pickups, onFirstReturn, fireX, stats, ballsPool, textsPool) {
        if(this.returning) {
            this.y = canvas.height - 20; 
            let dx = fireX - this.x;
            if(Math.abs(dx) < 12) {
                this.active = false;
                this.returning = false;
            } else {
                this.x += (dx > 0 ? 1 : -1) * 22; 
            }
            return;
        }

        this.x += this.dx * 11;
        this.y += this.dy * 11;

        if (this.x + this.radius > canvas.width) { this.dx = -Math.abs(this.dx); this.x = canvas.width - this.radius; }
        else if (this.x - this.radius < 0) { this.dx = Math.abs(this.dx); this.x = this.radius; }
        if (this.y - this.radius < 0) { this.dy = Math.abs(this.dy); this.y = this.radius; }

        if (this.y + this.radius > canvas.height - 15) {
            this.y = canvas.height - 20;
            this.returning = true;
            onFirstReturn(this.x);
        }

        pickups.forEach(p => {
            if(p.active && Math.hypot(this.x - p.x, this.y - p.y) < this.radius + p.radius) {
                p.collect(window.gameInstance);
            }
        });

        for(let i=0; i<bricks.length; i++) {
            let b = bricks[i];
            if(b.active && this.x + this.radius > b.x && this.x - this.radius < b.x + b.w &&
               this.y + this.radius > b.y && this.y - this.radius < b.y + b.h) {
                
                let overlapX = Math.min(this.x + this.radius - b.x, b.x + b.w - (this.x - this.radius));
                let overlapY = Math.min(this.y + this.radius - b.y, b.y + b.h - (this.y - this.radius));

                // 1. Delici (Piercing) Kontrolü
                let isPiercing = Math.random() < stats.pierceChance;
                
                if(!isPiercing) {
                    if(overlapX < overlapY) {
                        this.dx *= -1;
                        this.x += (this.dx > 0 ? 1 : -1) * 2;
                    } else {
                        this.dy *= -1;
                        this.y += (this.dy > 0 ? 1 : -1) * 2;
                    }
                }

                // 2. Kritik Vuruş
                let isCrit = Math.random() < stats.critChance;
                let finalDamage = isCrit ? this.value * 3 : this.value; 

                // Hasar yazısını spawn et
                if(textsPool && window.gameInstance && window.gameInstance.showDamageTexts !== false) {
                    textsPool.get().spawn(this.x, this.y - 10, Math.round(finalDamage), isCrit);
                }

                // Çarpma Sesi
                audioController.playHitSound();

                // 3. Hücre Bölünmesi (Mitosis)
                if(Math.random() < stats.mitosisChance && ballsPool.getActive().length < 500) {
                    let newDx = this.dx * (Math.random() > 0.5 ? 1 : -1);
                    ballsPool.get().spawn(this.x, this.y, newDx, -Math.abs(this.dy), this.value);
                }

                b.takeDamage(finalDamage);
                break;
            }
        }
    }

    draw(ctx) {
        ctx.imageSmoothingEnabled = false;
        
        const size = this.radius * 2;
        const drawX = this.x - this.radius;
        const drawY = this.y - this.radius;

        // Topun iç rengi
        ctx.fillStyle = getBallColor(this.value);
        ctx.fillRect(drawX, drawY, size, size);
        
        // Siyah retro çerçeve
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, size, size);
        
        // Parlama efekti (Pixel tarzı beyaz köşe)
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(drawX, drawY, size / 3, size / 3);

        ctx.imageSmoothingEnabled = true;
    }
}