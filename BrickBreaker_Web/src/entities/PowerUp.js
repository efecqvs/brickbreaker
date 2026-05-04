import Entity from './Entity.js';
import { CONFIG } from '../config.js';

const POWERUP_TYPES = [
    { id: 'extra_ball', color: '#fff', symbol: '+', chance: 0.7 },
    { id: 'laser', color: '#ff3333', symbol: 'L', chance: 0.15 },
    { id: 'freeze', color: '#33ccff', symbol: 'F', chance: 0.15 }
];

export default class PowerUp extends Entity {
    constructor() {
        super();
    }

    spawn(gridX, gridY) {
        this.gridX = gridX; 
        this.gridY = gridY;
        this.w = CONFIG.BRICK_SIZE; 
        this.h = CONFIG.BRICK_SIZE;
        this.radius = 12;
        this.updatePos();
        this.active = true;
        this.pulse = 0;

        // Rastgele tür seç
        let roll = Math.random();
        let cumulative = 0;
        this.type = POWERUP_TYPES[0]; // default
        for(let p of POWERUP_TYPES) {
            cumulative += p.chance;
            if(roll < cumulative) {
                this.type = p;
                break;
            }
        }
    }

    updatePos() { 
        this.targetY = this.gridY * (this.h + CONFIG.PADDING) + 60; 
    }

    update() {
        if(Math.abs(this.y - this.targetY) > 0.1) {
            this.y += (this.targetY - this.y) * 0.12;
        }
        this.x = this.gridX * (this.w + CONFIG.PADDING) + CONFIG.PADDING + this.w/2;
        this.pulse += 0.05;
    }

    collect(game) {
        if(this.active) {
            this.active = false;
            
            if(this.type.id === 'extra_ball') {
                window.pendingBalls++;
            } else if(this.type.id === 'laser') {
                // Lazer efekti: Bulunduğu sütundaki tüm bloklara hasar ver
                game.fireLaser(this.gridX);
            } else if(this.type.id === 'freeze') {
                // Dondurma efekti: Birkaç tur boyunca bloklar aşağı inmez
                game.applyFreeze();
            }
        }
    }

    draw(ctx) {
        ctx.imageSmoothingEnabled = false;
        let s = this.radius + Math.sin(this.pulse) * 2;
        
        ctx.fillStyle = this.type.color;
        ctx.fillRect(this.x - s, this.y + this.h/2 - s, s*2, s*2);
        
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - s, this.y + this.h/2 - s, s*2, s*2);
        
        ctx.fillStyle = "#000"; 
        ctx.font = "bold 16px 'Courier New', monospace"; 
        ctx.textAlign = "center";
        ctx.fillText(this.type.symbol, this.x, this.y + this.h/2 + 5);
        ctx.imageSmoothingEnabled = true;
    }
}