export const RARITY = {
    COMMON: { name: 'Yaygın', color: '#b0c4de', weight: 100 },
    RARE: { name: 'Nadir', color: '#4da6ff', weight: 50 },
    EPIC: { name: 'Epik', color: '#b366ff', weight: 20 },
    LEGENDARY: { name: 'Efsanevi', color: '#ffb347', weight: 5 }
};

export const UPGRADE_POOL = {
    magnet: {
        id: 'magnet', name: 'Kara Delik', rarity: RARITY.COMMON, maxLevel: 5,
        getDesc: (lvl) => `Gümüş çekme menzili artar (Seviye ${lvl+1})`,
        apply: (stats) => { stats.magnetRadius += 40; }
    },
    extra_ball: {
        id: 'extra_ball', name: 'Cephane', rarity: RARITY.COMMON, maxLevel: 10,
        getDesc: (lvl) => `Her tura fazladan +1 topla başla (Seviye ${lvl+1})`,
        apply: (stats, game) => { game.ballChainCount++; }
    },
    crit_chance: {
        id: 'crit_chance', name: 'Kritik Vuruş', rarity: RARITY.RARE, maxLevel: 5,
        getDesc: (lvl) => `+%10 İhtimalle 3X Hasar vurursun (Seviye ${lvl+1})`,
        apply: (stats) => { stats.critChance += 0.10; }
    },
    power: {
        id: 'power', name: 'Saf Güç', rarity: RARITY.RARE, maxLevel: 5,
        getDesc: (lvl) => `Topların temel gücünü 2 katına çıkarır (Seviye ${lvl+1})`,
        apply: (stats, game) => { game.baseBallValue *= 2; }
    },
    piercing: {
        id: 'piercing', name: 'Delici Çekirdek', rarity: RARITY.EPIC, maxLevel: 3,
        getDesc: (lvl) => `Topların sekmek yerine %${(lvl+1)*15} ihtimalle bloğu delip geçer!`,
        apply: (stats) => { stats.pierceChance += 0.15; }
    },
    mitosis: {
        id: 'mitosis', name: 'Hücre Bölünmesi', rarity: RARITY.LEGENDARY, maxLevel: 3,
        getDesc: (lvl) => `Top bloğa vurunca %${(lvl+1)*3} ihtimalle 2'ye bölünür.`,
        apply: (stats) => { stats.mitosisChance += 0.03; }
    }
};

export default class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.playerLevels = {
            magnet: 0, extra_ball: 0, crit_chance: 0, 
            power: 0, piercing: 0, mitosis: 0
        };
    }

    getAvailablePool() {
        let pool = [];
        for (const key in UPGRADE_POOL) {
            let upg = UPGRADE_POOL[key];
            if (this.playerLevels[key] < upg.maxLevel) {
                pool.push(upg);
            }
        }
        return pool;
    }

    rollUpgrades(count = 3) {
        let pool = this.getAvailablePool();
        if (pool.length === 0) return []; // Havuz bitti

        let choices = [];
        for (let i = 0; i < count; i++) {
            if (pool.length === 0) break;

            // Weighted Random (Ağırlıklı Seçim)
            let totalWeight = pool.reduce((sum, item) => sum + item.rarity.weight, 0);
            let rand = Math.random() * totalWeight;
            
            let selectedIndex = 0;
            for (let j = 0; j < pool.length; j++) {
                rand -= pool[j].rarity.weight;
                if (rand <= 0) {
                    selectedIndex = j;
                    break;
                }
            }

            choices.push(pool[selectedIndex]);
            // Aynı seçenekte iki kez çıkmasın diye havuzdan çıkar
            pool.splice(selectedIndex, 1); 
        }
        return choices;
    }

    applyUpgrade(upgradeId) {
        let upg = UPGRADE_POOL[upgradeId];
        this.playerLevels[upgradeId]++;
        upg.apply(this.game.stats, this.game);
    }
}