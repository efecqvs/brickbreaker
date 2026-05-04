// src/systems/TextureGen.js

const palettes = [
    { base: '#704f35', highlight: '#8a6242', shadow: '#573d29', pattern: 'dirt' },            // 1: Dirt
    { base: '#704f35', highlight: '#548043', shadow: '#3b5a2f', pattern: 'grass' },           // 2: Grass Block
    { base: '#7d7d7d', highlight: '#959595', shadow: '#656565', pattern: 'stone' },           // 3: Stone (MC)
    { base: '#6e6e6e', highlight: '#888888', shadow: '#4d4d4d', pattern: 'cobble' },          // 4: Cobblestone
    { base: '#9c7349', highlight: '#b58c60', shadow: '#7a5530', pattern: 'wood' },            // 5: Wood Planks
    { base: '#4a3325', highlight: '#634735', shadow: '#362318', pattern: 'log' },             // 6: Wood Log
    { base: '#d3cc96', highlight: '#e8e2b3', shadow: '#b3aa72', pattern: 'sand' },            // 7: Sand
    { base: '#827f7f', highlight: '#a09c9c', shadow: '#595757', pattern: 'gravel' },          // 8: Gravel
    { base: '#7d7d7d', highlight: '#1a1a1a', shadow: '#444444', pattern: 'ore-mc' },          // 9: Coal Ore
    { base: '#7d7d7d', highlight: '#e1d5cc', shadow: '#968c83', pattern: 'ore-mc' },          // 10: Iron Ore
    { base: '#7d7d7d', highlight: '#fcee4b', shadow: '#c4b52b', pattern: 'ore-ter' },         // 11: Gold Ore (Terraria style)
    { base: '#7d7d7d', highlight: '#ff2222', shadow: '#990000', pattern: 'ore-mc' },          // 12: Redstone Ore
    { base: '#7d7d7d', highlight: '#2149c1', shadow: '#122c7a', pattern: 'ore-ter' },         // 13: Lapis Ore
    { base: '#7d7d7d', highlight: '#51e9f4', shadow: '#2c9ca3', pattern: 'ore-mc' },          // 14: Diamond Ore
    { base: '#7d7d7d', highlight: '#41f384', shadow: '#22a654', pattern: 'ore-ter' },         // 15: Emerald Ore
    { base: '#a84343', highlight: '#c45a5a', shadow: '#7a2828', pattern: 'bricks' },          // 16: Bricks
    { base: '#1a1423', highlight: '#3a2b4c', shadow: '#0b080f', pattern: 'obsidian' },        // 17: Obsidian
    { base: '#cf4000', highlight: '#ffa600', shadow: '#8a2500', pattern: 'lava' },            // 18: Lava
    { base: '#2b52ff', highlight: '#809fff', shadow: '#1631a6', pattern: 'water' },           // 19: Water
    { base: '#8fc1ff', highlight: '#c7e0ff', shadow: '#5c9aff', pattern: 'ice' },             // 20: Ice
    { base: '#6e2424', highlight: '#8c3333', shadow: '#451212', pattern: 'netherrack' },      // 21: Netherrack
    { base: '#544033', highlight: '#6e5444', shadow: '#33241b', pattern: 'soulsand' },        // 22: Soul Sand
    { base: '#c99f57', highlight: '#fff1ab', shadow: '#916d31', pattern: 'glowstone' },       // 23: Glowstone
    { base: '#6e2424', highlight: '#eee5e3', shadow: '#4d1a1a', pattern: 'ore-ter' },         // 24: Quartz Ore
    { base: '#5fc45f', highlight: '#99e899', shadow: '#3c943c', pattern: 'slime' },           // 25: Slime
    { base: '#c4c43d', highlight: '#e8e866', shadow: '#8f8f26', pattern: 'sponge' },          // 26: Sponge
    { base: '#dbd4a0', highlight: '#f0ebd0', shadow: '#a69f68', pattern: 'endstone' },        // 27: End Stone
    { base: '#a87ba8', highlight: '#c493c4', shadow: '#825882', pattern: 'bricks' },          // 28: Purpur
    { base: '#e6e6e6', highlight: '#ffffff', shadow: '#b3b3b3', pattern: 'metal' },           // 29: Iron Block
    { base: '#fcee4b', highlight: '#ffff8f', shadow: '#c4b52b', pattern: 'metal' },           // 30: Gold Block
    { base: '#51e9f4', highlight: '#b5fdff', shadow: '#2c9ca3', pattern: 'metal' },           // 31: Diamond Block
    { base: '#2d2d2d', highlight: '#5e5e5e', shadow: '#111111', pattern: 'bedrock' }          // 32: Bedrock
];

export const Textures = [];

function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function createTexture(index) {
    const canvas = document.createElement('canvas');
    const size = 16;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const p = palettes[index % palettes.length];
    
    // Fill Base
    ctx.fillStyle = p.base;
    ctx.fillRect(0, 0, size, size);

    // Seed per block so they look consistent but random
    let seed = index * 1337;

    const drawPixel = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
    };

    const noise = (intensity) => {
        for(let y=0; y<size; y++) {
            for(let x=0; x<size; x++) {
                let r = seededRandom(seed++);
                if (r < intensity) drawPixel(x, y, p.shadow);
                else if (r > 1 - intensity) drawPixel(x, y, p.highlight);
            }
        }
    };

    switch(p.pattern) {
        case 'dirt':
            noise(0.25);
            break;
        case 'grass':
            noise(0.2); // dirt noise
            // Draw grass top
            for(let y=0; y<5; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(y < 3 || (y === 3 && r < 0.7) || (y === 4 && r < 0.3)) {
                        drawPixel(x, y, p.highlight);
                    }
                }
            }
            break;
        case 'stone':
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.15) drawPixel(x, y, p.shadow);
                    else if(r > 0.85) drawPixel(x, y, p.highlight);
                }
            }
            break;
        case 'cobble':
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if ((x+y)%4 === 0 || (x-y)%4 === 0) drawPixel(x, y, p.shadow);
                    else if(r > 0.6) drawPixel(x, y, p.highlight);
                }
            }
            // Add some cobble outlines
            for(let i=0; i<8; i++) {
                drawPixel(Math.floor(seededRandom(seed++)*16), Math.floor(seededRandom(seed++)*16), '#333333');
            }
            break;
        case 'wood':
            // Vertical planks
            for(let x=0; x<size; x++) {
                if(x % 4 === 0) {
                    for(let y=0; y<size; y++) drawPixel(x, y, p.shadow);
                } else {
                    for(let y=0; y<size; y++) {
                        let r = seededRandom(seed++);
                        if(r < 0.2) drawPixel(x, y, p.shadow);
                        if(r > 0.8) drawPixel(x, y, p.highlight);
                    }
                }
            }
            break;
        case 'log':
            // Bark texture
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if (x % 3 === 0 || r < 0.2) drawPixel(x, y, p.shadow);
                }
            }
            break;
        case 'sand':
        case 'gravel':
        case 'endstone':
            noise(0.3);
            break;
        case 'ore-mc':
            // Stone base
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.1) drawPixel(x, y, '#5e5e5e');
                    else if(r > 0.9) drawPixel(x, y, '#999999');
                    else drawPixel(x, y, '#7d7d7d');
                }
            }
            // Ore clusters
            for(let i=0; i<6; i++) {
                let ox = Math.floor(seededRandom(seed++)*14)+1;
                let oy = Math.floor(seededRandom(seed++)*14)+1;
                drawPixel(ox, oy, p.highlight);
                drawPixel(ox+1, oy, p.base); // use base as the actual ore color from palette
                drawPixel(ox, oy+1, p.shadow);
                drawPixel(ox-1, oy, p.base);
            }
            break;
        case 'ore-ter':
            // Darker stone base (Terraria style)
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.2) drawPixel(x, y, '#4a4a4a');
                    else drawPixel(x, y, '#636363');
                }
            }
            // Shiny veins
            for(let i=0; i<8; i++) {
                let ox = Math.floor(seededRandom(seed++)*16);
                let oy = Math.floor(seededRandom(seed++)*16);
                drawPixel(ox, oy, p.base);
                if(seededRandom(seed++)>0.5) drawPixel(Math.min(15, ox+1), oy, p.highlight);
                if(seededRandom(seed++)>0.5) drawPixel(ox, Math.min(15, oy+1), p.shadow);
            }
            break;
        case 'bricks':
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    if (y % 4 === 0) drawPixel(x, y, p.shadow); // Horizontal mortar
                    else if ((y < 4 || (y >= 8 && y < 12)) && x % 8 === 0) drawPixel(x, y, p.shadow); // Vertical mortar 1
                    else if (((y >= 4 && y < 8) || y >= 12) && x % 8 === 4) drawPixel(x, y, p.shadow); // Vertical mortar 2
                    else {
                        let r = seededRandom(seed++);
                        if(r < 0.1) drawPixel(x, y, p.shadow);
                        if(r > 0.9) drawPixel(x, y, p.highlight);
                    }
                }
            }
            break;
        case 'obsidian':
            // Dark noisy with purple streaks
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.4) drawPixel(x, y, p.shadow);
                    else if ((x + y) % 6 === 0 && r > 0.7) drawPixel(x, y, p.highlight);
                }
            }
            break;
        case 'lava':
        case 'water':
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if (r < 0.1) drawPixel(x, y, p.highlight);
                    else if (r > 0.8) drawPixel(x, y, p.shadow);
                }
            }
            // Liquid waves
            for(let i=0; i<4; i++) {
                let wy = Math.floor(seededRandom(seed++) * size);
                for(let x=0; x<size; x++) {
                    if (x % 2 === 0) drawPixel(x, wy, p.highlight);
                }
            }
            break;
        case 'ice':
            // Translucent look
            ctx.fillStyle = p.base;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(0, 0, size, size);
            ctx.globalAlpha = 1.0;
            for(let i=0; i<10; i++) {
                drawPixel(Math.floor(seededRandom(seed++)*size), Math.floor(seededRandom(seed++)*size), p.highlight);
                drawPixel(Math.floor(seededRandom(seed++)*size), Math.floor(seededRandom(seed++)*size), p.shadow);
            }
            break;
        case 'metal':
            // Beveled edge
            ctx.fillStyle = p.highlight;
            ctx.fillRect(0, 0, size, 2);
            ctx.fillRect(0, 0, 2, size);
            ctx.fillStyle = p.shadow;
            ctx.fillRect(0, size-2, size, 2);
            ctx.fillRect(size-2, 0, 2, size);
            break;
        case 'slime':
            // Bouncy gooey look
            ctx.fillStyle = p.highlight;
            ctx.fillRect(2, 2, size-4, 2);
            ctx.fillRect(2, 2, 2, size-4);
            ctx.fillStyle = p.shadow;
            ctx.fillRect(size-4, 2, 2, size-4);
            ctx.fillRect(2, size-4, size-4, 2);
            // Inner core
            ctx.fillStyle = p.shadow;
            ctx.fillRect(6, 6, 4, 4);
            break;
        case 'soulsand':
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.3) drawPixel(x, y, p.shadow);
                    else if(r > 0.9) drawPixel(x, y, p.highlight);
                    // Draw face-like shapes occasionally
                    if(x%5===0 && y%5===0 && r > 0.5) {
                        drawPixel(x, y, '#22110c');
                        drawPixel(x+2, y, '#22110c');
                        drawPixel(x+1, y+2, '#22110c');
                    }
                }
            }
            break;
        case 'glowstone':
            // Clusters of bright yellow/orange
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.2) drawPixel(x, y, p.shadow);
                    else if ((Math.floor(x/3) + Math.floor(y/3)) % 2 === 0) drawPixel(x, y, p.highlight);
                }
            }
            break;
        case 'bedrock':
            // High contrast noise
            for(let y=0; y<size; y++) {
                for(let x=0; x<size; x++) {
                    let r = seededRandom(seed++);
                    if(r < 0.4) drawPixel(x, y, p.shadow); // almost black
                    else if(r > 0.7) drawPixel(x, y, p.highlight); // grey
                }
            }
            break;
        default:
            noise(0.2);
            break;
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
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    let crackDensity = (i + 1) * 6; // More crack pixels for 16x16
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    
    // Procedural branching cracks
    for(let j=0; j<crackDensity; j++) {
        let cx = Math.floor(Math.random() * 16);
        let cy = Math.floor(Math.random() * 16);
        ctx.fillRect(cx, cy, 1, 1);
        
        // Branch
        if(Math.random() > 0.3) {
            let dx = Math.random() > 0.5 ? 1 : -1;
            let dy = Math.random() > 0.5 ? 1 : -1;
            ctx.fillRect(Math.max(0, Math.min(15, cx+dx)), Math.max(0, Math.min(15, cy+dy)), 1, 1);
            if(Math.random() > 0.5) {
                ctx.fillRect(Math.max(0, Math.min(15, cx+dx*2)), Math.max(0, Math.min(15, cy+dy*2)), 1, 1);
            }
        }
    }
    Cracks.push(canvas);
}
