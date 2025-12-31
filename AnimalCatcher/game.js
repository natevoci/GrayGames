/* ===================================
   ANIMAL CATCHER - Game Logic
   A gentle game for 4-year-olds
   =================================== */

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    
    switch(gameState.currentAnimalType) {
        case 'mice':
            // Barn/farm setting - warm yellows and browns
            gradient.addColorStop(0, '#FFD89B');
            gradient.addColorStop(1, '#DEB887');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawCheese();
            break;
        case 'ladybugs':
            // Garden - green grass with flowers
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#90EE90');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawGardenElements();
            break;
        case 'butterflies':
            // Garden - colorful flower field
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#FFB6D9');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawFlowers();
            break;
        case 'dragonflies':
            // Pond/water setting
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#4169E1');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawPondElements();
            break;
        case 'cats':
            // Cozy home - warm indoor colors
            gradient.addColorStop(0, '#F5DEB3');
            gradient.addColorStop(1, '#DEB887');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawIndoorElements();
            break;
        case 'snails':
            // Garden ground/damp setting
            gradient.addColorStop(0, '#90EE90');
            gradient.addColorStop(1, '#8B8B7A');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawGardenGround();
            break;
        case 'dogs':
            // Park - green grass and sky
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#90EE90');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawParkElements();
            break;
        case 'fireflies':
            // Night sky setting
            gradient.addColorStop(0, '#001a4d');
            gradient.addColorStop(1, '#003d99');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawNightSky();
            break;
        case 'fish':
            // Underwater - blues and teals
            gradient.addColorStop(0, '#20B2AA');
            gradient.addColorStop(1, '#1E90FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawUnderwater();
            break;
        case 'koalas':
            // Australian eucalyptus forest
            gradient.addColorStop(0, '#90EE90');
            gradient.addColorStop(1, '#228B22');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawEucalyptusForest();
            break;
        case 'crabs':
            // Beach - sand and water
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#87CEEB');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawBeachElements();
            break;
        case 'wombats':
            // Australian outback
            gradient.addColorStop(0, '#DAA520');
            gradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawOutback();
            break;
        case 'fairies':
            // Magical forest - purples and blues
            gradient.addColorStop(0, '#9370DB');
            gradient.addColorStop(1, '#DDA0DD');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawMagicalElements();
            break;
        case 'sugarGliders':
            // Eucalyptus night forest
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawNightForest();
            break;
        case 'gnomes':
            // Forest - greens and browns
            gradient.addColorStop(0, '#228B22');
            gradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawForestElements();
            break;
        case 'kookaburras':
            // Australian bushland
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#DAA520');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawBushland();
            break;
        case 'echidnas':
            // Desert/bush setting
            gradient.addColorStop(0, '#FFE4B5');
            gradient.addColorStop(1, '#DAA520');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawDesertBush();
            break;
        case 'frogs':
            // Pond - water lily setting (original)
            gradient.addColorStop(0, '#4169E1');
            gradient.addColorStop(1, '#00CED1');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawPondElements();
            break;
        case 'rabbits':
            // Meadow/grassland
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#90EE90');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawMeadow();
            break;
        default:
            // Default sky
            gradient.addColorStop(0, '#87ceeb');
            gradient.addColorStop(1, '#e0f6ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawClouds();
    }
}

// Draw decorative clouds
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    // Cloud 1
    ctx.beginPath();
    ctx.arc(150, 80, 30, 0, Math.PI * 2);
    ctx.arc(180, 70, 40, 0, Math.PI * 2);
    ctx.arc(210, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 2
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 150, 150, 35, 0, Math.PI * 2);
    ctx.arc(CONFIG.CANVAS_WIDTH - 110, 140, 45, 0, Math.PI * 2);
    ctx.arc(CONFIG.CANVAS_WIDTH - 70, 155, 35, 0, Math.PI * 2);
    ctx.fill();
}

// Garden elements for ladybugs
function drawGardenElements() {
    // Grass blades
    ctx.strokeStyle = '#90EE90';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.CANVAS_WIDTH / 8, CONFIG.CANVAS_HEIGHT);
        ctx.quadraticCurveTo(i * CONFIG.CANVAS_WIDTH / 8 + 10, CONFIG.CANVAS_HEIGHT - 50, i * CONFIG.CANVAS_WIDTH / 8, CONFIG.CANVAS_HEIGHT - 100);
        ctx.stroke();
    }
    
    // Flowers
    ctx.fillStyle = '#FF1493';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 200, CONFIG.CANVAS_HEIGHT - 60, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Garden with flowers
function drawFlowers() {
    // Random flowers for garden setting
    ctx.fillStyle = '#FF1493';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(50 + i * 200, CONFIG.CANVAS_HEIGHT - 60, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(65 + i * 200, CONFIG.CANVAS_HEIGHT - 60, 5, 40);
    }
}

// Cheese blocks for mice
function drawCheese() {
    // Draw three pieces of cheese scattered around
    ctx.fillStyle = '#FFD700';
    
    // Cheese piece 1 - top left
    ctx.fillRect(50, 80, 60, 50);
    // Add holes
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(65, 90, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(85, 110, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Cheese piece 2 - top right
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(CONFIG.CANVAS_WIDTH - 100, 100);
    ctx.lineTo(CONFIG.CANVAS_WIDTH - 40, 100);
    ctx.lineTo(CONFIG.CANVAS_WIDTH - 50, 140);
    ctx.lineTo(CONFIG.CANVAS_WIDTH - 110, 140);
    ctx.fill();
    // Add holes
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 80, 110, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 60, 125, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Cheese piece 3 - bottom center
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 40, CONFIG.CANVAS_HEIGHT - 80, 70, 45);
    // Add holes
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH / 2 - 20, CONFIG.CANVAS_HEIGHT - 65, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH / 2 + 10, CONFIG.CANVAS_HEIGHT - 50, 6, 0, Math.PI * 2);
    ctx.fill();
}

// Indoor elements for cat
function drawIndoorElements() {
    // Simple window
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 150, 100);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(95, 20);
    ctx.lineTo(95, 120);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 70);
    ctx.lineTo(170, 70);
    ctx.stroke();
    
    // Picture on wall
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 100, 30, 80, 60);
}

// Park elements for dog
function drawParkElements() {
    // Simple tree
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 80, 200, 20, 80);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 70, 180, 50, 0, Math.PI * 2);
    ctx.fill();
}

// Underwater elements for fish
function drawUnderwater() {
    // Water plants/seaweed
    ctx.strokeStyle = '#90EE90';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 200, CONFIG.CANVAS_HEIGHT);
        ctx.quadraticCurveTo(80 + i * 200, 150, 60 + i * 200, 0);
        ctx.stroke();
    }
    
    // Bubbles
    ctx.fillStyle = 'rgba(173, 216, 230, 0.5)';
    ctx.beginPath();
    ctx.arc(100, 100, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 80, 200, 12, 0, Math.PI * 2);
    ctx.fill();
}

// Beach elements for crab
function drawBeachElements() {
    // Sand ripples
    ctx.strokeStyle = 'rgba(210, 180, 140, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 30 - i * 40, 100 - i * 20, 0, Math.PI);
        ctx.stroke();
    }
    
    // Simple shell
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(100, CONFIG.CANVAS_HEIGHT - 50, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Magical elements for fairy
function drawMagicalElements() {
    // Sparkles
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 5; i++) {
        const x = 50 + i * 150;
        const y = 80 + (i % 2) * 100;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        // Star lines
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + 8, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
    }
}

// Forest elements for gnome
function drawForestElements() {
    // Trees
    for (let i = 0; i < 2; i++) {
        ctx.fillStyle = '#654321';
        ctx.fillRect(50 + i * (CONFIG.CANVAS_WIDTH - 100), 150, 15, 100);
        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.arc(57.5 + i * (CONFIG.CANVAS_WIDTH - 100), 140, 35, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Mushrooms
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH / 2 - 50, CONFIG.CANVAS_HEIGHT - 40, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 55, CONFIG.CANVAS_HEIGHT - 25, 10, 25);
}

// Pond elements for frog
function drawPondElements() {
    // Water lilies
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 100, 250, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Lily pads center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(100, 100, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 100, 250, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Garden ground for snails
function drawGardenGround() {
    // Rocks
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(80, CONFIG.CANVAS_HEIGHT - 40, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 80, CONFIG.CANVAS_HEIGHT - 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Leaves
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(150, CONFIG.CANVAS_HEIGHT - 60, 40, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Night sky for fireflies
function drawNightSky() {
    // Stars
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * CONFIG.CANVAS_WIDTH;
        const y = Math.random() * CONFIG.CANVAS_HEIGHT * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Moon
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 60, 60, 40, 0, Math.PI * 2);
    ctx.fill();
}

// Eucalyptus forest for koalas
function drawEucalyptusForest() {
    // Eucalyptus trees
    ctx.fillStyle = '#654321';
    ctx.fillRect(50, 150, 20, 150);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(60, 140, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#654321';
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 70, 180, 20, 120);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 60, 170, 50, 0, Math.PI * 2);
    ctx.fill();
}

// Outback for wombats
function drawOutback() {
    // Desert brush
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.arc(150, CONFIG.CANVAS_HEIGHT - 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 150, CONFIG.CANVAS_HEIGHT - 70, 35, 0, Math.PI * 2);
    ctx.fill();
}

// Night forest for sugar gliders
function drawNightForest() {
    // Trees silhouettes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(50, 100, 30, 200);
    ctx.beginPath();
    ctx.arc(65, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 80, 120, 30, 180);
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 65, 100, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 60, 50, 35, 0, Math.PI * 2);
    ctx.fill();
}

// Bushland for kookaburras
function drawBushland() {
    // Bushes
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.ellipse(150, CONFIG.CANVAS_HEIGHT - 80, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(CONFIG.CANVAS_WIDTH - 150, CONFIG.CANVAS_HEIGHT - 90, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Branch
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 100);
    ctx.lineTo(150, 80);
    ctx.stroke();
}

// Desert bush for echidnas
function drawDesertBush() {
    // Bush vegetation
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(100, CONFIG.CANVAS_HEIGHT - 100, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#556B2F';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 100, CONFIG.CANVAS_HEIGHT - 120, 55, 0, Math.PI * 2);
    ctx.fill();
    
    // Rocks
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.arc(200, CONFIG.CANVAS_HEIGHT - 60, 25, 0, Math.PI * 2);
    ctx.fill();
}

// Meadow for rabbits
function drawMeadow() {
    // Tall grass
    ctx.strokeStyle = '#90EE90';
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.CANVAS_WIDTH / 12, CONFIG.CANVAS_HEIGHT);
        ctx.quadraticCurveTo(i * CONFIG.CANVAS_WIDTH / 12 + 15, CONFIG.CANVAS_HEIGHT - 80, i * CONFIG.CANVAS_WIDTH / 12, CONFIG.CANVAS_HEIGHT - 160);
        ctx.stroke();
    }
    
    // Wildflowers
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(80, CONFIG.CANVAS_HEIGHT - 100, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(CONFIG.CANVAS_WIDTH - 100, CONFIG.CANVAS_HEIGHT - 120, 14, 0, Math.PI * 2);
    ctx.fill();
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
