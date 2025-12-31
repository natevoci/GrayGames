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
        // Draw cute rounded animal shape
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }
        
        // Body
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.config.size, this.config.size * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(this.config.size * 0.4, -this.config.size * 0.4, this.config.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.config.size * 0.55, -this.config.size * 0.55, this.config.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.config.size * 0.6, -this.config.size * 0.6, this.config.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
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
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Draw clouds (decorative)
    drawClouds();

    // Draw all animals
    for (let animal of gameState.animals) {
        animal.draw();
    }

    // Draw net
    drawNet(gameState.netX, gameState.netY, CONFIG.NET_SIZE);
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
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const speedSlider = document.getElementById('speedSlider');

    // Start button - begin the game
    startBtn.addEventListener('click', () => {
        gameState.isAnimating = true;
        gameState.isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
    });

    // Pause button - pause the game
    pauseBtn.addEventListener('click', () => {
        gameState.isPaused = true;
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
    });

    // Resume button - resume the game
    resumeBtn.addEventListener('click', () => {
        gameState.isPaused = false;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
    });

    // Speed slider - adjust game speed
    speedSlider.addEventListener('input', (e) => {
        gameState.speedMultiplier = parseFloat(e.target.value);
        updateUI();
    });
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
}

// Start when page loads
window.addEventListener('load', init);
