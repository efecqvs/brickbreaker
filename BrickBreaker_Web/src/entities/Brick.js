import Entity from './Entity.js';
import { CONFIG } from '../config.js';
import { Textures, Cracks } from '../systems/TextureGen.js';

export default class Brick extends Entity {
    constructor() {
        super();
    }

    spawn(gridX, gridY, hp, textureIndex = -1) {
        this.gridX = gridX; 
        this.gridY = gridY;
        this.hp = Math.ceil(hp); 
        this.maxHp = this.hp;
        this.w = CONFIG.BRICK_SIZE; 
        this.h = CONFIG.BRICK_SIZE;
        this.y = (gridY - 1) * (this.h + CONFIG.PADDING) + 60; 
        this.targetY = this.gridY * (this.h + CONFIG.PADDING) + 60;
        this.active = true;
        this.textureOverride = textureIndex;
    }

    updatePos() { 
        this.targetY = this.gridY * (this.h + CONFIG.PADDING) + 60; 
    }

    update() {
        if(Math.abs(this.y - this.targetY) > 0.1) {
            this.y += (this.targetY - this.y) * 0.12;
        }
        this.x = this.gridX * (this.w + CONFIG.PADDING) + CONFIG.PADDING + 2;
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        this.hp = Math.max(0, Math.ceil(this.hp));
        if(this.hp <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.globalCompositeOperation = 'source-over'; 
        
        let texIndex = this.textureOverride !== -1 ? this.textureOverride : Math.min(this.maxHp - 1, 31);
        let tex = Textures[texIndex];
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.drawImage(tex, this.x, this.y, this.w, this.h);
        
        // 3. Minecraft Çatlak Efekti (Cracking)
        if (this.hp < this.maxHp) {
            // Hasar yüzdesine göre 0-9 arası çatlak evresi seç
            let damageRatio = 1 - (this.hp / this.maxHp);
            let crackStage = Math.floor(damageRatio * 10);
            crackStage = Math.min(9, Math.max(0, crackStage));
            
            ctx.drawImage(Cracks[crackStage], this.x, this.y, this.w, this.h);
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.font = "bold 14px 'Courier New', monospace"; 
        
        ctx.strokeText(this.hp, this.x + this.w/2, this.y + this.h/2 + 5);
        ctx.fillText(this.hp, this.x + this.w/2, this.y + this.h/2 + 5);
        
        ctx.imageSmoothingEnabled = true;
    }
}