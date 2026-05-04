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
        const handleStart = (e) => { 
            e.preventDefault();
            if(this.game.gameState === "PLAYING" && !this.game.isFiring) { 
                this.isAiming = true; 
                this.updateAim(e); 
            }
        };

        const handleMove = (e) => { 
            e.preventDefault();
            if(this.isAiming) this.updateAim(e); 
        };

        const handleEnd = (e) => { 
            e.preventDefault();
            if(this.isAiming) { 
                this.isAiming = false; 
                this.game.startFire(); 
            }
        };

        this.canvas.addEventListener("mousedown", handleStart);
        this.canvas.addEventListener("touchstart", handleStart, {passive: false});
        
        this.canvas.addEventListener("mousemove", handleMove);
        this.canvas.addEventListener("touchmove", handleMove, {passive: false});
        
        this.canvas.addEventListener("mouseup", handleEnd);
        this.canvas.addEventListener("touchend", handleEnd, {passive: false});
    }

    updateAim(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if(e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        this.targetX = (clientX - rect.left) * scaleX;
        this.targetY = (clientY - rect.top) * scaleY;
    }
}