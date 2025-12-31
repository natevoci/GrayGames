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
    butterflies: {
        name: 'Butterflies',
        color: '#FF69B4',
        size: 40,
        speed: 1.5,
        points: 15,
        emoji: '🦋',
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
    dogs: {
        name: 'Dogs',
        color: '#DAA520',
        size: 48,
        speed: 2.2,
        points: 25,
        emoji: '🐕'
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
    crabs: {
        name: 'Crabs',
        color: '#FF4500',
        size: 42,
        speed: 1.4,
        points: 18,
        emoji: '🦀'
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
    gnomes: {
        name: 'Gnomes',
        color: '#228B22',
        size: 44,
        speed: 1.2,
        points: 16,
        emoji: '🧙'
    },
    frogs: {
        name: 'Frogs',
        color: '#32CD32',
        size: 40,
        speed: 2,
        points: 14,
        emoji: '🐸'
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
            case 'butterflies':
                this.drawButterfly();
                break;
            case 'cats':
                this.drawCat();
                break;
            case 'dogs':
                this.drawDog();
                break;
            case 'fish':
                this.drawFish();
                break;
            case 'crabs':
                this.drawCrab();
                break;
            case 'fairies':
                this.drawFairy();
                break;
            case 'gnomes':
                this.drawGnome();
                break;
            case 'frogs':
                this.drawFrog();
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
            break;
        case 'butterflies':
            // Garden - colorful flower field
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#FFB6D9');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawFlowers();
            break;
        case 'cats':
            // Cozy home - warm indoor colors
            gradient.addColorStop(0, '#F5DEB3');
            gradient.addColorStop(1, '#DEB887');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawIndoorElements();
            break;
        case 'dogs':
            // Park - green grass and sky
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#90EE90');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawParkElements();
            break;
        case 'fish':
            // Underwater - blues and teals
            gradient.addColorStop(0, '#20B2AA');
            gradient.addColorStop(1, '#1E90FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawUnderwater();
            break;
        case 'crabs':
            // Beach - sand and water
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#87CEEB');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawBeachElements();
            break;
        case 'fairies':
            // Magical forest - purples and blues
            gradient.addColorStop(0, '#9370DB');
            gradient.addColorStop(1, '#DDA0DD');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawMagicalElements();
            break;
        case 'gnomes':
            // Forest - greens and browns
            gradient.addColorStop(0, '#228B22');
            gradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawForestElements();
            break;
        case 'frogs':
            // Pond - water lily setting
            gradient.addColorStop(0, '#4169E1');
            gradient.addColorStop(1, '#00CED1');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            drawPondElements();
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
