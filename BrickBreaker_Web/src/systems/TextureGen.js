const palettes = [
    { base: '#866043', highlight: '#9f7351', shadow: '#5a3f2b', pattern: 'noise' },        // 1: Dirt
    { base: '#866043', highlight: '#548043', shadow: '#3b5a2f', pattern: 'top-grass' },    // 2: Grass Block
    { base: '#7d7d7d', highlight: '#999999', shadow: '#5e5e5e', pattern: 'noise' },        // 3: Stone
    { base: '#6e6e6e', highlight: '#8a8a8a', shadow: '#4d4d4d', pattern: 'cobble' },       // 4: Cobblestone
    { base: '#b48358', highlight: '#cda272', shadow: '#8c613c', pattern: 'planks' },       // 5: Wood Planks
    { base: '#5c4033', highlight: '#704f3f', shadow: '#422c23', pattern: 'bark' },         // 6: Wood Log
    { base: '#dbd3a0', highlight: '#e8e1b7', shadow: '#c4bb85', pattern: 'noise' },        // 7: Sand
    { base: '#827f7f', highlight: '#9e9a9a', shadow: '#5e5b5b', pattern: 'noise' },        // 8: Gravel
    { base: '#7d7d7d', highlight: '#1a1a1a', shadow: '#5e5e5e', pattern: 'ore' },          // 9: Coal Ore
    { base: '#7d7d7d', highlight: '#e1d5cc', shadow: '#5e5e5e', pattern: 'ore' },          // 10: Iron Ore
    { base: '#7d7d7d', highlight: '#fcee4b', shadow: '#5e5e5e', pattern: 'ore' },          // 11: Gold Ore
    { base: '#7d7d7d', highlight: '#ff0000', shadow: '#5e5e5e', pattern: 'ore' },          // 12: Redstone Ore
    { base: '#7d7d7d', highlight: '#2149c1', shadow: '#5e5e5e', pattern: 'ore' },          // 13: Lapis Ore
    { base: '#7d7d7d', highlight: '#51e9f4', shadow: '#5e5e5e', pattern: 'ore' },          // 14: Diamond Ore
    { base: '#7d7d7d', highlight: '#41f384', shadow: '#5e5e5e', pattern: 'ore' },          // 15: Emerald Ore
    { base: '#993333', highlight: '#b24747', shadow: '#732626', pattern: 'bricks' },       // 16: Bricks
    { base: '#14121d', highlight: '#2a223c', shadow: '#09080e', pattern: 'noise' },        // 17: Obsidian
    { base: '#cf4000', highlight: '#ff7700', shadow: '#992200', pattern: 'fluid' },        // 18: Lava
    { base: '#2b52ff', highlight: '#4775ff', shadow: '#1a3acc', pattern: 'fluid' },        // 19: Water
    { base: '#7daaff', highlight: '#99c2ff', shadow: '#5e8aff', pattern: 'border' },       // 20: Ice
    { base: '#6e2424', highlight: '#8c3333', shadow: '#4d1a1a', pattern: 'noise' },        // 21: Netherrack
    { base: '#544033', highlight: '#6e5444', shadow: '#3b2c23', pattern: 'noise' },        // 22: Soul Sand
    { base: '#c99f57', highlight: '#e6bd73', shadow: '#a68242', pattern: 'noise' },        // 23: Glowstone
    { base: '#6e2424', highlight: '#eee5e3', shadow: '#4d1a1a', pattern: 'ore' },          // 24: Quartz Ore
    { base: '#5fc45f', highlight: '#7be07b', shadow: '#43a343', pattern: 'border' },       // 25: Slime
    { base: '#c4c43d', highlight: '#e0e052', shadow: '#a3a329', pattern: 'noise' },        // 26: Sponge
    { base: '#dbd4a0', highlight: '#e8e2b7', shadow: '#bdab7b', pattern: 'noise' },        // 27: End Stone
    { base: '#a87ba8', highlight: '#c493c4', shadow: '#825882', pattern: 'bricks' },       // 28: Purpur
    { base: '#d9d9d9', highlight: '#ffffff', shadow: '#a6a6a6', pattern: 'border' },       // 29: Iron Block
    { base: '#fcee4b', highlight: '#fdf57c', shadow: '#d1c22a', pattern: 'border' },       // 30: Gold Block
    { base: '#51e9f4', highlight: '#7ef5fc', shadow: '#31b7c2', pattern: 'border' },       // 31: Diamond Block
    { base: '#2d2d2d', highlight: '#4a4a4a', shadow: '#1a1a1a', pattern: 'noise' }         // 32: Bedrock
];

export const Textures = [];

function createTexture(index) {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    
    // Kesinlikle arka planı saydamsız siyah yap (Her ihtimale karşı)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 8, 8);
    
    const p = palettes[index % palettes.length];
    
    for(let y=0; y<8; y++) {
        for(let x=0; x<8; x++) {
            let color = p.base;
            let r = Math.random();
            
            if(p.pattern === 'noise' || p.pattern === 'fluid') {
                if(r < 0.2) color = p.shadow;
                else if(r > 0.8) color = p.highlight;
            } else if(p.pattern === 'top-grass') {
                if(y < 2) color = p.highlight; 
                else if (y === 2 && r < 0.5) color = p.highlight;
                else if(r < 0.2) color = p.shadow;
            } else if(p.pattern === 'ore') {
                if(r < 0.15) color = p.highlight;
                else if(r < 0.3) color = p.shadow;
            } else if(p.pattern === 'cobble') {
                if((x+y)%2===0) color = p.shadow;
                else if(r > 0.7) color = p.highlight;
            } else if(p.pattern === 'bricks') {
                if(y%4===0 || (y%4===2 && x%4===0) || (y%4!==2 && x%4===2)) color = p.shadow;
                else color = p.base;
            } else if(p.pattern === 'planks') {
                if(y%4===0) color = p.shadow;
                else if(r>0.8) color = p.highlight;
            } else if(p.pattern === 'border') {
                if(x===0||y===0) color = p.highlight;
                else if(x===7||y===7) color = p.shadow;
                else color = p.base;
            } else {
                if(r < 0.2) color = p.shadow;
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return canvas;
}

// Generate the 32 textures
for(let i=0; i<32; i++) {
    Textures.push(createTexture(i));
}

// Generate Cracks (0 to 9 damage stages)
export const Cracks = [];
for(let i=0; i<10; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    
    let crackDensity = (i + 1) * 2; // How many crack pixels to draw
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    
    // Procedural simple cracks
    for(let j=0; j<crackDensity; j++) {
        let cx = Math.floor(Math.random() * 8);
        let cy = Math.floor(Math.random() * 8);
        ctx.fillRect(cx, cy, 1, 1);
        
        // Sometimes extend the crack
        if(Math.random() > 0.5) {
            let dx = Math.random() > 0.5 ? 1 : -1;
            let dy = Math.random() > 0.5 ? 1 : -1;
            ctx.fillRect(Math.max(0, Math.min(7, cx+dx)), Math.max(0, Math.min(7, cy+dy)), 1, 1);
        }
    }
    Cracks.push(canvas);
}
