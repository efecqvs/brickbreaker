export default class InputManager {
    constructor(canvas, gameInstance) {
        this.canvas = canvas;
        this.game = gameInstance;
        this.isAiming = false;
        this.targetX = 0;
        this.targetY = 0;
        
        this.init();
    }

    init() {
        this.canvas.addEventListener("mousedown", (e) => { 
            if(this.game.gameState === "PLAYING" && !this.game.isFiring) { 
                this.isAiming = true; 
                this.updateAim(e); 
            }
        });
        
        this.canvas.addEventListener("mousemove", (e) => { 
            if(this.isAiming) this.updateAim(e); 
        });
        
        this.canvas.addEventListener("mouseup", () => { 
            if(this.isAiming) { 
                this.isAiming = false; 
                this.game.startFire(); 
            }
        });
    }

    updateAim(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.targetX = e.clientX - rect.left;
        this.targetY = e.clientY - rect.top;
    }
}