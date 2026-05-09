import Game from './Game.js';
import { audioController } from './audio.js';

window.onload = () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    
    window.gameInstance = new Game(canvas, ctx);
    
    // Ayarları yükle
    const savedDamageText = localStorage.getItem('brickbreak_damageTexts');
    window.gameInstance.showDamageTexts = savedDamageText !== null ? savedDamageText === 'true' : true;

    // Kullanıcı etkileşimiyle ses motorunu başlat (Web ve Mobil için)
    const startAudio = () => {
        audioController.resumeContext();
        if(!audioController.musicPlaying && audioController.bgm.volume > 0) {
            audioController.startMusic();
        }
    };
    ['click', 'touchstart', 'mousedown'].forEach(evt => {
        document.body.addEventListener(evt, startAudio, { once: true });
    });

    document.getElementById("start-button").onclick = () => {
        audioController.isMainMenu = false;
        audioController.stopMusic();
        window.gameInstance.start();
    };
    
    document.getElementById("restart-button").onclick = () => {
        audioController.isMainMenu = false;
        audioController.stopMusic();
        window.gameInstance.start();
    };
    
    // Ayarlar Menüsü İşlevleri
    const settingsBtn = document.getElementById("settings-button");
    if(settingsBtn) {
        settingsBtn.onclick = () => {
            document.getElementById("settings-screen").classList.remove("hidden");
        };
    }

    document.getElementById("close-settings-button").onclick = () => {
        document.getElementById("settings-screen").classList.add("hidden");
    };

    // Bilgi Menüsü İşlevleri
    const infoBtn = document.getElementById("info-button");
    if(infoBtn) {
        infoBtn.onclick = () => {
            document.getElementById("info-screen").classList.remove("hidden");
        };
    }
    const closeInfoBtn = document.getElementById("close-info-button");
    if(closeInfoBtn) {
        closeInfoBtn.onclick = () => {
            document.getElementById("info-screen").classList.add("hidden");
        };
    }

    const musicVolInput = document.getElementById("music-volume");
    const musicVolLabel = document.getElementById("music-vol-label");
    
    // UI Başlangıç değerleri
    musicVolInput.value = Math.round(audioController.bgm.volume * 100);
    musicVolLabel.innerText = musicVolInput.value + "%";

    const sfxToggle = document.getElementById("sfx-toggle");
    sfxToggle.checked = audioController.sfxEnabled;

    const damageTextToggle = document.getElementById("damage-text-toggle");
    damageTextToggle.checked = window.gameInstance.showDamageTexts;

    musicVolInput.oninput = (e) => {
        musicVolLabel.innerText = e.target.value + "%";
        audioController.setMusicVolume(e.target.value);
    };

    sfxToggle.onchange = (e) => {
        audioController.setSfxEnabled(e.target.checked);
    };

    damageTextToggle.onchange = (e) => {
        window.gameInstance.showDamageTexts = e.target.checked;
        localStorage.setItem('brickbreak_damageTexts', e.target.checked.toString());
    };

    const exitBtn = document.getElementById("exit-button");
    if (exitBtn) {
        exitBtn.onclick = () => window.close();
    }
};