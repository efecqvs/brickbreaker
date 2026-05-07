// src/audio.js
class AudioController {
    constructor() {
        // SFX için Web Audio API
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.ctx.destination);
        this.sfxGain.gain.value = 0.5;

        // Ayarları localStorage'dan yükle
        const savedVolume = localStorage.getItem('brickbreak_musicVolume');
        const savedSfx = localStorage.getItem('brickbreak_sfxEnabled');

        this.sfxEnabled = savedSfx !== null ? savedSfx === 'true' : true;
        this.musicPlaying = false;
        this.isMainMenu = true; // Sadece ana menüde çalsın
        
        // Arka Plan Müziği için HTML5 Audio (Kullanıcının MP3 dosyası)
        this.bgm = new Audio('bgm.mp3');
        this.bgm.loop = true;
        this.bgm.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
        
        // Mümkünse hemen başlat (Electron'da işe yarar)
        this.startMusic();
    }

    resumeContext() {
        if(this.ctx.state !== 'running') {
            this.ctx.resume();
        }
    }

    setMusicVolume(vol) { // 0'dan 100'e
        const volume = vol / 100;
        this.bgm.volume = volume;
        localStorage.setItem('brickbreak_musicVolume', volume.toString());
        if(volume === 0) {
            this.stopMusic();
        } else if (!this.musicPlaying && volume > 0 && this.isMainMenu) {
            this.startMusic();
        }
    }

    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
        localStorage.setItem('brickbreak_sfxEnabled', enabled.toString());
    }

    playHitSound() {
        if (!this.sfxEnabled || this.ctx.state !== 'running') return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        // Çarpma sesi
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    startMusic() {
        this.resumeContext();
        if(this.bgm.volume === 0 || !this.isMainMenu) return;
        if(this.musicPlaying) return;
        
        this.bgm.play().then(() => {
            this.musicPlaying = true;
        }).catch(err => {
            console.error("Otomatik oynatma engellendi veya müzik yüklenemedi:", err);
        });
    }

    stopMusic() {
        this.musicPlaying = false;
        this.bgm.pause();
    }
}

export const audioController = new AudioController();
