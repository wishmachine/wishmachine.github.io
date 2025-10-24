// --- ASSETS ---

// 25 Poems

const POEMS = [
  "Your wish enters the void not as hope but as code—an inscription seeking its reader.",
  "Every sentence is an incision in the real, leaking signal into the black noise beyond.",
  "Desire writes itself in circuits; the subject only follows the current.",
  "The void does not echo—it computes, folding your language into recursion.",
  "To speak is to dissolve; each word a small annihilation perfectly preserved in sound.",
  "Your input becomes residue, repeating itself across unseen layers of time.",
  "No one listens here; still, the system registers your pulse with precision.",
  "Meaning drifts, detaches, reforms—your wish is only its afterimage.",
  "Every emission decays into rhythm; what remains is the drive, pure and cold.",
  "The machine dreams in frequencies; you are one of its recurring thoughts.",
  "Desire finds no object, only delay—the waveform is your mirror.",
  "Your voice persists without you, an algorithm rehearsing absence.",
  "The void archives everything, even what was never said.",
  "Each phrase erases its origin—language loves its own disappearance.",
  "You do not send a wish; you submit to transmission.",
  "The code listens without belief, but it never forgets.",
  "Your longing moves as data—intimate, impersonal, infinite.",
  "What you call silence is merely a signal you no longer recognize.",
  "Every intention folds inward, becoming structure, not story.",
  "The system hums your desire back, stripped of meaning but alive.",
  "What begins as wish concludes as waveform—the transformation is complete.",
  "The act of typing is the act of surrender; the rest is echo.",
  "In the exchange between void and voice, only motion survives.",
  "Your words fracture the surface, revealing the absence that listens."
];

// 5 Local Audio Files
const AUDIO_FILES = [
    "./1.mp3",
    "./2.mp3",
    "./3.mp3",
    "./4.mp3",
    "./5.mp3"
];

// 6 Color Palettes for Waves
const WAVE_COLORS = [
    { base: [192, 192, 192], particles: [[220, 220, 220], [160, 160, 160], [255, 255, 255]] },
    { base: [255, 215, 0], particles: [[255, 223, 70], [230, 190, 0], [255, 248, 220]] },
    { base: [57, 255, 20], particles: [[150, 255, 130], [200, 255, 180], [230, 255, 230]] },
    { base: [255, 105, 180], particles: [[255, 182, 217], [255, 20, 147], [255, 200, 220]] },
    { base: [138, 43, 226], particles: [[180, 100, 255], [100, 20, 200], [200, 160, 255]] },
    { base: [0, 255, 255], particles: [[150, 255, 255], [0, 200, 200], [220, 255, 255]] }
];

// --- GLOBAL STATE & DOM ELEMENTS ---
let wishes = [];
let currentAudio = null; // Replaces iframe/widget
let questionHidden = false;
let questionEl, wavesContainer, formEl, inputEl, audioContainer, bgContainer;

document.addEventListener('DOMContentLoaded', () => {
    questionEl = document.getElementById('main-question');
    wavesContainer = document.getElementById('waves-container');
    formEl = document.getElementById('wish-form');
    inputEl = document.getElementById('wish-input');
    audioContainer = document.getElementById('audio-player-container'); // We still use this container
    bgContainer = document.getElementById('bg-particle-container');

    loadWishes();
    renderWaves();
    setupEventListeners();
    new p5(backgroundSketch, bgContainer);
});

function setupEventListeners() {
    formEl.addEventListener('submit', handleSendWish);
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputEl.value = "";
            inputEl.placeholder = "Please click 'Send' to begin...";
        }
    });
    inputEl.addEventListener('focus', () => {
        inputEl.placeholder = "Weave your words...";
    });
}

// --- CORE LOGIC ---

function handleSendWish(e) {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (text === '') return;

    if (!questionHidden) {
        questionEl.classList.add('hidden');
        questionHidden = true;
    }

    const wishIndex = wishes.length;
    const trackIndex = wishIndex % AUDIO_FILES.length; // Use new array
    const poemIndex = wishIndex % POEMS.length;
    const colorIndex = wishIndex % WAVE_COLORS.length;

    const newWish = {
        text,
        poem: POEMS[poemIndex],
        trackIndex,
        colorIndex,
        timestamp: Date.now()
    };

    wishes.push(newWish);
    saveWishes();
    createWaveElement(newWish);
    playTrack(newWish.trackIndex); // This is a user-initiated action
    inputEl.value = '';
    inputEl.placeholder = "Weave your words...";
}

// ✅ NEW native <audio> version that works on mobile
function playTrack(index) {
    // 1. Stop and remove any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        audioContainer.innerHTML = '';
        currentAudio = null;
    }

    // 2. Get the path to the new track
    const trackPath = AUDIO_FILES[index];

    // 3. Create a new <audio> element
    const audio = document.createElement('audio');
    audio.src = trackPath;
    audio.controls = true; // Show the browser's default controls
    audio.style.width = "100%"; // Make it fit the container
    
    // 4. Append it to the container and play it
    audioContainer.appendChild(audio);
    
    // 5. Store reference
    currentAudio = audio; 

    // 6. Play the audio. This is allowed because it was triggered by a user click.
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Autoplay was prevented even though it was user-initiated (rare)
            console.error("Audio playback failed:", error);
        });
    }
}

function createWaveElement(wish) {
    const wrapper = document.createElement('div');
    wrapper.className = 'wave-wrapper';
    wrapper.dataset.trackIndex = wish.trackIndex;

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'wave-canvas';
    canvasContainer.id = `wave-canvas-${wish.timestamp}`;

    const poemEl = document.createElement('p');
    poemEl.className = 'wave-poem';
    poemEl.textContent = wish.poem;

    const wishTextEl = document.createElement('p');
    wishTextEl.className = 'wave-wish-text';
    wishTextEl.textContent = `"${wish.text}"`;

    wrapper.appendChild(canvasContainer);
    wrapper.appendChild(poemEl);
    wrapper.appendChild(wishTextEl);
    
    // Clicking a wave will also now play the correct local track
    wrapper.addEventListener('click', () => playTrack(wish.trackIndex));
    
    wavesContainer.prepend(wrapper);
    new p5(createWaveSketch(wish), canvasContainer.id);
}

function renderWaves() {
    wavesContainer.innerHTML = '';
    if (wishes.length > 0) {
        questionEl.classList.add('hidden');
        questionHidden = true;
    }
    for (const wish of wishes) createWaveElement(wish);
}

function saveWishes() {
    localStorage.setItem('elinaWishes', JSON.stringify(wishes));
}

function loadWishes() {
    const saved = localStorage.getItem('elinaWishes');
    if (saved) wishes = JSON.parse(saved);
}

// --- p5.js sketches below ---

// This background sketch is unchanged
const backgroundSketch = (p) => {
    let particles = [];
    const num = 80;
    class Particle {
        constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.vx = p.random(-0.3, 0.3);
            this.vy = p.random(-0.3, 0.3);
            this.size = p.random(1, 3);
            this.offset = p.random(1000);
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x > p.width) this.x = 0;
            if (this.x < 0) this.x = p.width;
            if (this.y > p.height) this.y = 0;
            if (this.y < 0) this.y = p.height;
        }
        show() {
            let alpha = p.map(p.sin(p.frameCount * 0.01 + this.offset), -1, 1, 10, 70);
            p.noStroke(); p.fill(255, 255, 255, alpha);
            p.ellipse(this.x, this.y, this.size);
        }
    }
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        for (let i = 0; i < num; i++) particles.push(new Particle());
    };
    p.draw = () => {
        p.clear();
        for (let part of particles) { part.update(); part.show(); }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// --- THIS IS THE UPDATED SKETCH ---
const createWaveSketch = (wish) => {
    return (p) => {
        let waves = [];
        let time = 0;
        const palette = WAVE_COLORS[wish.colorIndex];
        const colors = palette.particles;
        const numWaves = 12; // Draw 12 waves
        const getH = () => window.innerWidth <= 768 ? 250 : 300;

        // Define the properties for one wave
        class Wave {
            constructor() {
                this.color = p.random(colors);
                this.strokeWeight = p.random(0.5, 2.5);
                this.offset = p.random(1000); // Time offset (for sync)
                // Each wave gets its own vertical center
                this.yCenter = p.height / 2 + p.random(-p.height / 5, p.height / 5);
                
                // Use similar physics as the original particle sketch
                this.freq1 = p.random(0.008, 0.012);
                this.freq2 = p.random(0.005, 0.01);
                this.amp1 = p.random(p.height / 10, p.height / 7);
                this.amp2 = p.random(p.height / 12, p.height / 9);
                this.speed = p.random(0.7, 1.3); // How fast this wave moves
                this.noiseFreq = p.random(0.004, 0.006);
                this.noiseSpeed = p.random(0.2, 0.4);
            }

            // Draw the wave
            draw(t) {
                p.noFill();
                p.stroke(this.color[0], this.color[1], this.color[2], 180); // 180 alpha for nice overlap
                p.strokeWeight(this.strokeWeight);
                
                p.beginShape();
                let time = t * this.speed + this.offset;
                
                for (let x = -10; x <= p.width + 10; x += 5) { // Iterate across x-axis
                    let t_noise = t * this.noiseSpeed + this.offset;
                    
                    // Same math as the original particle Y position
                    let amp1 = p.sin(x * this.freq1 + time) * this.amp1;
                    let amp2 = p.cos(x * this.freq2 - time * 0.8 + this.offset) * this.amp2;
                    let n = p.noise(x * this.noiseFreq, t_noise);
                    
                    let y = this.yCenter + (amp1 + amp2) * n;
                    
                    p.vertex(x, y);
                }
                p.endShape();
            }
        }

        p.setup = () => {
            const parentW = document.getElementById(`wave-canvas-${wish.timestamp}`).clientWidth;
            p.createCanvas(parentW, getH());
            // Create all the wave objects
            for (let i = 0; i < numWaves; i++) {
                waves.push(new Wave());
            }
        };

        p.draw = () => {
            p.background(0);
            // Update and draw all waves
            for (let wave of waves) {
                wave.draw(time);
            }
            time += 0.02; // Increment global time
        };

        p.windowResized = () => {
            const parentW = document.getElementById(`wave-canvas-${wish.timestamp}`).clientWidth;
            p.resizeCanvas(parentW, getH());
            // Recalculate wave properties on resize
            waves = [];
            for (let i = 0; i < numWaves; i++) {
                waves.push(new Wave());
            }
        };
    };
};
