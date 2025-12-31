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
    SPAWN_RATE_BASE: 0.04,
    SPAWN_RATE_INCREMENT: 0.01,
    BASE_SPEED_MULTIPLIER: 0.5
};

// Animal definitions - each with unique behavior
const ANIMAL_TYPES = {
    mice: {
        name: 'Mice',
        color: '#8B4513',
        size: 35,
        speed: 2,
        points: 10,
        emoji: '🐭'
    },
    ladybugs: {
        name: 'Ladybugs',
        color: '#FF0000',
        size: 32,
        speed: 1.6,
        points: 13,
        emoji: '🐞'
    },
    butterflies: {
        name: 'Butterflies',
        color: '#FF69B4',
        size: 40,
        speed: 1.5,
        points: 15,
        emoji: '🦋',
        wobble: true
    },
    dragonflies: {
        name: 'Dragonflies',
        color: '#00FF00',
        size: 38,
        speed: 2.4,
        points: 17,
        emoji: '🪰',
        wobble: true
    },
    cats: {
        name: 'Cats',
        color: '#FF8C00',
        size: 45,
        speed: 1.8,
        points: 20,
        emoji: '🐱'
    },
    snails: {
        name: 'Snails',
        color: '#A0826D',
        size: 36,
        speed: 0.6,
        points: 11,
        emoji: '🐌'
    },
    dogs: {
        name: 'Dogs',
        color: '#DAA520',
        size: 48,
        speed: 2.2,
        points: 25,
        emoji: '🐕'
    },
    fireflies: {
        name: 'Fireflies',
        color: '#FFD700',
        size: 30,
        speed: 1.5,
        points: 16,
        emoji: '🪲',
        wobble: true
    },
    fish: {
        name: 'Fish',
        color: '#00CED1',
        size: 38,
        speed: 1.6,
        points: 12,
        emoji: '🐟',
        wobble: true
    },
    koalas: {
        name: 'Koalas',
        color: '#808080',
        size: 46,
        speed: 1.1,
        points: 21,
        emoji: '🐨'
    },
    crabs: {
        name: 'Crabs',
        color: '#FF4500',
        size: 42,
        speed: 1.4,
        points: 18,
        emoji: '🦀'
    },
    wombats: {
        name: 'Wombats',
        color: '#654321',
        size: 44,
        speed: 1.2,
        points: 19,
        emoji: '🐾'
    },
    fairies: {
        name: 'Fairies',
        color: '#FFD700',
        size: 36,
        speed: 1.3,
        points: 22,
        emoji: '🧚',
        wobble: true
    },
    sugarGliders: {
        name: 'Sugar Gliders',
        color: '#E0E0E0',
        size: 34,
        speed: 2.2,
        points: 20,
        emoji: '🦘',
        wobble: true
    },
    gnomes: {
        name: 'Gnomes',
        color: '#228B22',
        size: 44,
        speed: 1.2,
        points: 16,
        emoji: '🧙'
    },
    kookaburras: {
        name: 'Kookaburras',
        color: '#8B6F47',
        size: 42,
        speed: 1.7,
        points: 18,
        emoji: '🦅'
    },
    echidnas: {
        name: 'Echidnas',
        color: '#5C4033',
        size: 40,
        speed: 1.3,
        points: 17,
        emoji: '🦔'
    },
    frogs: {
        name: 'Frogs',
        color: '#32CD32',
        size: 40,
        speed: 2,
        points: 14,
        emoji: '🐸'
    },
    rabbits: {
        name: 'Rabbits',
        color: '#FFF8DC',
        size: 38,
        speed: 2.3,
        points: 19,
        emoji: '🐰',
        wobble: true
    }
};

const ANIMAL_KEYS = Object.keys(ANIMAL_TYPES);

// Game state
let gameState = {
    level: 1,
    score: 0,
    caughtThisLevel: 0,
    currentAnimalType: 'mice',
    animals: [],
    totalAnimalsSpawned: 0,
    netX: CONFIG.CANVAS_WIDTH / 2,
    netY: CONFIG.CANVAS_HEIGHT / 2,
    isAnimating: false,
    isPaused: false,
    speedMultiplier: 1,
    isMouseDown: false,
    isSpacePressed: false,
    levelComplete: false,
    levelCompleteInputReceived: false,
    gameStarted: false,
    startupInputReceived: false
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
    }

    update() {
        // Move horizontally with speed multiplier
        this.x += this.speed * this.direction * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
        
        // Add wobble effect for some animals
        if (this.wobbleAmount > 0) {
            this.wobbleOffset += 0.05 * CONFIG.BASE_SPEED_MULTIPLIER * gameState.speedMultiplier;
            this.y = this.baseY + Math.sin(this.wobbleOffset) * this.wobbleAmount;
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
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.6, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
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
        ctx.quadraticCurveTo(-s * 0.8, s * 0.3, -s * 0.9, s * 0.5);
        ctx.stroke();
    }

    drawLadybug() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.5, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, -s * 0.4, s * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-s * 0.08, -s * 0.45, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.08, -s * 0.45, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Black pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.08, -s * 0.45, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.08, -s * 0.45, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // Middle line
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.2);
        ctx.lineTo(0, s * 0.4);
        ctx.stroke();
        
        // Black spots
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.25, -s * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-s * 0.25, s * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.25, s * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, s * 0.25, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
    }

    drawButterfly() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.15, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#FF69B4';
        // Top left wing
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, -s * 0.25, s * 0.35, s * 0.25, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Top right wing
        ctx.beginPath();
        ctx.ellipse(s * 0.35, -s * 0.25, s * 0.35, s * 0.25, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom wings (darker)
        ctx.fillStyle = '#FF1493';
        // Bottom left wing
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, s * 0.25, s * 0.3, s * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Bottom right wing
        ctx.beginPath();
        ctx.ellipse(s * 0.35, s * 0.25, s * 0.3, s * 0.2, -0.3, 0, Math.PI * 2);
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
        // Body
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.18, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
        // Top left wing
        ctx.beginPath();
        ctx.ellipse(-s * 0.4, -s * 0.15, s * 0.25, s * 0.35, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Top right wing
        ctx.beginPath();
        ctx.ellipse(s * 0.4, -s * 0.15, s * 0.25, s * 0.35, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom wings
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, s * 0.15, s * 0.2, s * 0.3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.35, s * 0.15, s * 0.2, s * 0.3, -0.2, 0, Math.PI * 2);
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
        // Shell - spiral
        ctx.fillStyle = '#A0826D';
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.1, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Shell spiral lines
        ctx.strokeStyle = '#8B6F47';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.1, s * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-s * 0.15, -s * 0.1, s * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.ellipse(s * 0.1, s * 0.1, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.25, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes on stalks
        ctx.strokeStyle = '#CD853F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.1, -s * 0.35);
        ctx.lineTo(s * 0.05, -s * 0.5);
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.05, -s * 0.5, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFirefly() {
        const s = this.config.size;
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
        
        // Glow effect
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.2, s * 0.4, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-s * 0.25, -s * 0.1, s * 0.2, s * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.25, -s * 0.1, s * 0.2, s * 0.3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawKoala() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.5, s * 0.5, 0, 0, Math.PI * 2);
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
        // Body (stocky)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
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
        
        // Gliding membrane
        ctx.fillStyle = 'rgba(224, 224, 224, 0.7)';
        ctx.beginPath();
        ctx.ellipse(-s * 0.35, 0, s * 0.2, s * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.35, 0, s * 0.2, s * 0.35, 0.3, 0, Math.PI * 2);
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
        // Body
        ctx.fillStyle = '#8B6F47';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.5, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#8B6F47';
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.2, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#FFB90F';
        ctx.beginPath();
        ctx.moveTo(s * 0.5, -s * 0.15);
        ctx.lineTo(s * 0.85, -s * 0.2);
        ctx.lineTo(s * 0.5, -s * 0.05);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * 0.3, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#6B5638';
        ctx.beginPath();
        ctx.ellipse(-s * 0.25, 0, s * 0.3, s * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEchidna() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#5C4033';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.5, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes on back
        ctx.strokeStyle = '#5C4033';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            const angle = (i - 2) * 0.3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * s * 0.3, Math.sin(angle) * s * 0.35 - s * 0.3);
            ctx.lineTo(Math.cos(angle) * s * 0.35, Math.sin(angle) * s * 0.45 - s * 0.5);
            ctx.stroke();
        }
        
        // Head
        ctx.fillStyle = '#5C4033';
        ctx.beginPath();
        ctx.arc(s * 0.25, -s * 0.3, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Long snout
        ctx.fillStyle = '#6B5344';
        ctx.beginPath();
        ctx.ellipse(s * 0.45, -s * 0.2, s * 0.2, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.15, -s * 0.35, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCat() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.5, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
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
        // Body
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.1, s * 0.55, s * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        
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
        
        // Tail
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, s * 0.2);
        ctx.quadraticCurveTo(-s * 0.8, -s * 0.1, -s * 0.9, -s * 0.3);
        ctx.stroke();
    }

    drawFish() {
        const s = this.config.size;
        // Body
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Top fin
        ctx.fillStyle = '#20B2AA';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.35, s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bottom fin
        ctx.fillStyle = '#20B2AA';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.35, s * 0.25, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail fin
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s * 0.2);
        ctx.lineTo(-s * 0.8, -s * 0.35);
        ctx.lineTo(-s * 0.8, s * 0.35);
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
        ctx.lineTo(-s * 0.2, -s * 0.55);
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.55, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(s * 0.1, -s * 0.35);
        ctx.lineTo(s * 0.2, -s * 0.55);
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * 0.55, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Claws
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 4;
        // Left claw
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, s * 0.1);
        ctx.lineTo(-s * 0.6, s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.6, s * 0.05);
        ctx.lineTo(-s * 0.7, s * 0.15);
        ctx.stroke();
        
        // Right claw
        ctx.beginPath();
        ctx.moveTo(s * 0.35, s * 0.1);
        ctx.lineTo(s * 0.6, s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.6, s * 0.05);
        ctx.lineTo(s * 0.7, s * 0.15);
        ctx.stroke();
        
        // Legs
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.3;
            ctx.beginPath();
            ctx.moveTo(s * 0.25 * Math.cos(angle), s * 0.3 * Math.sin(angle));
            ctx.lineTo(s * 0.45 * Math.cos(angle), s * 0.5 * Math.sin(angle));
            ctx.stroke();
        }
    }

    drawFairy() {
        const s = this.config.size;
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
        
        // Wings
        ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
        ctx.beginPath();
        ctx.ellipse(-s * 0.4, -s * 0.1, s * 0.25, s * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.4, -s * 0.1, s * 0.25, s * 0.35, 0.3, 0, Math.PI * 2);
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
        
        // Magic wand
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.35, -s * 0.4);
        ctx.lineTo(s * 0.5, -s * 0.55);
        ctx.stroke();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(s * 0.5, -s * 0.55, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGnome() {
        const s = this.config.size;
        // Hat
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, -s * 0.15);
        ctx.lineTo(0, -s * 0.6);
        ctx.lineTo(s * 0.25, -s * 0.15);
        ctx.fill();
        
        // Hat brim
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.15, s * 0.3, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Face
        ctx.fillStyle = '#FFD89B';
        ctx.beginPath();
        ctx.arc(0, s * 0.05, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Beard
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.arc(0, s * 0.25, s * 0.2, 0, Math.PI);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.4, s * 0.35, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-s * 0.1, 0, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.1, 0, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(0, s * 0.1, s * 0.07, 0, Math.PI * 2);
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
        // Body
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.45, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, s * 0.32, 0, Math.PI * 2);
        ctx.fill();
        
        // Long ears
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.ellipse(-s * 0.15, -s * 0.65, s * 0.12, s * 0.35, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.15, -s * 0.65, s * 0.12, s * 0.35, 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ear
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(-s * 0.15, -s * 0.65, s * 0.06, s * 0.25, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(s * 0.15, -s * 0.65, s * 0.06, s * 0.25, 0.1, 0, Math.PI * 2);
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
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(0, -s * 0.15, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail (cotton)
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(-s * 0.4, s * 0.35, s * 0.15, 0, Math.PI * 2);
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
    if (gameState.totalAnimalsSpawned < CONFIG.ANIMALS_PER_LEVEL) {
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
    const animalName = ANIMAL_TYPES[gameState.currentAnimalType].name;
    
    message.textContent = `You caught all the ${animalName}.`;
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
    
    if (gameState.level < ANIMAL_KEYS.length) {
        gameState.level++;
        gameState.caughtThisLevel = 0;
        gameState.totalAnimalsSpawned = 0;
        gameState.currentAnimalType = ANIMAL_KEYS[gameState.level - 1];
        gameState.animals = [];
        
        // Play level up sound
        playSound('levelUpSound');
    } else {
        // Already at max level, reset for continued play
        gameState.caughtThisLevel = 0;
        gameState.totalAnimalsSpawned = 0;
        gameState.animals = [];
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
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const speedSlider = document.getElementById('speedSlider');

    // Play button - begin the game or resume from pause
    playBtn.addEventListener('click', () => {
        if (!gameState.gameStarted) {
            // Starting new game
            gameState.gameStarted = true;
            gameState.isAnimating = true;
        } else {
            // Resuming from pause
            gameState.isPaused = false;
        }
        updatePlayButton();
    });

    // Pause button - pause the game
    pauseBtn.addEventListener('click', () => {
        gameState.isPaused = true;
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
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (!gameState.gameStarted) {
        // Game hasn't started yet
        playBtn.textContent = 'Start';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    } else if (gameState.isPaused) {
        // Game is paused
        playBtn.textContent = 'Resume';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    } else {
        // Game is playing
        playBtn.disabled = true;
        pauseBtn.disabled = false;
    }
}

// Initialize and start game
function init() {
    // Load background images
    const animalTypes = ['mice', 'ladybugs', 'butterflies', 'dragonflies', 'cats', 'snails', 'dogs', 'fireflies', 'fish', 'koalas', 'crabs', 'wombats', 'fairies', 'sugarGliders', 'gnomes', 'kookaburras', 'echidnas', 'frogs', 'rabbits'];
    
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
    updatePlayButton();
}

// Start when page loads
window.addEventListener('load', init);
