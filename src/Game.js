import { CONFIG, getBallColor } from './config.js';
import PoolManager from './systems/PoolManager.js';
import InputManager from './systems/InputManager.js';
import UpgradeSystem, { UPGRADE_POOL } from './systems/UpgradeSystem.js';
import Ball from './entities/Ball.js';
import Brick from './entities/Brick.js';
import PowerUp from './entities/PowerUp.js';
import XPOrb from './entities/XPOrb.js';
import FloatingText from './entities/FloatingText.js';

export default class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas; this.ctx = ctx; this.gameState = "START";
        this.ballsPool = new PoolManager(() => new Ball(), 500);
        this.bricksPool = new PoolManager(() => new Brick(), 300);
        this.pickupsPool = new PoolManager(() => new PowerUp(), 30);
        this.xpPool = new PoolManager(() => new XPOrb(), 200);
        this.textsPool = new PoolManager(() => new FloatingText(), 100);
        this.inputManager = new InputManager(canvas, this);
        this.upgradeSystem = new UpgradeSystem(this);
        this.ballChainCount = 1; this.baseBallValue = 1; this.turn = 1; window.pendingBalls = 0;
        this.stats = { magnetRadius: 50, critChance: 0.0, pierceChance: 0.0, mitosisChance: 0.0 };
        this.xp = 0; this.xpRequired = 30; this.level = 1; this.goldTotal = 0; this.diamondTotal = 0;
        this.fireX = this.canvas.width / 2; this.nextFireX = -1; this.isFiring = false;
        
        this.gameStats = { bricksBroken: 0, diamondsFound: 0, highestLevel: 1 };
        this.quests = [
            { id: 'q1', text: '100 Blok Kır', target: 100, type: 'bricksBroken', reward: 50, rewardType: 'gold', completed: false, claimed: false },
            { id: 'q2', text: 'Seviye 10\'a Ulaş', target: 10, type: 'highestLevel', reward: 5, rewardType: 'diamond', completed: false, claimed: false },
            { id: 'q3', text: '5 Elmas Bul', target: 5, type: 'diamondsFound', reward: 5, rewardType: 'diamond', completed: false, claimed: false },
            { id: 'q4', text: '500 Blok Kır', target: 500, type: 'bricksBroken', reward: 200, rewardType: 'gold', completed: false, claimed: false },
            { id: 'q5', text: 'Seviye 20\'ye Ulaş', target: 20, type: 'highestLevel', reward: 15, rewardType: 'diamond', completed: false, claimed: false }
        ];
        this.freezeTurns = 0;

        this.permanentStats = { extraStartingBalls: 0, magnetBoost: 0, xpBoost: 0, startingGold: 0 };
        this.launcherStats = { damageMultiplier: 1, fireSpeedBonus: 0, diamondLuck: 0 };
        this.shopItems = [
            { id: 'start_ball', name: 'Ekstra Başlangıç Topu', baseCost: 100, growth: 2, level: 0, desc: 'Her oyuna +1 fazla topla başla.' },
            { id: 'magnet_range', name: 'Mıknatıs Takviyesi', baseCost: 150, growth: 1.8, level: 0, desc: 'Toplama menzilini kalıcı olarak +20 artır.' },
            { id: 'xp_gain', name: 'Bilgi Kitabı', baseCost: 200, growth: 2.5, level: 0, desc: 'XP topladığında +%10 daha fazla XP kazan.' },
            { id: 'gold_stash', name: 'Altın Kesesi', baseCost: 50, growth: 1.5, level: 0, desc: 'Her oyuna +50 Altın ile başla.' }
        ];
        this.launcherItems = [
            { id: 'power_launcher', name: 'Güçlü Fırlatıcı', cost: 10, level: 0, maxLevel: 5, desc: 'Topların hasarını %20 artırır.' },
            { id: 'speed_launcher', name: 'Hızlı Fırlatıcı', cost: 15, level: 0, maxLevel: 5, desc: 'Topların fırlatılma hızını artırır.' },
            { id: 'diamond_drill', name: 'Elmas Matkabı', cost: 25, level: 0, maxLevel: 3, desc: 'Bloklardan elmas çıkma şansını artırır.' }
        ];
        this.currentShopTab = "upgrades";
        this.inventory = { iron: 0, redstone: 0, lapis: 0, emerald: 0, netherite: 0, obsidian: 0, coal: 0, gold_ore: 0 };
        
        this.loadGame(); // Kayıtlı verileri yükle
        this.initButtons(); 
        this.initPauseLogic();
    }

    saveGame() {
        const saveData = {
            gold: this.goldTotal,
            diamond: this.diamondTotal,
            inventory: this.inventory,
            permanentStats: this.permanentStats,
            launcherStats: this.launcherStats,
            gameStats: this.gameStats,
            shopLevels: this.shopItems.map(i => i.level),
            launcherLevels: this.launcherItems.map(i => i.level),
            questStatus: this.quests.map(q => ({ completed: q.completed, claimed: q.claimed }))
        };
        localStorage.setItem('megabonk_save', JSON.stringify(saveData));
    }

    loadGame() {
        // Oyun her açılıp kapandığında sıfırlanması için yükleme işlemi iptal edildi.
        // İsterseniz ileride açmak için alttaki satırları geri alabilirsiniz:
        // const saved = localStorage.getItem('megabonk_save');
        // if (!saved) return;
        // try { ... } catch(e) { ... }
        
        // Eski kayıtları da temizleyelim
        localStorage.removeItem('megabonk_save');
    }

    initPauseLogic() {
        window.addEventListener("keydown", (e) => { 
            if (e.key === "Escape") {
                const settingsScreen = document.getElementById("settings-screen");
                if (!settingsScreen.classList.contains("hidden")) {
                    settingsScreen.classList.add("hidden");
                } else {
                    this.togglePause(); 
                }
            }
        });
        document.getElementById("resume-button").onclick = () => this.togglePause();
        
        const uiPauseBtn = document.getElementById("ui-pause-btn");
        if(uiPauseBtn) uiPauseBtn.onclick = () => this.togglePause();

        const pSetBtn = document.getElementById("pause-settings-button");
        if(pSetBtn) pSetBtn.onclick = () => document.getElementById("settings-screen").classList.remove("hidden");
        const pQstBtn = document.getElementById("pause-quests-button");
        if(pQstBtn) pQstBtn.onclick = () => this.openQuests();
        document.getElementById("main-menu-button").onclick = () => { this.saveGame(); location.reload(); };
    }

    togglePause() {
        if (this.gameState === "PLAYING") { this.gameState = "PAUSED"; document.getElementById("pause-menu").classList.remove("hidden"); this.saveGame(); }
        else if (this.gameState === "PAUSED") { this.gameState = "PLAYING"; document.getElementById("pause-menu").classList.add("hidden"); this.loop(); }
    }

    initButtons() {
        document.getElementById("shop-button").onclick = () => this.openShop();
        document.getElementById("start-shop-button").onclick = () => this.openShop();
        document.getElementById("close-shop-button").onclick = () => this.closeShop();
        const qBtn1 = document.getElementById("quests-button"), qBtn2 = document.getElementById("go-quests-button"), qBtnClose = document.getElementById("close-quests-button");
        if(qBtn1) qBtn1.onclick = () => this.openQuests();
        if(qBtn2) qBtn2.onclick = () => this.openQuests();
        if(qBtnClose) qBtnClose.onclick = () => this.closeQuests();
        
        const goMenuBtn = document.getElementById("game-over-main-menu-button");
        if(goMenuBtn) goMenuBtn.onclick = () => { location.reload(); };

        const tabsContainer = document.querySelector(".shop-tabs");
        if(tabsContainer && !document.getElementById("tab-trade")) {
            const tabTrade = document.createElement("button"); tabTrade.id = "tab-trade"; tabTrade.innerText = "TAKAS"; tabsContainer.appendChild(tabTrade);
            tabTrade.onclick = () => { this.currentShopTab = "trade"; this.activateTab(tabTrade); };
        }
        const tUpg = document.getElementById("tab-upgrades"), tLau = document.getElementById("tab-launchers");
        if(tUpg) tUpg.onclick = () => { this.currentShopTab = "upgrades"; this.activateTab(tUpg); };
        if(tLau) tLau.onclick = () => { this.currentShopTab = "launchers"; this.activateTab(tLau); };
    }

    activateTab(activeBtn) {
        document.querySelectorAll(".shop-tabs button").forEach(b => b.classList.remove("active-tab"));
        if(activeBtn) activeBtn.classList.add("active-tab"); this.updateShopUI();
    }

    start() {
        document.getElementById("start-screen").classList.add("hidden"); document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("upgrade-screen").classList.add("hidden"); document.getElementById("shop-screen").classList.add("hidden");
        document.getElementById("quests-screen").classList.add("hidden"); document.getElementById("pause-menu").classList.add("hidden"); 
        document.getElementById("ui-bar").classList.remove("hidden");
        this.ballsPool.reset(); this.bricksPool.reset(); this.pickupsPool.reset(); this.xpPool.reset(); this.textsPool.reset();
        this.upgradeSystem = new UpgradeSystem(this);
        this.stats = { magnetRadius: 50 + (this.permanentStats.magnetBoost * 20), critChance: 0.0, pierceChance: 0.0, mitosisChance: 0.0 };
        this.ballChainCount = 1 + this.permanentStats.extraStartingBalls; 
        this.baseBallValue = 1; this.turn = 1; window.pendingBalls = 0; this.rowsSpawned = 0; this.fireX = this.canvas.width / 2;
        this.xp = 0; this.xpRequired = 30; this.level = 1; this.freezeTurns = 0;
        this.goldTotal = this.permanentStats.startingGold * 50 + (this.goldTotal || 0); // Mevcut altın üstüne ekle
        for(let i = 0; i < 4; i++) this.spawnNewRow();
        this.gameState = "PLAYING"; this.updateUI(); this.loop();
    }

    openShop() {
        this.prevGameState = this.gameState; this.gameState = "SHOP";
        document.getElementById("start-screen").classList.add("hidden"); document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("pause-menu").classList.add("hidden"); document.getElementById("quests-screen").classList.add("hidden");
        document.getElementById("shop-screen").classList.remove("hidden");
        this.currentShopTab = "upgrades"; this.activateTab(document.getElementById("tab-upgrades"));
    }

    closeShop() { document.getElementById("shop-screen").classList.add("hidden"); this.saveGame(); this.restorePrevState(); }

    openQuests() {
        this.prevGameState = this.gameState; this.gameState = "QUESTS";
        document.getElementById("start-screen").classList.add("hidden"); document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("pause-menu").classList.add("hidden"); document.getElementById("shop-screen").classList.add("hidden");
        document.getElementById("quests-screen").classList.remove("hidden");
        this.updateQuestsUI();
    }

    closeQuests() { document.getElementById("quests-screen").classList.add("hidden"); this.saveGame(); this.restorePrevState(); }

    restorePrevState() {
        if (this.prevGameState === "START") document.getElementById("start-screen").classList.remove("hidden");
        else if (this.prevGameState === "PAUSED") document.getElementById("pause-menu").classList.remove("hidden");
        else document.getElementById("game-over-screen").classList.remove("hidden");
        this.gameState = this.prevGameState;
    }

    updateQuestsUI() {
        this.quests.forEach(q => { let curr = this.gameStats[q.type] || 0; if(curr >= q.target) q.completed = true; });
        const list = document.getElementById("quests-list"); if(!list) return; list.innerHTML = "";
        this.quests.forEach(q => {
            const card = document.createElement("div"); let curr = Math.min(q.target, this.gameStats[q.type] || 0);
            let btnHtml = q.claimed ? `<div class="cost" style="color:#5fc45f;">TAMAMLANDI</div>` : (q.completed ? `<div class="cost" style="color:#fcee4b; cursor:pointer;">ÖDÜLÜ AL: ${q.reward} ${q.rewardType==='gold'?'Altın':'Elmas'}</div>` : `<div class="cost" style="color:#ccc;">İlerleme: ${curr} / ${q.target}</div>`);
            card.className = `shop-item ${ (q.claimed || !q.completed) ? 'disabled' : ''}`;
            card.innerHTML = `<h3>${q.text}</h3><p>Ödül: ${q.reward} ${q.rewardType==='gold'?'Altın':'Elmas'}</p>${btnHtml}`;
            if(q.completed && !q.claimed) card.onclick = () => this.claimQuest(q.id);
            list.appendChild(card);
        });
    }

    claimQuest(id) {
        const q = this.quests.find(x => x.id === id);
        if(q && q.completed && !q.claimed) { q.claimed = true; if(q.rewardType === 'gold') this.goldTotal += q.reward; else this.diamondTotal += q.reward; this.saveGame(); this.updateQuestsUI(); this.updateUI(); }
    }

    updateShopUI() {
        document.getElementById("shop-gold-val").innerText = Math.floor(this.goldTotal); document.getElementById("shop-diamond-val").innerText = this.diamondTotal;
        const list = document.getElementById("shop-items-list"); if(!list) return; list.innerHTML = "";
        if (this.currentShopTab === "upgrades") {
            this.shopItems.forEach(item => {
                const cost = Math.floor(item.baseCost * Math.pow(item.growth, item.level));
                const card = document.createElement("div"); card.className = `shop-item ${this.goldTotal < cost ? 'disabled' : ''}`;
                card.innerHTML = `<h3>${item.name} (v${item.level})</h3><p>${item.desc}</p><div class="cost">Maliyet: ${cost} Altın</div>`;
                card.onclick = () => { if (this.goldTotal >= cost) this.buyShopItem(item, cost); }; list.appendChild(card);
            });
        } else if (this.currentShopTab === "launchers") {
            this.launcherItems.forEach(item => {
                const card = document.createElement("div"); const isMax = item.level >= item.maxLevel;
                card.className = `shop-item ${ (this.diamondTotal < item.cost || isMax) ? 'disabled' : ''}`;
                card.innerHTML = `<h3>${item.name} (${item.level}/${item.maxLevel})</h3><p>${item.desc}</p><div class="cost">${isMax ? 'MAX' : 'Maliyet: ' + item.cost + ' Elmas'}</div>`;
                card.onclick = () => { if (this.diamondTotal >= item.cost && !isMax) this.buyLauncherItem(item); }; list.appendChild(card);
            });
        } else if (this.currentShopTab === "trade") {
            const trades = [
                { id: 'coal', name: 'Kömür', amount: 10, reward: 20, type: 'gold' }, { id: 'iron', name: 'Demir', amount: 5, reward: 50, type: 'gold' },
                { id: 'redstone', name: 'Kızıltaş', amount: 10, reward: 100, type: 'gold' }, { id: 'lapis', name: 'Lapis', amount: 8, reward: 150, type: 'gold' },
                { id: 'emerald', name: 'Zümrüt', amount: 1, reward: 2, type: 'diamond' }, { id: 'netherite', name: 'Netherite', amount: 1, reward: 10, type: 'diamond' },
                { id: 'obsidian', name: 'Obsidyen', amount: 5, reward: 300, type: 'gold' }
            ];
            trades.forEach(t => {
                const card = document.createElement("div"); const hasEnough = this.inventory[t.id] >= t.amount;
                card.className = `shop-item ${!hasEnough ? 'disabled' : ''}`;
                card.innerHTML = `<h3>${t.name} Sat</h3><p>Elinizde: ${this.inventory[t.id]}</p><div class="cost">${t.amount} Adet -> ${t.reward} ${t.type === 'gold' ? 'Altın' : 'Elmas'}</div>`;
                card.onclick = () => { if (hasEnough) { this.inventory[t.id] -= t.amount; if(t.type === 'gold') this.goldTotal += t.reward; else this.diamondTotal += t.reward; this.saveGame(); this.updateShopUI(); this.updateUI(); } }; list.appendChild(card);
            });
        }
    }

    buyShopItem(item, cost) {
        this.goldTotal -= cost; item.level++;
        if (item.id === 'start_ball') this.permanentStats.extraStartingBalls++;
        if (item.id === 'magnet_range') this.permanentStats.magnetBoost++;
        if (item.id === 'xp_gain') this.permanentStats.xpBoost++;
        if (item.id === 'gold_stash') this.permanentStats.startingGold++;
        this.saveGame(); this.updateShopUI(); this.updateUI();
    }

    buyLauncherItem(item) {
        this.diamondTotal -= item.cost; item.level++;
        if (item.id === 'power_launcher') this.launcherStats.damageMultiplier += 0.2;
        if (item.id === 'speed_launcher') this.launcherStats.fireSpeedBonus += 1;
        if (item.id === 'diamond_drill') this.launcherStats.diamondLuck += 0.05;
        this.saveGame(); this.updateShopUI(); this.updateUI();
    }

    gainXp(amount) {
        if(this.gameState !== "PLAYING") return;
        this.xp += amount * (1 + (this.permanentStats.xpBoost * 0.1));
        this.goldTotal += Math.floor(amount / 2);
        if(this.xp >= this.xpRequired) { this.xp -= this.xpRequired; this.level++; this.xpRequired = Math.floor(this.xpRequired * 1.6); this.gameStats.highestLevel = Math.max(this.gameStats.highestLevel, this.level); this.showUpgradeSelection(); }
        this.updateUI();
    }

    showUpgradeSelection() {
        this.gameState = "UPGRADE"; const screen = document.getElementById("upgrade-screen"), list = document.getElementById("upgrade-list"); list.innerHTML = "";
        let options = this.upgradeSystem.rollUpgrades(3); if(options.length === 0) { this.gameState = "PLAYING"; return; }
        options.forEach(opt => {
            const card = document.createElement("div"); card.className = "upgrade-card"; card.style.borderColor = opt.rarity.color;
            card.innerHTML = `<div style="color: ${opt.rarity.color}; font-size: 0.6rem;">${opt.rarity.name}</div><h3>${opt.name}</h3><p>${opt.getDesc(this.upgradeSystem.playerLevels[opt.id])}</p>`;
            card.onclick = () => { this.upgradeSystem.applyUpgrade(opt.id); screen.classList.add("hidden"); this.gameState = "PLAYING"; this.saveGame(); this.loop(); }; list.appendChild(card);
        });
        screen.classList.remove("hidden");
    }

    spawnNewRow() {
        const activeBricks = this.bricksPool.getActive();
        activeBricks.forEach(b => { b.gridY++; b.updatePos(); if(b.targetY > this.canvas.height - 100) { this.gameState = "GAMEOVER"; document.getElementById("game-over-screen").classList.remove("hidden"); document.getElementById("final-score").innerText = `Level: ${this.level}`; this.saveGame(); } });
        this.pickupsPool.getActive().forEach(p => { p.gridY++; p.updatePos(); });
        this.rowsSpawned++;
        let textureIndex = 0, isOre = false, isObsidian = false;
        if (this.rowsSpawned <= 4) textureIndex = 1; else if (this.rowsSpawned <= 10) textureIndex = 0; 
        else {
            let roll = Math.random();
            if (roll > 0.4) { isOre = true; if(this.rowsSpawned > 25 && Math.random() < 0.02) textureIndex = 21; else textureIndex = 8 + Math.floor(Math.random() * 7); }
            else if (this.rowsSpawned > 15 && Math.random() < 0.1) { isObsidian = true; textureIndex = 17; }
            else textureIndex = 2 + Math.floor(Math.random() * 2);
        }
        let spawnChance = Math.min(0.7, 0.35 + (this.level * 0.03));
        for(let i=0; i<CONFIG.BRICK_COLS; i++) {
            let r = Math.random();
            if(r < spawnChance) {
                let finalTex = (isOre || isObsidian || Math.random() > 0.9) ? textureIndex : (Math.random() > 0.8 ? 8 + Math.floor(Math.random() * 7) : textureIndex);
                let hpMultiplier = Math.ceil(this.rowsSpawned / 8);
                if (finalTex === 17) hpMultiplier *= 5; else if (finalTex >= 13 && finalTex <= 15) hpMultiplier *= 2; else if (finalTex === 21) hpMultiplier *= 3;
                this.bricksPool.get().spawn(i, 0, hpMultiplier * this.baseBallValue, finalTex);
            } else if(r > 0.96) this.pickupsPool.get().spawn(i, 0);
        }
    }

    nextTurn() {
        this.isFiring = false; if(this.nextFireX !== -1) this.fireX = this.nextFireX; this.nextFireX = -1;
        this.ballChainCount += window.pendingBalls; window.pendingBalls = 0; this.turn++; 
        if(this.gameState === "PLAYING") {
            if (this.freezeTurns > 0) { this.freezeTurns--; this.textsPool.get().spawn(this.canvas.width / 2, this.canvas.height / 2, `BUZLU: ${this.freezeTurns} TUR`, "#33ccff"); }
            else {
                const activeBricks = this.bricksPool.getActive(); let maxGridY = 0; activeBricks.forEach(b => { if(b.gridY > maxGridY) maxGridY = b.gridY; });
                let rowsToSpawn = 1; if (maxGridY < 6) { if(this.level >= 10) rowsToSpawn = 3; else if(this.level >= 5) rowsToSpawn = 2; }
                for(let i=0; i<rowsToSpawn; i++) this.spawnNewRow();
            }
            if(this.turn % 10 === 0) this.baseBallValue *= 2; this.updateUI(); this.saveGame();
        }
    }

    startFire() {
        if (this.isFiring || this.ballsPool.getActive().length > 0) return;
        this.isFiring = true; this.ballsToFire = this.ballChainCount; this.fireTimer = 0;
        let dx = this.inputManager.targetX - this.fireX, dy = this.inputManager.targetY - (this.canvas.height - 20), dist = Math.hypot(dx, dy);
        this.shootDX = dx / dist; this.shootDY = dy / dist; if(this.shootDY > -0.1) this.shootDY = -0.1;
    }

    fireLaser(gridX) {
        const activeBricks = this.bricksPool.getActive();
        let hitCount = 0;
        activeBricks.forEach(b => {
            if (b.gridX === gridX) {
                b.takeDamage(this.baseBallValue * 10); // Deals 10x base damage
                this.textsPool.get().spawn(b.x + b.w/2, b.y + b.h/2, "ZAP!", "#ff3333");
                hitCount++;
            }
        });
        if (hitCount > 0 && window.audioController) window.audioController.playSound('hit');
    }

    updateUI() {
        const uiLevel = document.getElementById("ui-level"), uiGold = document.getElementById("ui-gold"), uiDiamond = document.getElementById("ui-diamond"), uiXpText = document.getElementById("ui-xp-text"), xpFill = document.getElementById("ui-xp-fill");
        if(uiLevel) uiLevel.innerText = `Lvl: ${this.level}`; if(uiGold) uiGold.innerText = `Altın: ${Math.floor(this.goldTotal)}`;
        if(uiDiamond) uiDiamond.innerText = `Elmas: ${this.diamondTotal}`; if(uiXpText) uiXpText.innerText = `${Math.floor(this.xp)} / ${this.xpRequired} XP`;
        if(xpFill) xpFill.style.width = `${Math.min(100, (this.xp/this.xpRequired)*100)}%`;
    }

    loop() {
        if(this.gameState !== "PLAYING") return; requestAnimationFrame(() => this.loop());
        let bgColor = (this.rowsSpawned <= 7) ? "#87ceeb" : (this.rowsSpawned <= 20 ? "#3b3b3b" : (this.rowsSpawned <= 40 ? "#4a0000" : "#14002e"));
        if (this.freezeTurns > 0) bgColor = "#1e3c5a"; 
        this.ctx.fillStyle = bgColor; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0,0,0,0.1)"; for(let i=0; i<this.canvas.width; i+=32) { for(let j=0; j<this.canvas.height; j+=32) { if((Math.floor(i/32)+Math.floor(j/32))%2===0) this.ctx.fillRect(i,j,32,32); } }
        const activeBalls = this.ballsPool.getActive(), activeBricks = this.bricksPool.getActive(), activePickups = this.pickupsPool.getActive(), activeOrbs = this.xpPool.getActive(), activeTexts = this.textsPool.getActive();
        if(this.inputManager.isAiming && !this.isFiring) {
            let dx = this.inputManager.targetX - this.fireX, dy = this.inputManager.targetY - (this.canvas.height - 20), dist = Math.hypot(dx, dy);
            if (dist > 0 && dy < -0.1) {
                let dirX = dx / dist, dirY = dy / dist, simX = this.fireX, simY = this.canvas.height - 20, radius = 5;
                this.ctx.beginPath(); this.ctx.setLineDash([8, 8]); this.ctx.moveTo(simX, simY); this.ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; this.ctx.lineWidth = 2;
                let bounces = 0, steps = 0;
                while(bounces < 3 && steps < 150) {
                    simX += dirX * 10; simY += dirY * 10; steps++;
                    let hitWall = false;
                    if (simX + radius > this.canvas.width || simX - radius < 0) { simX = (simX + radius > this.canvas.width) ? this.canvas.width - radius : radius; dirX *= -1; hitWall = true; }
                    if (simY - radius < 0) { simY = radius; dirY *= -1; hitWall = true; }
                    if (hitWall) { this.ctx.lineTo(simX, simY); bounces++; }
                    let hitBrick = false;
                    for (let b of activeBricks) { if (simX + radius > b.x && simX - radius < b.x + b.w && simY + radius > b.y && simY - radius < b.y + b.h) { hitBrick = true; break; } }
                    if (hitBrick || simY + radius > this.canvas.height - 15) { this.ctx.lineTo(simX, simY); break; }
                }
                this.ctx.stroke(); this.ctx.setLineDash([]); this.ctx.closePath();
            }
        }
        if(this.isFiring && this.ballsToFire > 0) {
            this.fireTimer++; if(this.fireTimer > (2 - this.launcherStats.fireSpeedBonus)) { this.fireTimer = 0; this.ballsPool.get().spawn(this.fireX, this.canvas.height-25, this.shootDX, this.shootDY, this.baseBallValue * this.launcherStats.damageMultiplier); this.ballsToFire--; }
        }
        activeBalls.forEach(ball => { ball.update(this.canvas, activeBricks, activePickups, (retX) => { if(this.nextFireX === -1) this.nextFireX = retX; }, this.fireX, this.stats, this.ballsPool, this.textsPool); ball.draw(this.ctx); });
        activeBricks.forEach(brick => { 
            brick.update(); brick.draw(this.ctx); 
            if(!brick.active) { 
                this.gameStats.bricksBroken++; let oreName = "", oreId = "", color = "#fff"; const tex = brick.textureOverride;
                if(tex === 8) { oreName = "Kömür"; oreId = "coal"; color = "#333"; } else if(tex === 9) { oreName = "Demir"; oreId = "iron"; color = "#ced4da"; }
                else if(tex === 10) { let r = Math.ceil(this.rowsSpawned / 2); this.goldTotal += r; this.textsPool.get().spawn(brick.x + brick.w/2, brick.y, `+${r} Altın`, "#fcee4b"); }
                else if(tex === 11) { oreName = "Kızıltaş"; oreId = "redstone"; color = "#ff4d4d"; } else if(tex === 12) { oreName = "Lapis"; oreId = "lapis"; color = "#4d79ff"; }
                else if(tex === 13) { this.diamondTotal += 1; this.gameStats.diamondsFound++; this.textsPool.get().spawn(brick.x + brick.w/2, brick.y, "+1 Elmas", "#51e9f4"); }
                else if(tex === 14) { oreName = "Zümrüt"; oreId = "emerald"; color = "#51f470"; } else if(tex === 21) { oreName = "Netherite"; oreId = "netherite"; color = "#4d3a3a"; } else if(tex === 17) { oreName = "Obsidyen"; oreId = "obsidian"; color = "#1a1a1a"; }
                if(oreId) { this.inventory[oreId]++; this.textsPool.get().spawn(brick.x + brick.w/2, brick.y, `+1 ${oreName}`, color); }
                for(let i=0; i<2; i++) this.xpPool.get().spawn(brick.x+brick.w/2, brick.y+brick.h/2, 1); 
            } 
        });
        activeOrbs.forEach(orb => { let c = orb.update(this.canvas, this.fireX, this.stats); if(c > 0) this.gainXp(c); orb.draw(this.ctx); });
        activeTexts.forEach(txt => { txt.update(); txt.draw(this.ctx); });
        activePickups.forEach(p => { p.update(); p.draw(this.ctx); });
        this.drawUpgrades(this.ctx);
        if(this.isFiring && this.ballsToFire === 0 && this.ballsPool.getActive().length === 0) this.nextTurn();
        this.ctx.save(); this.ctx.translate(this.fireX, this.canvas.height - 20); let angle = -Math.PI / 2;
        if (this.inputManager.isAiming || this.isFiring) { let dx = this.inputManager.targetX - this.fireX, dy = this.inputManager.targetY - (this.canvas.height - 20); angle = Math.atan2(dy, dx); }
        this.ctx.fillStyle = "#333"; this.ctx.beginPath(); this.ctx.arc(0, 5, 14, Math.PI, 0); this.ctx.fill(); this.ctx.strokeStyle = "#000"; this.ctx.lineWidth = 2; this.ctx.stroke();
        this.ctx.rotate(angle); this.ctx.fillStyle = "#555"; this.ctx.fillRect(0, -7, 22, 14); this.ctx.strokeStyle = "#000"; this.ctx.strokeRect(0, -7, 22, 14);
        this.ctx.fillStyle = getBallColor(this.baseBallValue); this.ctx.fillRect(18, -9, 6, 18); this.ctx.strokeRect(18, -9, 6, 18); this.ctx.restore();
        if(!this.isFiring) { this.ctx.fillStyle = "#fff"; this.ctx.font = "bold 14px monospace"; this.ctx.textAlign = "center"; this.ctx.fillText("x" + this.ballChainCount, this.fireX, this.canvas.height - 40); }
    }

    drawUpgrades(ctx) {
        const levels = this.upgradeSystem.playerLevels;
        let x = 10, y = this.canvas.height - 45, size = 22, spacing = 10;
        for (const id in levels) {
            const level = levels[id];
            if (level > 0) {
                const upg = UPGRADE_POOL[id]; if (!upg) continue;
                ctx.shadowBlur = 5; ctx.shadowColor = upg.shadowColor || upg.rarity.color; ctx.fillStyle = "#111"; ctx.fillRect(x, y, size, size);
                ctx.strokeStyle = upg.rarity.color; ctx.lineWidth = 2; ctx.strokeRect(x, y, size, size);
                ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
                ctx.fillText(upg.name[0], x + size/2, y + size/2 + 5);
                ctx.fillStyle = upg.rarity.color; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.fillText("v" + level, x + size - 2, y + size - 2);
                x += size + spacing;
            }
        }
        ctx.textAlign = "left";
    }
}