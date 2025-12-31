/* ===================================
   ANIMAL CATCHER - Game Logic
   A gentle game for 4-year-olds
   =================================== */

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Background images
const backgroundImages = {
    mice: null,
    ladybugs: null,
    butterflies: null,
    dragonflies: null,
    cats: null,
    snails: null,
    dogs: null,
    fireflies: null,
    fish: null,
    koalas: null,
    crabs: null,
    wombats: null,
    fairies: null,
    sugarGliders: null,
    gnomes: null,
    kookaburras: null,
    ants: null,
    echidnas: null,
    frogs: null,
    rabbits: null
};

// Game configuration
const CONFIG = {
    CANVAS_WIDTH: canvas.offsetWidth,
    CANVAS_HEIGHT: canvas.offsetHeight,
    NET_SIZE: 80,
    ANIMALS_PER_LEVEL: 20,
    SPAWN_RATE_BASE: 0.02,
    SPAWN_RATE_INCREMENT: 0.01,
    BASE_SPEED_MULTIPLIER: 2
};

// Animal definitions - each with unique behavior
const ANIMAL_TYPES = {
    snails: {
        name: 'Snails',
        size: 36,
        speed: 0.6,
        points: 11
    },
    koalas: {
        name: 'Koalas',
        size: 46,
        speed: 1.1,
        points: 21
    },
    gnomes: {
        name: 'Gnomes',
        size: 44,
        speed: 1.2,
        points: 16
    },
    wombats: {
        name: 'Wombats',
        size: 44,
        speed: 1.2,
        points: 19
    },
    fairies: {
        name: 'Fairies',
        size: 36,
        speed: 1.3,
        points: 22,
        wobble: true
    },
    echidnas: {
        name: 'Echidnas',
        size: 40,
        speed: 1.3,
        points: 17
    },
    butterflies: {
        name: 'Butterflies',
        size: 40,
        speed: 1.3,
        points: 15,
        wobble: true
    },
    crabs: {
        name: 'Crabs',
        size: 42,
        speed: 1.4,
        points: 18
    },
    fireflies: {
        name: 'Fireflies',
        size: 30,
        speed: 1.5,
        points: 16,
        wobble: true
    },
    fish: {
        name: 'Fish',
        size: 38,
        speed: 1.6,
        points: 12,
        wobble: true
    },
    ladybugs: {
        name: 'Ladybugs',
        size: 32,
        speed: 1.6,
        points: 13
    },
    kookaburras: {
        name: 'Kookaburras',
        size: 42,
        speed: 1.7,
        points: 18
    },
    ants: {
        name: 'Ants',
        size: 28,
        speed: 1.5,
        points: 8
    },
    cats: {
        name: 'Cats',
        size: 45,
        speed: 1.8,
        points: 20
    },
    mice: {
        name: 'Mice',
        size: 35,
        speed: 2,
        points: 10
    },
    sugarGliders: {
        name: 'Sugar Gliders',
        size: 34,
        speed: 2.2,
        points: 20,
        wobble: true
    },
    dogs: {
        name: 'Dogs',
        size: 48,
        speed: 2.2,
        points: 25
    },
    dragonflies: {
        name: 'Dragonflies',
        size: 38,
        speed: 2.4,
        points: 17,
        wobble: true
    },
    frogs: {
        name: 'Frogs',
        size: 40,
        speed: 0,
        points: 14
    },
    rabbits: {
        name: 'Rabbits',
        size: 38,
        speed: 2.3,
        points: 19,
        wobble: true
    }
};

const ANIMAL_KEYS = Object.keys(ANIMAL_TYPES);

// Game state
// Detect mobile/tablet devices
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

let gameState = {
    level: 1,
    score: 0,
    caughtThisLevel: 0,
    currentAnimalType: 'snails',
    animals: [],
    totalAnimalsSpawned: 0,
    netX: CONFIG.CANVAS_WIDTH / 2,
    netY: CONFIG.CANVAS_HEIGHT / 2,
    isAnimating: false,
    isPaused: false,
    speedMultiplier: 1,
    isMouseDown: false,
    isSpacePressed: false,
    isTouching: false,
    levelComplete: false,
    levelCompleteInputReceived: false,
    gameStarted: false,
    startupInputReceived: false,
    allAnimalsMode: false,
    isMobile: isMobileDevice()
};

// Animal class
class Animal {
    constructor(animalType) {
        this.type = animalType;
        this.config = ANIMAL_TYPES[animalType];
        
        // Random spawn side
        const spawnLeft = Math.random() > 0.5;
        this.x = spawnLeft ? -this.config.size : CONFIG.CANVAS_WIDTH + this.config.size;
        this.y = Math.random() * (CONFIG.CANVAS_HEIGHT - this.config.size * 2) + this.config.size;
        
        this.direction = spawnLeft ? 1 : -1;
        this.speed = this.config.speed + (Math.random() - 0.5) * 0.5;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.wobbleAmount = this.config.wobble ? 20 : 0;
        this.baseY = this.y;
        
        // Animation tracking
        this.animationTime = Math.random() * Math.PI * 2;
        this.hopPhase = Math.random() * Math.PI * 2;
    }

    update() {
        // Move horizontally with speed multiplier
        this.x += this.speed * this.direction * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
        
        // Increment animation time
        this.animationTime += 0.1 * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
        this.hopPhase += 0.08 * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
        
        // Add wobble effect for some animals
        if (this.wobbleAmount > 0) {
            this.wobbleOffset += 0.05 * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
            this.y = this.baseY + Math.sin(this.wobbleOffset) * this.wobbleAmount;
        }
        
        // Hopping animation for frogs and rabbits
        if (this.type === 'frogs' || this.type === 'rabbits') {
            const hopHeight = this.type === 'frogs' ? this.config.size * 1.6 : this.config.size * 0.4;
            const hopCycle = Math.sin(this.hopPhase);
            if (hopCycle > 0) {
                this.y = this.baseY - hopHeight * Math.sin(this.hopPhase % Math.PI);
                // Frogs move forward during hop - proportional to hop height
                if (this.type === 'frogs') {
                    const hopProgress = Math.sin(this.hopPhase % Math.PI);
                    const hopDistance = 8 * this.direction * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
                    this.x += hopDistance * hopProgress;
                }
            } else {
                this.y = this.baseY;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }
        
        // Draw animal based on type
        switch(this.type) {
            case 'mice':
                this.drawMouse();
                break;
            case 'ladybugs':
                this.drawLadybug();
                break;
            case 'butterflies':
                this.drawButterfly();
                break;
            case 'dragonflies':
                this.drawDragonfly();
                break;
            case 'cats':
                this.drawCat();
                break;
            case 'snails':
                this.drawSnail();
                break;
            case 'dogs':
                this.drawDog();
                break;
            case 'fireflies':
                this.drawFirefly();
                break;
            case 'fish':
                this.drawFish();
                break;
            case 'koalas':
                this.drawKoala();
                break;
            case 'crabs':
                this.drawCrab();
                break;
            case 'wombats':
                this.drawWombat();
                break;
            case 'fairies':
                this.drawFairy();
                break;
            case 'sugarGliders':
                this.drawSugarGlider();
                break;
            case 'gnomes':
                this.drawGnome();
                break;
            case 'kookaburras':
                this.drawKookaburra();
                break;
            case 'ants':
                this.drawAnts();
                break;
            case 'echidnas':
                this.drawEchidna();
                break;
            case 'frogs':
                this.drawFrog();
                break;
            case 'rabbits':
                this.drawRabbit();
                break;
        }
        
        ctx.restore();
    }

    drawMouse() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime * 4) * 5; // 4x faster, horizontal movement
        
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.6, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back left leg - scurrying left/right
        ctx.fillStyle = '#696969';
        ctx.fillRect(-s * 0.35 + legWalk, s * 0.30, s * 0.15, 8);
        
        // Back right leg - scurrying left/right (opposite phase)
        ctx.fillRect(s * 0.2 - legWalk, s * 0.30, s * 0.15, 8);
        
        // Head
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(s * 0.35, -s * 0.3, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.6, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.5, -s * 0.6, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.4, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.45, -s * 0.4, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(s * 0.5, -s * 0.2, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, 0);
        ctx.quadraticCurveTo(-s * 0.8, s * 0.3 - legWalk * 0.3, -s * 0.9, s * 0.5);
        ctx.stroke();
    }

    drawLadybug() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime * 4) * 3; // Horizontal scurrying
        
        // Wing case (elytra) - side profile
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.55, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Center line (seam between wing cases)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.45);
        ctx.lineTo(0, s * 0.45);
        ctx.stroke();
        
        // Black spots on wing case - 3 visible in profile
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.15, s * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-s * 0.2, s * 0.15, s * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.15, 0, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (side view)
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.arc(s * 0.4, -s * 0.25, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye (single eye visible in side profile)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s * 0.48, -s * 0.28, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.48, -s * 0.28, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // Antenna
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.35, -s * 0.4);
        ctx.quadraticCurveTo(s * 0.55, -s * 0.5, s * 0.6, -s * 0.35);
        ctx.stroke();
        
        // Front leg - scurrying left/right
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(s * 0.25 + legWalk, s * 0.35, s * 0.08, s * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Middle leg - scurrying opposite
        ctx.beginPath();
        ctx.ellipse(-s * 0.05 - legWalk, s * 0.4, s * 0.08, s * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back leg - scurrying
        ctx.beginPath();
        ctx.ellipse(-s * 0.35 + legWalk, s * 0.35, s * 0.08, s * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawButterfly() {
        const s = this.config.size;
        const wingFlap = Math.abs(Math.sin(this.animationTime)) * 0.3;
        
        // Body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings - flapping animation
        ctx.fillStyle = '#FF69B4';
        // Top left wing
        ctx.beginPath();
        ctx.ellipse(-s * (0.35 + wingFlap), -s * 0.25, s * 0.35, s * 0.25, -0.3 - wingFlap, 0, Math.PI * 2);
        ctx.fill();
        // Top right wing
        ctx.beginPath();
        ctx.ellipse(s * (0.35 + wingFlap), -s * 0.25, s * 0.35, s * 0.25, 0.3 + wingFlap, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom wings (darker)
        ctx.fillStyle = '#FF1493';
        // Bottom left wing
        ctx.beginPath();
        ctx.ellipse(-s * (0.35 + wingFlap * 0.5), s * 0.25, s * 0.3, s * 0.2, 0.3 + wingFlap * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Bottom right wing
        ctx.beginPath();
        ctx.ellipse(s * (0.35 + wingFlap * 0.5), s * 0.25, s * 0.3, s * 0.2, -0.3 - wingFlap * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Antennae
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-s * 0.05, -s * 0.3);
        ctx.quadraticCurveTo(-s * 0.2, -s * 0.5, -s * 0.25, -s * 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.05, -s * 0.3);
        ctx.quadraticCurveTo(s * 0.2, -s * 0.5, s * 0.25, -s * 0.6);
        ctx.stroke();
    }

    drawDragonfly() {
        const s = this.config.size;
        const wingFlap = Math.sin(this.animationTime * 2) * 0.4;
        
        // Body
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.18, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings - fast flapping
        ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
        // Top left wing
        ctx.beginPath();
        ctx.ellipse(-s * (0.4 + wingFlap * 0.5), -s * (0.15 + wingFlap * 0.2), s * 0.25, s * 0.35, -0.2 - wingFlap, 0, Math.PI * 2);
        ctx.fill();
        // Top right wing
        ctx.beginPath();
        ctx.ellipse(s * (0.4 + wingFlap * 0.5), -s * (0.15 + wingFlap * 0.2), s * 0.25, s * 0.35, 0.2 + wingFlap, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom wings
        ctx.beginPath();
        ctx.ellipse(-s * (0.35 + wingFlap * 0.3), s * (0.15 + wingFlap * 0.1), s * 0.2, s * 0.3, 0.2 + wingFlap * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * (0.35 + wingFlap * 0.3), s * (0.15 + wingFlap * 0.1), s * 0.2, s * 0.3, -0.2 - wingFlap * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#00DD00';
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.08, -s * 0.4, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.08, -s * 0.4, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSnail() {
        const s = this.config.size;
        const bodyWave = Math.sin(this.animationTime * 0.5) * 1.5;
        const eyeStalk1 = Math.sin(this.animationTime * 1.3) * 0.08;
        const eyeStalk2 = Math.sin(this.animationTime * 1.1 + 0.5) * 0.08;
        
        // Shell - on the back, spiral shape
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.25, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Shell highlight and spiral detail
        ctx.strokeStyle = '#A0826D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.25, s * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.25, s * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body/foot - lower, moving
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(s * 0.00 + bodyWave, s * 0.15, s * 0.62, s * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head - at front of body
        ctx.fillStyle = '#A0826D';
        ctx.beginPath();
        ctx.arc(s * 0.5 + bodyWave, s * 0.0, s * 0.18, 0, Math.PI * 2);
        ctx.fill();
        
        // Left eye stalk - curving upward
        ctx.strokeStyle = '#A0826D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.45 + bodyWave, s * 0.0);
        ctx.quadraticCurveTo(s * 0.2 + bodyWave + eyeStalk1, -s * 0.2, s * 0.15 + bodyWave + eyeStalk1, -s * 0.25);
        ctx.stroke();
        
        // Right eye stalk - curving upward
        ctx.beginPath();
        ctx.moveTo(s * 0.45 + bodyWave, s * 0.0);
        ctx.quadraticCurveTo(s * 0.4 + bodyWave + eyeStalk2, -s * 0.2, s * 0.45 + bodyWave + eyeStalk2, -s * 0.25);
        ctx.stroke();
        
        // Left eye
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.35 + bodyWave + eyeStalk1, -s * 0.35, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(s * 0.65 + bodyWave + eyeStalk2, -s * 0.35, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#8B6F47';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s * 0.5 + bodyWave, s * 0.1, s * 0.08, 0, Math.PI);
        ctx.stroke();
    }

    drawFirefly() {
        const s = this.config.size;
        const wingFlutter = Math.sin(this.animationTime * 3) * 0.3;
        const glowPulse = Math.abs(Math.sin(this.animationTime * 1.5)) * 0.3 + 0.2;
        
        // Body
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.05, s * 0.35, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing abdomen
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.2, s * 0.3, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect - pulsing
        ctx.fillStyle = `rgba(255, 215, 0, ${glowPulse})`;
        ctx.beginPath();
        ctx.ellipse(0, s * 0.2, s * 0.4, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings - fluttering
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-s * (0.25 + wingFlutter * 0.3), -s * 0.1, s * 0.2, s * 0.3, -0.3 - wingFlutter, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * (0.25 + wingFlutter * 0.3), -s * 0.1, s * 0.2, s * 0.3, 0.3 + wingFlutter, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawKoala() {
        const s = this.config.size;
        const armMove = Math.sin(this.animationTime) * 0.15;
        const legMove = Math.sin(this.animationTime) * 3;
        
        // Body
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.5, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Left arm - hugging/moving
        ctx.fillStyle = '#707070';
        ctx.beginPath();
        ctx.ellipse(-s * (0.4 + armMove * 0.3), s * 0.05, s * 0.15, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right arm - hugging/moving
        ctx.beginPath();
        ctx.ellipse(s * (0.4 - armMove * 0.3), s * 0.05, s * 0.15, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Left leg - walking
        ctx.beginPath();
        ctx.ellipse(-s * 0.25, s * 0.45 + legMove, s * 0.15, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right leg - walking opposite
        ctx.beginPath();
        ctx.ellipse(s * 0.25, s * 0.45 - legMove, s * 0.15, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.arc(0, -s * 0.3, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.arc(-s * 0.3, -s * 0.55, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.55, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ear inner
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.arc(-s * 0.3, -s * 0.55, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.55, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Face markings
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.3, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.3, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, -s * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    drawWombat() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime) * 3;
        
        // Body (stocky)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Front left leg - walking
        ctx.fillStyle = '#4a3219';
        ctx.beginPath();
        ctx.ellipse(-s * 0.3, s * 0.38 + legWalk, s * 0.13, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Front right leg - walking opposite
        ctx.beginPath();
        ctx.ellipse(s * 0.3, s * 0.38 - legWalk, s * 0.13, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back left leg - walking
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, s * 0.48 - legWalk, s * 0.12, s * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back right leg - walking opposite
        ctx.beginPath();
        ctx.ellipse(s * 0.35, s * 0.48 + legWalk, s * 0.12, s * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.2, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(s * 0.05, -s * 0.5, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.45, -s * 0.5, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.25, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.35, -s * 0.25, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.05, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSugarGlider() {
        const s = this.config.size;
        const wingFlutter = Math.sin(this.animationTime * 2.5) * 0.2;
        
        // Body
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.4, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.arc(-s * 0.25, -s * 0.5, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.5, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Gliding membrane - fluttering
        ctx.fillStyle = 'rgba(224, 224, 224, 0.7)';
        ctx.beginPath();
        ctx.ellipse(-s * (0.35 + wingFlutter), 0, s * 0.2, s * (0.35 + wingFlutter * 0.5), -0.3 - wingFlutter * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * (0.35 + wingFlutter), 0, s * 0.2, s * (0.35 + wingFlutter * 0.5), 0.3 + wingFlutter * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.12, -s * 0.35, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.12, -s * 0.35, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(0, -s * 0.15, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
    }

    drawKookaburra() {
        const s = this.config.size;
        const wingFlap = Math.sin(this.animationTime * 1.5) * 0.2;
        const headBob = Math.sin(this.animationTime * 1.2) * 0.12;
        
        // Body
        ctx.fillStyle = '#8B6F47';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.5, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head - bobbing
        ctx.fillStyle = '#8B6F47';
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.2 + headBob, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#FFB90F';
        ctx.beginPath();
        ctx.moveTo(s * 0.5, -s * 0.15 + headBob);
        ctx.lineTo(s * 0.85, -s * 0.2 + headBob);
        ctx.lineTo(s * 0.5, -s * 0.05 + headBob);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * 0.3 + headBob, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * 0.3 + headBob, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings - flapping
        ctx.fillStyle = '#6B5638';
        ctx.beginPath();
        ctx.ellipse(-s * (0.25 + wingFlap * 0.4), 0, s * (0.3 + wingFlap * 0.2), s * (0.35 + wingFlap * 0.1), -0.3 - wingFlap * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Right wing hidden behind body but visible edge
        ctx.fillStyle = '#5A4829';
        ctx.beginPath();
        ctx.ellipse(s * (0.15 - wingFlap * 0.3), s * 0.1, s * 0.2, s * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAnts() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime * 5) * 3; // Very fast scurrying
        
        // Abdomen (rear segment, largest) - positioned back, horizontal alignment
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(-s * 0.6, -s * 0.3, s * 0.32, s * 0.23, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Thorax (middle segment, smaller) - positioned center, horizontal alignment
        ctx.beginPath();
        ctx.ellipse(-s * 0.1, -s * 0.25, s * 0.20, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (small, at front in profile) - horizontal alignment
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.3, s * 0.23, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye (single eye visible in side profile)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.42, -s * 0.32, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Antenna (single antenna visible in profile)
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s * 0.32, -s * 0.42);
        ctx.quadraticCurveTo(s * 0.45, -s * 0.55, s * 0.5, -s * 0.5);
        ctx.stroke();
        
        // Front leg - very fast scurrying (visible from side)
        ctx.fillStyle = '#4a3219';
        ctx.beginPath();
        ctx.ellipse(s * 0.15 + legWalk, s * 0.0, s * 0.04, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Middle leg - scurrying opposite phase
        ctx.beginPath();
        ctx.ellipse(-s * 0.25 - legWalk, s * 0.0, s * 0.04, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back leg - scurrying with legWalk
        ctx.beginPath();
        ctx.ellipse(-s * 0.45 + legWalk, s * 0.0, s * 0.04, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEchidna() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime) * 2;
        
        const bodyRadiusX = s * 0.5;
        const bodyRadiusY = s * 0.3;
        const bodyCenterY = s * 0.05;

        // Body - more rounded and compact
        ctx.fillStyle = '#6B5344';
        ctx.beginPath();
        ctx.ellipse(0, bodyCenterY, bodyRadiusX, bodyRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes on back - radiating outward from body
        ctx.strokeStyle = '#4a3228';
        ctx.lineWidth = 2.5;
        
        for (let i = 0; i < 8; i++) {
            // Distribute spikes across the top of the body
            const spikeAngle = -Math.PI + (i / 7) * Math.PI; // From -π to 0 (top half)
            
            // Calculate position on body circumference
            const xPos = Math.cos(spikeAngle) * bodyRadiusX;
            const baseY = bodyCenterY + Math.sin(spikeAngle) * bodyRadiusY;
            
            const spikeLength = s * 0.35;
            // Spike points outward from the body
            const angle = spikeAngle - Math.PI * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(xPos, baseY);
            ctx.lineTo(xPos + Math.cos(angle) * spikeLength, 
                       baseY + Math.sin(angle) * spikeLength);
            ctx.stroke();
        }
        
        // Head - positioned forward
        ctx.fillStyle = '#6B5344';
        ctx.beginPath();
        ctx.arc(s * 0.6, s * 0.1, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // // Long snout - more prominent and pointed
        // ctx.fillStyle = '#7A6350';
        // ctx.beginPath();
        // ctx.ellipse(s * 0.75, s * 0.2, s * 0.18, s * 0.12, 0, 0, Math.PI * 2);
        // ctx.fill();
        
        // Snout tip - pointed
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.arc(s * 0.78, s * 0.2, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.6, s * 0.10, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s * 0.62, s * 0.08, s * 0.02, 0, Math.PI * 2);
        ctx.fill();
        
        // Front left leg - short and sturdy
        ctx.fillStyle = '#4a3228';
        ctx.beginPath();
        ctx.ellipse(-s * 0.45, s * 0.38 + legWalk * 0.5, s * 0.11, s * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Front right leg - short and sturdy
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, s * 0.38 - legWalk * 0.5, s * 0.11, s * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back left leg
        ctx.beginPath();
        ctx.ellipse(s * 0.3, s * 0.38 - legWalk * 0.5, s * 0.1, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back right leg
        ctx.beginPath();
        ctx.ellipse(s * 0.4, s * 0.38 + legWalk * 0.5, s * 0.1, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCat() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime * 4) * 5; // Fast scurrying motion
        
        // Body
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.5, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Front left leg - scurrying
        ctx.fillStyle = '#CC6600';
        ctx.fillRect(-s * 0.3 + legWalk, s * 0.25, s * 0.12, 10);
        
        // Front right leg - scurrying (opposite phase)
        ctx.fillRect(s * 0.15 - legWalk, s * 0.25, s * 0.12, 10);
        
        // Back left leg - scurrying
        ctx.fillRect(-s * 0.25 + legWalk, s * 0.38, s * 0.12, 10);
        
        // Back right leg - scurrying (opposite phase)
        ctx.fillRect(s * 0.2 - legWalk, s * 0.38, s * 0.12, 10);
        
        // Head
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.25, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(s * 0.05, -s * 0.55);
        ctx.lineTo(s * 0.05, -s * 0.75);
        ctx.lineTo(s * 0.15, -s * 0.6);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(s * 0.5, -s * 0.55);
        ctx.lineTo(s * 0.5, -s * 0.75);
        ctx.lineTo(s * 0.4, -s * 0.6);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(s * 0.15, -s * 0.35, s * 0.12, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.4, -s * 0.35, s * 0.12, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.35, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.4, -s * 0.35, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.15, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Whiskers
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.35, -s * 0.12);
        ctx.lineTo(s * 0.55, -s * 0.12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.35, -s * 0.2);
        ctx.lineTo(s * 0.55, -s * 0.2);
        ctx.stroke();
    }

    drawDog() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime * 2) * 5; // Horizontal motion
        const tailWag = Math.sin(this.animationTime * 1.5) * 15;
        
        // Body
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.55, s * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back left leg - scurrying left/right
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(-s * 0.35 + legWalk, s * 0.25, s * 0.12, 12);
        
        // Back right leg - scurrying left/right (opposite phase)
        ctx.fillRect(s * 0.2 - legWalk, s * 0.25, s * 0.12, 12);
        
        // Front left leg - scurrying
        ctx.fillRect(-s * 0.25 + legWalk, s * 0.35, s * 0.12, 12);
        
        // Front right leg - scurrying (opposite phase)
        ctx.fillRect(s * 0.1 - legWalk, s * 0.35, s * 0.12, 12);
        
        // Head
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.3, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.ellipse(s * 0.05, -s * 0.55, s * 0.2, s * 0.3, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.45, -s * 0.55, s * 0.2, s * 0.3, 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.4, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.35, -s * 0.4, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.15, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Tongue
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.ellipse(s * 0.3, 0, s * 0.08, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail - wagging
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, s * 0.2);
        ctx.quadraticCurveTo(-s * 0.8 + tailWag * 0.5, -s * 0.1, -s * 0.9 + tailWag, -s * 0.3);
        ctx.stroke();
    }

    drawFish() {
        const s = this.config.size;
        const tailWag = Math.sin(this.animationTime * 2) * 0.2;
        const finMove = Math.sin(this.animationTime) * 0.15;

        // Top fin
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.ellipse(0, -s * (0.25 + finMove * 0.5), s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom fin
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.ellipse(0, s * (0.25 + finMove * 0.5), s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        
        // Tail fin - wagging
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s * 0.2);
        ctx.lineTo(-s * (0.8 + tailWag), -s * (0.35 + tailWag * 0.5));
        ctx.lineTo(-s * (0.8 + tailWag), s * (0.35 + tailWag * 0.5));
        ctx.lineTo(-s * 0.5, s * 0.2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.15, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.15, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s * 0.5, -s * 0.1, s * 0.1, 0, Math.PI);
        ctx.stroke();
    }

    drawCrab() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime) * 0.3;
        
        // Body
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye stalks and eyes
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-s * 0.1, -s * 0.35);
        ctx.lineTo(-s * 0.2, -s * (0.55 + legWalk * 0.5));
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * (0.55 + legWalk * 0.5), s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(s * 0.1, -s * 0.35);
        ctx.lineTo(s * 0.2, -s * (0.55 + legWalk * 0.5));
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * (0.55 + legWalk * 0.5), s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Claws - moving
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 4;
        // Left claw
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, s * 0.1);
        ctx.lineTo(-s * (0.6 + legWalk * 0.3), s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * (0.6 + legWalk * 0.3), s * 0.05);
        ctx.lineTo(-s * (0.7 + legWalk * 0.2), s * 0.15);
        ctx.stroke();
        
        // Right claw
        ctx.beginPath();
        ctx.moveTo(s * 0.35, s * 0.1);
        ctx.lineTo(s * (0.6 + legWalk * 0.3), s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * (0.6 + legWalk * 0.3), s * 0.05);
        ctx.lineTo(s * (0.7 + legWalk * 0.2), s * 0.15);
        ctx.stroke();
        
        // Legs - walking
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.3;
            const legOffset = Math.sin(this.animationTime + i * 0.7) * 0.2;
            ctx.beginPath();
            ctx.moveTo(s * 0.25 * Math.cos(angle), s * 0.3 * Math.sin(angle));
            ctx.lineTo(s * (0.45 + legOffset) * Math.cos(angle), s * (0.5 + legOffset) * Math.sin(angle));
            ctx.stroke();
        }
    }

    drawFairy() {
        const s = this.config.size;
        const wingFlutter = Math.sin(this.animationTime * 2.8) * 0.25;
        const wandBob = Math.sin(this.animationTime * 1.3) * 0.15;
        
        // Head
        ctx.fillStyle = '#FFD89B';
        ctx.beginPath();
        ctx.arc(0, -s * 0.25, s * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (dress)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.3, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings - fluttering
        ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
        ctx.beginPath();
        ctx.ellipse(-s * (0.4 - wingFlutter * 0.2), -s * 0.1, s * 0.25 + wingFlutter * 0.1, s * 0.35, -0.3 - wingFlutter * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * (0.4 - wingFlutter * 0.2), -s * 0.1, s * 0.25 + wingFlutter * 0.1, s * 0.35, 0.3 + wingFlutter * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Face
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-s * 0.08, -s * 0.3, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.08, -s * 0.3, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(-s * 0.08, -s * 0.3, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.08, -s * 0.3, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // Magic wand - bobbing and glowing
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.35, -s * 0.4 + wandBob);
        ctx.lineTo(s * 0.5, -s * 0.55 + wandBob);
        ctx.stroke();
        
        // Wand star - pulsing glow
        const glowPulse = Math.abs(Math.sin(this.animationTime * 2)) * 0.08;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(s * 0.5, -s * 0.55 + wandBob, s * (0.1 + glowPulse), 0, Math.PI * 2);
        ctx.fill();
    }

    drawGnome() {
        const s = this.config.size;
        const legWalk = Math.sin(this.animationTime) * 2.5;
        const headBob = Math.sin(this.animationTime * 1.3) * 0.1;
        
        // Hat
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, -s * 0.15 + headBob);
        ctx.lineTo(0, -s * 0.6 + headBob);
        ctx.lineTo(s * 0.25, -s * 0.15 + headBob);
        ctx.fill();
        
        // Hat brim
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.15 + headBob, s * 0.3, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Face
        ctx.fillStyle = '#FFD89B';
        ctx.beginPath();
        ctx.arc(0, s * 0.05 + headBob, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Beard
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.arc(0, s * 0.25 + headBob, s * 0.2, 0, Math.PI);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.4, s * 0.35, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Left leg - walking
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(-s * 0.15, s * 0.65 + legWalk, s * 0.12, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right leg - walking opposite
        ctx.beginPath();
        ctx.ellipse(s * 0.15, s * 0.65 - legWalk, s * 0.12, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.1, headBob, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.1, headBob, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(0, s * 0.1 + headBob, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFrog() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.45, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back legs
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, s * 0.35, s * 0.2, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.35, s * 0.35, s * 0.2, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Front legs
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, -s * 0.1, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.35, -s * 0.1, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head bump
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(0, -s * 0.3, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.45, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.45, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.48, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.48, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -s * 0.2, s * 0.15, 0, Math.PI);
        ctx.stroke();
    }

    drawRabbit() {
        const s = this.config.size;
        // Calculate hop stretch - compress when landing, stretch when airborne
        const hopCycle = Math.sin(this.hopPhase);
        const hopStretch = Math.max(0, hopCycle); // 0 to 1 during hop arc
        const bodyStretch = 1 + hopStretch * 0.3; // Stretch body during hop
        const bodyCompress = 1 - hopStretch * 0.2; // Compress vertically
        
        // Body (side view, horizontal)
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.5 * bodyStretch, s * 0.35 * bodyCompress, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head (side view) - moves with body stretch
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.arc(s * 0.35 * bodyStretch, -s * 0.15, s * 0.28, 0, Math.PI * 2);
        ctx.fill();
        
        // Ear (single ear visible in side view, standing up)
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.ellipse(s * 0.25 * bodyStretch, -s * 0.55 - hopStretch * 0.15, s * 0.1, s * 0.38 + hopStretch * 0.1, -0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ear
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(s * 0.25 * bodyStretch, -s * 0.55 - hopStretch * 0.15, s * 0.05, s * 0.28 + hopStretch * 0.08, -0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye (side view - single eye visible)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.45 * bodyStretch, -s * 0.2, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose (side view)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(s * 0.5 * bodyStretch, -s * 0.05, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Front leg (moves apart and stretches when hopping)
        ctx.fillStyle = '#E6C8A0';
        ctx.beginPath();
        ctx.ellipse(s * 0.2 * bodyStretch + hopStretch * 0.15, s * 0.38 + hopStretch * 0.2, s * 0.1, s * 0.18 * (1 + hopStretch * 0.4), 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Back leg (powerful, stretched and spreads when hopping)
        ctx.beginPath();
        ctx.ellipse(-s * 0.25 * bodyStretch - hopStretch * 0.15, s * 0.38 + hopStretch * 0.25, s * 0.12, s * 0.2 * (1 + hopStretch * 0.5), 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail/cotton (visible on side)
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(-s * 0.45 * bodyStretch, s * 0.2, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        // Don't remove off-screen animals - they wrap to the opposite side
        return false;
    }
    
    wrapAround() {
        // Wrap animals to opposite side when they go off-screen
        if (this.x > CONFIG.CANVAS_WIDTH + this.config.size) {
            this.x = -this.config.size;
        } else if (this.x < -this.config.size) {
            this.x = CONFIG.CANVAS_WIDTH + this.config.size;
        }
    }

    isCaught(netX, netY, netSize) {
        const dx = this.x - netX;
        const dy = this.y - netY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (netSize / 2) + (this.config.size / 2);
    }
}

// Draw the net (butterfly net)
function drawNet(x, y, size) {
    ctx.save();
    
    // Net handle
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 60);
    ctx.stroke();
    
    // Net hoop
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, size / 2.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Net mesh (semi-transparent)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, size / 2.5 - 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Net mesh pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size / 2.5, y - size / 2.5 + i * size / 5);
        ctx.lineTo(x + size / 2.5, y - size / 2.5 + i * size / 5);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Update game state
function update() {
    // Update all animals
    for (let i = 0; i < gameState.animals.length; i++) {
        gameState.animals[i].update();
        gameState.animals[i].wrapAround();
    }

    // Spawn new animals only if we haven't reached 20 yet
    // Don't spawn additional animals in all animals mode
    if (!gameState.allAnimalsMode && gameState.totalAnimalsSpawned < CONFIG.ANIMALS_PER_LEVEL) {
        if (Math.random() < CONFIG.SPAWN_RATE_BASE + (gameState.level - 1) * CONFIG.SPAWN_RATE_INCREMENT) {
            gameState.animals.push(new Animal(gameState.currentAnimalType));
            gameState.totalAnimalsSpawned++;
        }
    }
}

// Draw game
function draw() {
    // Draw background based on current animal
    drawBackground();

    // Draw all animals
    for (let animal of gameState.animals) {
        animal.draw();
    }

    // Draw net
    drawNet(gameState.netX, gameState.netY, CONFIG.NET_SIZE);
}

// Draw background based on current animal type
function drawBackground() {
    const img = backgroundImages[gameState.currentAnimalType];
    if (img) {
        ctx.drawImage(img, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }
}



// Handle mouse movement for net control
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gameState.netX = e.clientX - rect.left;
    gameState.netY = e.clientY - rect.top;

    // Constrain net to canvas
    gameState.netX = Math.max(CONFIG.NET_SIZE / 2, Math.min(gameState.netX, CONFIG.CANVAS_WIDTH - CONFIG.NET_SIZE / 2));
    gameState.netY = Math.max(CONFIG.NET_SIZE / 2, Math.min(gameState.netY, CONFIG.CANVAS_HEIGHT - CONFIG.NET_SIZE / 2));
});

// Handle touch for mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    gameState.netX = e.touches[0].clientX - rect.left;
    gameState.netY = e.touches[0].clientY - rect.top;

    gameState.netX = Math.max(CONFIG.NET_SIZE / 2, Math.min(gameState.netX, CONFIG.CANVAS_WIDTH - CONFIG.NET_SIZE / 2));
    gameState.netY = Math.max(CONFIG.NET_SIZE / 2, Math.min(gameState.netY, CONFIG.CANVAS_HEIGHT - CONFIG.NET_SIZE / 2));
}, { passive: false });

// Handle touch start for mobile capturing
document.addEventListener('touchstart', (e) => {
    // Save the level complete state BEFORE processing this touch
    const wasLevelCompleteAtStart = gameState.levelComplete;
    
    // Handle startup
    if (!gameState.gameStarted && !gameState.startupInputReceived) {
        gameState.startupInputReceived = true;
    }
    // Handle level complete - only if it was ALREADY complete before this touch started
    else if (wasLevelCompleteAtStart && !gameState.levelCompleteInputReceived) {
        gameState.levelCompleteInputReceived = true;
    } else if (e.target === canvas) {
        // Only update net position if tap is on the canvas itself
        const rect = canvas.getBoundingClientRect();
        gameState.netX = e.touches[0].clientX - rect.left;
        gameState.netY = e.touches[0].clientY - rect.top;

        gameState.netX = Math.max(CONFIG.NET_SIZE / 2, Math.min(gameState.netX, CONFIG.CANVAS_WIDTH - CONFIG.NET_SIZE / 2));
        gameState.netY = Math.max(CONFIG.NET_SIZE / 2, Math.min(gameState.netY, CONFIG.CANVAS_HEIGHT - CONFIG.NET_SIZE / 2));
        
        gameState.isTouching = true;
        catchAnimals();
    }
}, { passive: true });

// Handle touch end
document.addEventListener('touchend', (e) => {
    gameState.isTouching = false;
    
    // Start game if startup input was received
    if (!gameState.gameStarted && gameState.startupInputReceived) {
        startGame();
    }
    // Advance level if new input was received
    else if (gameState.levelComplete && gameState.levelCompleteInputReceived) {
        advanceLevel();
    }
}, { passive: true });

// Catch animals on click or spacebar
function catchAnimals() {
    // Only allow catching if game is running and not paused
    if (!gameState.isAnimating || gameState.isPaused) {
        return;
    }
    
    const netSize = CONFIG.NET_SIZE;
    let animalsCaught = false;
    
    for (let i = gameState.animals.length - 1; i >= 0; i--) {
        if (gameState.animals[i].isCaught(gameState.netX, gameState.netY, netSize)) {
            const animal = gameState.animals[i];
            gameState.score += animal.config.points;
            gameState.caughtThisLevel++;
            animalsCaught = true;
            
            // Play catch sound
            playSound('catchSound');
            
            gameState.animals.splice(i, 1);
        }
    }

    // Check for level up only once per call
    if (animalsCaught && gameState.caughtThisLevel >= CONFIG.ANIMALS_PER_LEVEL) {
        levelUp();
    }

    updateUI();
}

// Track mouse button state
document.addEventListener('mousedown', () => {
    // Handle startup
    if (!gameState.gameStarted && !gameState.startupInputReceived) {
        gameState.startupInputReceived = true;
    }
    // Handle level complete
    else if (gameState.levelComplete && !gameState.levelCompleteInputReceived) {
        gameState.levelCompleteInputReceived = true;
    } else {
        gameState.isMouseDown = true;
    }
});

document.addEventListener('mouseup', () => {
    gameState.isMouseDown = false;
    
    // Start game if startup input was received
    if (!gameState.gameStarted && gameState.startupInputReceived) {
        startGame();
    }
    // Advance level if new input was received
    else if (gameState.levelComplete && gameState.levelCompleteInputReceived) {
        advanceLevel();
    }
});

// Track spacebar state
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        // Handle startup
        if (!gameState.gameStarted && !gameState.startupInputReceived) {
            gameState.startupInputReceived = true;
        }
        // Handle level complete
        else if (gameState.levelComplete && !gameState.levelCompleteInputReceived) {
            gameState.levelCompleteInputReceived = true;
        } else {
            gameState.isSpacePressed = true;
        }
    }
    // Handle 'a' key to start with all animals
    else if ((e.key === 'a' || e.key === 'A') && !gameState.gameStarted && !gameState.startupInputReceived) {
        gameState.allAnimalsMode = true;
        gameState.startupInputReceived = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        gameState.isSpacePressed = false;
        
        // Start game if startup input was received
        if (!gameState.gameStarted && gameState.startupInputReceived) {
            startGame();
        }
        // Advance level if new input was received
        else if (gameState.levelComplete && gameState.levelCompleteInputReceived) {
            advanceLevel();
        }
    }
});

// Handle mouse click
document.addEventListener('click', (e) => {
    // Only handle clicks not on buttons
    if (!e.target.closest('.btn')) {
        // Start game if startup input was received
        if (!gameState.gameStarted && gameState.startupInputReceived) {
            startGame();
        }
        // Advance level if popup is shown and new input was received
        else if (gameState.levelComplete && gameState.levelCompleteInputReceived) {
            advanceLevel();
        }
    }
});

// Level up
function levelUp() {
    gameState.levelComplete = true;
    gameState.levelCompleteInputReceived = false;
    gameState.isPaused = true;
    
    // Show popup
    showLevelCompletePopup();
}

// Show level complete popup
function showLevelCompletePopup() {
    const popup = document.getElementById('levelCompletePopup');
    const message = document.getElementById('popupMessage');
    
    let messageText;
    if (gameState.allAnimalsMode) {
        messageText = `You caught all the animals!`;
    } else {
        const animalName = ANIMAL_TYPES[gameState.currentAnimalType].name;
        messageText = `You caught all the ${animalName}.`;
    }
    
    message.textContent = messageText;
    popup.classList.remove('hidden');
}

// Hide level complete popup
function hideLevelCompletePopup() {
    const popup = document.getElementById('levelCompletePopup');
    popup.classList.add('hidden');
}

// Show startup popup
function showStartupPopup() {
    const popup = document.getElementById('startupPopup');
    const message = document.getElementById('startupMessage');
    const animalName = ANIMAL_TYPES[gameState.currentAnimalType].name;
    
    message.textContent = `Try to catch all the ${animalName}.`;
    popup.classList.remove('hidden');
}

// Hide startup popup
function hideStartupPopup() {
    const popup = document.getElementById('startupPopup');
    popup.classList.add('hidden');
}

// Advance to next level
function advanceLevel() {
    hideLevelCompletePopup();
    gameState.levelComplete = false;
    gameState.isPaused = false;
    gameState.levelCompleteInputReceived = false;
    
    if (gameState.level < ANIMAL_KEYS.length) {
        gameState.level++;
        gameState.caughtThisLevel = 0;
        gameState.totalAnimalsSpawned = 0;
        gameState.currentAnimalType = ANIMAL_KEYS[gameState.level - 1];
        gameState.animals = [];
        
        // Play level up sound
        playSound('levelUpSound');
    } else {
        // Completed all levels: reset to snails and increase speed
        gameState.level = 1;
        gameState.caughtThisLevel = 0;
        gameState.totalAnimalsSpawned = 0;
        gameState.currentAnimalType = ANIMAL_KEYS[0]; // Back to snails
        gameState.animals = [];
        
        // Increase speed slider by 0.5
        const speedSlider = document.getElementById('speedSlider');
        let newSpeed = Math.min(parseFloat(speedSlider.value) + 0.5, 5);
        speedSlider.value = newSpeed;
        gameState.speedMultiplier = newSpeed;
        updateSpeedDisplay();
        
        playSound('levelUpSound');
    }
    updateUI();
    updatePlayButton();
}

// Play sound effect
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {
            // Silently ignore audio errors (mobile restrictions)
        });
    }
}

// Update UI display
function updateUI() {
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('caughtDisplay').textContent = `${gameState.caughtThisLevel}/${CONFIG.ANIMALS_PER_LEVEL}`;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('animalNameDisplay').textContent = ANIMAL_TYPES[gameState.currentAnimalType].name;
    document.getElementById('speedDisplay').textContent = gameState.speedMultiplier.toFixed(2) + 'x';
}

// Handle canvas resize
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    CONFIG.CANVAS_WIDTH = canvas.width;
    CONFIG.CANVAS_HEIGHT = canvas.height;
}

window.addEventListener('resize', resizeCanvas);

// Game loop
function gameLoop() {
    if (gameState.isAnimating && !gameState.isPaused) {
        update();
        
        // Continuous catching when mouse button or spacebar is held down
        if (gameState.isMouseDown || gameState.isSpacePressed) {
            catchAnimals();
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Control event handlers
function setupControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const speedSlider = document.getElementById('speedSlider');

    // Play/Pause button - toggles between start, pause, and resume
    playPauseBtn.addEventListener('click', () => {
        if (!gameState.gameStarted) {
            // Starting new game
            gameState.gameStarted = true;
            gameState.isAnimating = true;
        } else if (gameState.isPaused) {
            // Resuming from pause
            gameState.isPaused = false;
        } else {
            // Pause the game
            gameState.isPaused = true;
        }
        updatePlayButton();
    });

    // Reset button - resets the game
    resetBtn.addEventListener('click', () => {
        gameState.gameStarted = false;
        gameState.isAnimating = false;
        gameState.isPaused = false;
        gameState.level = 1;
        gameState.score = 0;
        gameState.caughtThisLevel = 0;
        gameState.totalAnimalsSpawned = 0;
        gameState.currentAnimalType = ANIMAL_KEYS[0];
        gameState.animals = [];
        gameState.speedMultiplier = 1;
        document.getElementById('speedSlider').value = 1;
        updateUI();
        updatePlayButton();
    });

    // Speed slider - adjust game speed
    speedSlider.addEventListener('input', (e) => {
        gameState.speedMultiplier = parseFloat(e.target.value);
        updateUI();
    });
}

// Update play button state
function updatePlayButton() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (!gameState.gameStarted) {
        // Game hasn't started yet
        playPauseBtn.textContent = 'Start';
    } else if (gameState.isPaused) {
        // Game is paused
        playPauseBtn.textContent = 'Resume';
    } else {
        // Game is playing
        playPauseBtn.textContent = 'Pause';
    }
}

// Initialize and start game
function init() {
    // Load background images
    const animalTypes = Object.keys(ANIMAL_TYPES);

    animalTypes.forEach(animalType => {
        const img = new Image();
        const fileName = animalType.charAt(0).toUpperCase() + animalType.slice(1);
        img.src = `backgrounds/${fileName}.png`;
        img.onload = () => { backgroundImages[animalType] = img; };
    });
    
    resizeCanvas();
    setupControls();
    updateUI();
    showStartupPopup();
    gameLoop();
}

// Start the game after startup popup
function startGame() {
    hideStartupPopup();
    gameState.gameStarted = true;
    gameState.isAnimating = true;
    
    // If all animals mode, pre-spawn one of each animal
    if (gameState.allAnimalsMode) {
        for (let animalType of ANIMAL_KEYS) {
            gameState.animals.push(new Animal(animalType));
        }
        gameState.totalAnimalsSpawned = ANIMAL_KEYS.length;
    }
    
    updatePlayButton();
}

// Start when page loads
window.addEventListener('load', init);
