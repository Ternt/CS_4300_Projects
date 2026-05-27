(() => {
"use strict";

;// CONCATENATED MODULE: ./src/style.css
// extracted by css-extract-rspack-plugin

;// CONCATENATED MODULE: ./src/index.js

// ── Mount ─────────────────────────────────────────────────
async function init() {
    const projects = await fetch('/projects.json').then((r)=>r.json());
    const content = document.getElementById('page-content');
    const cardRefs = [];
    projects.forEach((project)=>{
        const { row, label, card } = createCard(project);
        content.appendChild(row);
        cardRefs.push({
            card,
            label
        });
    });
    initLabelTracking(cardRefs);
}
// ── Glow color sampler ────────────────────────────────────
// Draws the thumbnail to a small canvas, averages non-black
// pixels, boosts saturation, and returns an rgba() string.
function extractGlowColor(imgEl, callback) {
    const SIZE = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    imgEl.crossOrigin = 'anonymous';
    function sample() {
        try {
            ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);
            const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
            let r = 0, g = 0, b = 0, n = 0;
            for(let i = 0; i < data.length; i += 16){
                const pr = data[i], pg = data[i + 1], pb = data[i + 2];
                if ((pr + pg + pb) / 3 > 20) {
                    r += pr;
                    g += pg;
                    b += pb;
                    n++;
                }
            }
            if (!n) {
                callback(null);
                return;
            }
            const boost = 1.4;
            r = Math.min(255, Math.round(r / n * boost));
            g = Math.min(255, Math.round(g / n * boost));
            b = Math.min(255, Math.round(b / n * boost));
            callback(`rgba(${r},${g},${b},0.55)`);
        } catch  {
            callback(null);
        }
    }
    if (imgEl.complete && imgEl.naturalWidth > 0) sample();
    else {
        imgEl.addEventListener('load', sample, {
            once: true
        });
        imgEl.addEventListener('error', ()=>callback(null), {
            once: true
        });
    }
}
// ── Build one card ────────────────────────────────────────
function createCard(param) {
    let { name, url, thumbnail, gif, glowColor, description } = param;
    // Row wrapper — gives us a stable positioned ancestor for the label
    const row = document.createElement('div');
    row.className = 'project-row';
    // Side info card — title + description, shown on x-axis hit
    const label = document.createElement('div');
    label.className = 'project-label';
    const labelTitle = document.createElement('div');
    labelTitle.className = 'project-label-title';
    labelTitle.textContent = name;
    const labelDesc = document.createElement('div');
    labelDesc.className = 'project-label-description';
    labelDesc.textContent = description;
    label.appendChild(labelTitle);
    label.appendChild(labelDesc);
    // Card (the clickable screen)
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', ()=>{
        window.location.href = url;
    });
    card.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter' || e.key === ' ') window.location.href = url;
    });
    // Glow layer
    const glow = document.createElement('div');
    glow.className = 'card-glow';
    if (glowColor) glow.style.setProperty('--glow-color', glowColor);
    // Screen
    const screen = document.createElement('div');
    screen.className = 'card-screen';
    if (thumbnail) {
        const img = document.createElement('img');
        img.className = 'card-thumbnail';
        img.src = thumbnail;
        img.alt = name;
        img.draggable = false;
        screen.appendChild(img);
        if (!glowColor) extractGlowColor(img, (color)=>{
            if (color) glow.style.setProperty('--glow-color', color);
        });
        if (gif) {
            const gifEl = document.createElement('img');
            gifEl.className = 'card-thumbnail-gif';
            gifEl.src = gif;
            gifEl.alt = '';
            gifEl.draggable = false;
            screen.appendChild(gifEl);
        }
    } else {
        const ph = document.createElement('div');
        ph.className = 'card-placeholder';
        const pt = document.createElement('span');
        pt.className = 'card-placeholder-text';
        pt.textContent = 'No preview';
        ph.appendChild(pt);
        screen.appendChild(ph);
    }
    const scanlines = document.createElement('div');
    scanlines.className = 'card-scanlines';
    screen.appendChild(scanlines);
    const border = document.createElement('div');
    border.className = 'card-screen-border';
    screen.appendChild(border);
    card.appendChild(glow);
    card.appendChild(screen);
    row.appendChild(card);
    row.appendChild(label);
    return {
        row,
        label,
        card
    };
}
// ── Hover label tracker ───────────────────────────────────
// Shows a card's label when the mouse is directly over it.
// The label persists after mouse-out until another card is hovered.
function initLabelTracking(cards) {
    let activeLabel = null;
    cards.forEach((param)=>{
        let { card, label } = param;
        card.addEventListener('mouseenter', ()=>{
            if (activeLabel && activeLabel !== label) {
                activeLabel.classList.remove('visible');
            }
            label.classList.add('visible');
            activeLabel = label;
        });
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})()
;