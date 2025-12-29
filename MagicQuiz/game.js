// Magic Quiz - Educational Quiz Game for Kids
// A playful learning experience for 6-year-olds

// Game State
const gameState = {
    isRunning: false,
    isPaused: false,
    currentLevel: 1,
    questionsAnswered: 0,
    correctAnswers: 0,
    currentQuestionIndex: 0,
    currentQuestion: null,
    usedQuestions: [],
    waitingForNext: false
};

// Emoji illustrations for visual appeal
const illustrations = {
    cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐠', 
    cow: '🐄', pig: '🐷', duck: '🦆', frog: '🐸',
    red: '🔴', blue: '🔵', yellow: '⭐', green: '💚',
    apple: '🍎', orange: '🍊', banana: '🍌', grapes: '🍇',
    sun: '☀️', moon: '🌙', star: '⭐', rain: '🌧️',
    tree: '🌳', flower: '🌸', grass: '🌱', leaf: '🍃',
    car: '🚗', bike: '🚲', bus: '🚌', train: '🚂',
    ball: '⚽', doll: '🪆', drum: '🥁', kite: '🪁'
};

// Question database organized by difficulty (word length)
// Level 1-2: Simple answers (shorter words)
// Level 3+: More complex answers and longer words
const questionDatabase = {
    level1: [
        { question: 'What do you pat?', answer: 'dog', article: 'a', hint: 'A furry friend', illustration: illustrations.dog },
        { question: 'What says meow?', answer: 'cat', article: 'a', hint: 'A furry pet', illustration: illustrations.cat },
        { question: 'What swims in water?', answer: 'fish', article: 'a', hint: 'Lives in water', illustration: illustrations.fish },
        { question: 'What has wings?', answer: 'bird', article: 'a', hint: 'Flies in the sky', illustration: illustrations.bird },
        { question: 'What gives milk?', answer: 'cow', article: 'a', hint: 'A farm animal', illustration: illustrations.cow },
        { question: 'What says oink?', answer: 'pig', article: 'a', hint: 'Farm animal', illustration: illustrations.pig },
        { question: 'What is red?', answer: 'apple', article: 'an', hint: 'A fruit', illustration: illustrations.apple },
        { question: 'What is yellow?', answer: 'sun', article: 'the', hint: 'In the sky', illustration: illustrations.sun },
        { question: 'What grows in soil?', answer: 'tree', article: 'a', hint: 'Has branches', illustration: illustrations.tree },
        { question: 'What animal quacks?', answer: 'duck', article: 'a', hint: 'Water bird', illustration: illustrations.duck },
        { question: 'What is green?', answer: 'leaf', article: 'a', hint: 'On tree', illustration: illustrations.leaf }
    ],
    level2: [
        { question: 'What does a duck say?', answer: 'quack', article: '', hint: 'A water sound', illustration: illustrations.duck },
        { question: 'What hops and croaks?', answer: 'frog', article: 'a', hint: 'Green and jumpy', illustration: illustrations.frog },
        { question: 'What is round and kickable?', answer: 'ball', article: 'a', hint: 'You play with it', illustration: illustrations.ball },
        { question: 'What comes at night?', answer: 'moon', article: 'the', hint: 'Glows in dark', illustration: illustrations.moon },
        { question: 'What falls from clouds?', answer: 'rain', article: 'the', hint: 'Gets you wet', illustration: illustrations.rain },
        { question: 'What is green and soft?', answer: 'grass', article: 'the', hint: 'On the ground', illustration: illustrations.grass },
        { question: 'What is this beautiful fruit?', answer: 'orange', article: 'an', hint: 'Citrus fruit', illustration: illustrations.orange },
        { question: 'What is yellow and sweet?', answer: 'banana', article: 'a', hint: 'A curved fruit', illustration: illustrations.banana },
        { question: 'What grows from a seed?', answer: 'plant', article: 'a', hint: 'Needs water', illustration: illustrations.flower },
        { question: 'What has petals and smells nice?', answer: 'flower', article: 'a', hint: 'Grows in garden', illustration: illustrations.flower },
        { question: 'What has leaves?', answer: 'tree', article: 'a', hint: 'On branches', illustration: illustrations.leaf },
        { question: 'What do you ride?', answer: 'bike', article: 'a', hint: 'Has two wheels', illustration: illustrations.bike },
        { question: 'What has four wheels?', answer: 'car', article: 'a', hint: 'For driving', illustration: illustrations.car },
        { question: 'What is a sweet treat?', answer: 'lolly', article: 'a', hint: 'You like eating it', illustration: '🍬' },
        { question: 'What is cold and frozen?', answer: 'ice', article: '', hint: 'You can put it in drinks', illustration: '🧊' },
        { question: 'What is white and floats?', answer: 'cloud', article: 'a', hint: 'In the sky', illustration: '☁️' },
        { question: 'What do you draw with?', answer: 'pencil', article: 'a', hint: 'Writing tool you can sharpen', illustration: '✏️' }
    ],
    level3: [
        { question: 'What fruit is purple?', answer: 'grape', article: 'a', hint: 'Bunch of small fruits', illustration: illustrations.grapes },
        { question: 'What animal hops?', answer: 'rabbit', article: 'a', hint: 'Has long ears', illustration: '🐰' },
        { question: 'What is round and white in the night?', answer: 'moon', article: 'the', hint: 'Stars nearby', illustration: illustrations.moon },
        { question: 'What do you wear on your foot?', answer: 'shoe', article: 'a', hint: 'Protects feet', illustration: '👟' },
        { question: 'What do you wear on your hand?', answer: 'glove', article: 'a', hint: 'Keeps warm', illustration: '🧤' },
        { question: 'What is a transport on rails?', answer: 'train', article: 'a', hint: 'Goes on tracks', illustration: illustrations.train },
        { question: 'What is a vehicle for many people?', answer: 'bus', article: 'a', hint: 'Many people ride it', illustration: illustrations.bus },
        { question: 'What does a piano have?', answer: 'keys', article: '', hint: 'You press them', illustration: '🎹' },
        { question: 'What animal has a trunk?', answer: 'elephant', article: 'an', hint: 'Big grey animal', illustration: '🐘' },
        { question: 'What big cat roars?', answer: 'lion', article: 'a', hint: 'King of jungle', illustration: '🦁' },
        { question: 'What is sweet and sticky?', answer: 'honey', article: '', hint: 'Bees make it', illustration: '🍯' },
        { question: 'What comes after rain?', answer: 'rainbow', article: 'a', hint: 'Many colors', illustration: '🌈' },
        { question: 'What is a green vegetable?', answer: 'pea', article: 'a', hint: 'Small round ones', illustration: '🟢' },
        { question: 'What baby animal barks?', answer: 'puppy', article: 'a', hint: 'Young dog', illustration: '🐶' },
        { question: 'What is warm and bright?', answer: 'fire', article: '', hint: 'Burns hot', illustration: '🔥' },
        { question: 'What is a big striped animal?', answer: 'zebra', article: 'a', hint: 'African animal', illustration: '🦓' },
        { question: 'What is a big orange vegetable?', answer: 'pumpkin', article: 'a', hint: 'Halloween', illustration: '🎃' },
        { question: 'What has keys and makes music?', answer: 'piano', article: 'a', hint: 'Instrument', illustration: '🎹' },
        { question: 'What is white and falls in winter?', answer: 'snow', article: 'the', hint: 'Cold', illustration: '❄️' }
    ],
    level4: [
        { question: 'What do you sleep in?', answer: 'bed', article: 'a', hint: 'Mattress, Pillows, Doonas', illustration: '🛏️' },
        { question: 'What has wheels and carries you?', answer: 'bicycle', article: 'a', hint: 'Two wheels', illustration: illustrations.bike },
        { question: 'What is healthy to drink?', answer: 'water', article: '', hint: 'No color', illustration: '💧' },
        { question: 'What do you eat with?', answer: 'spoon', article: 'a', hint: 'Kitchen tool', illustration: '🥄' },
        { question: 'What is a big animal with spots?', answer: 'leopard', article: 'a', hint: 'Wild cat', illustration: '🐆' },
        { question: 'What big cat has stripes?', answer: 'tiger', article: 'a', hint: 'Orange striped', illustration: '🐯' },
        { question: 'What is a flying mammal?', answer: 'bat', article: 'a', hint: 'Nocturnal creature', illustration: '🦇' },
        { question: 'What crawls on the ground?', answer: 'snake', article: 'a', hint: 'No legs', illustration: '🐍' },
        { question: 'What is a small insect?', answer: 'ant', article: 'an', hint: 'Works together', illustration: '🐜' },
        { question: 'What buzzes around flowers?', answer: 'bee', article: 'a', hint: 'Makes honey', illustration: '🐝' },
        { question: 'What is soft and cuddly?', answer: 'teddy', article: 'a', hint: 'Stuffed animal', illustration: '🧸' },
        { question: 'What is round and you bounce it?', answer: 'ball', article: 'a', hint: 'Sport ball', illustration: '⚽' },
        { question: 'What food is crunchy and orange?', answer: 'carrot', article: 'a', hint: 'Vegetable', illustration: '🥕' },
        { question: 'What food is red and round?', answer: 'tomato', article: 'a', hint: 'Fruit vegetable', illustration: '🍅' },
        { question: 'What is a big cat with mane?', answer: 'lion', article: 'a', hint: 'Roars loud', illustration: '🦁' },
        { question: 'What is an animal with a hump?', answer: 'camel', article: 'a', hint: 'Desert', illustration: '🐫' },
        { question: 'What is brown and furry?', answer: 'bear', article: 'a', hint: 'Forest animal', illustration: '🐻' },
        { question: 'What is a red fruit?', answer: 'cherry', article: 'a', hint: 'Small fruit', illustration: '🍒' },
        { question: 'What is a yellow fruit?', answer: 'lemon', article: 'a', hint: 'Sour', illustration: '🍋' },
        { question: 'What is a popular sport?', answer: 'tennis', article: '', hint: 'With racket', illustration: '🎾' }
    ],
    level5: [
        { question: 'What is a happy day with gifts?', answer: 'birthday', article: 'a', hint: 'Celebrate day', illustration: '🎂' },
        { question: 'What is a story with a strip of pictures?', answer: 'comic', article: 'a', hint: 'Funny drawings', illustration: '📖' },
        { question: 'What animal gives wool?', answer: 'sheep', article: 'a', hint: 'Fluffy animal', illustration: '🐑' },
        { question: 'What animal lives in a burrow?', answer: 'rabbit', article: 'a', hint: 'Hops around', illustration: '🐰' },
        { question: 'What is a striped animal?', answer: 'zebra', article: 'a', hint: 'Black and white', illustration: '🦓' },
        { question: 'What long neck animal eats leaves?', answer: 'giraffe', article: 'a', hint: 'Tallest animal', illustration: '🦒' },
        { question: 'What is a funny primate?', answer: 'monkey', article: 'a', hint: 'Swings on trees', illustration: '🐵' },
        { question: 'What is a cold place animal?', answer: 'penguin', article: 'a', hint: 'Black and white', illustration: '🐧' },
        { question: 'What is a big water animal?', answer: 'whale', article: 'a', hint: 'Ocean giant', illustration: '🐳' },
        { question: 'What is a creepy crawly?', answer: 'spider', article: 'a', hint: '8 legs', illustration: '🕷️' },
        { question: 'What jumps high and is green?', answer: 'grasshopper', article: 'a', hint: 'Insect', illustration: '🦗' },
        { question: 'What is this red vegetable?', answer: 'chilli', article: 'a', hint: 'Spicy veggie', illustration: '🌶️' },
        { question: 'What is a round snack?', answer: 'biscuit', article: 'a', hint: 'You eat it', illustration: '🍪' },
        { question: 'What is a frozen sweet treat?', answer: 'icecream', article: 'an', hint: 'In a cone', illustration: '🍦' },
        { question: 'What do you wear when cold?', answer: 'jumper', article: 'a', hint: 'Cozy clothing', illustration: '🧶' },
        { question: 'What is a circular treat with a hole?', answer: 'donut', article: 'a', hint: 'Iced, Cinnamon or Jam', illustration: '🍩' },
        { question: 'What is a popular brown treat?', answer: 'chocolate', article: 'a', hint: 'Comes in bars', illustration: '🍫' },
        { question: 'What is an animal with spots?', answer: 'cheetah', article: 'a', hint: 'Fast cat', illustration: '🐆' },
        { question: 'What is a big grey animal?', answer: 'rhino', article: 'a', hint: 'Thick skin and a horn', illustration: '🦏' },
        { question: 'What is a long animal?', answer: 'snake', article: 'a', hint: 'Reptile', illustration: '🐍' }
    ]
};

// Initialize: Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('answerInput').addEventListener('input', handleAnswerInput);
    document.getElementById('hintBtn').addEventListener('click', handleHintButton);
    document.addEventListener('keydown', handleSpaceBar);
}

// Start the game
function startGame() {
    gameState.isRunning = true;
    gameState.isPaused = false;
    gameState.currentLevel = 1;
    gameState.questionsAnswered = 0;
    gameState.correctAnswers = 0;
    gameState.usedQuestions = [];

    updateControlButtons();
    showScreen('gameScreen');
    loadNextQuestion();
    document.getElementById('answerInput').focus();
}

// Load the next question
function loadNextQuestion() {
    if (!gameState.isRunning) return;

    const levelKey = `level${Math.min(gameState.currentLevel, 5)}`;
    const questions = questionDatabase[levelKey];

    // Get unused questions
    let availableQuestions = questions.filter((_, i) => 
        !gameState.usedQuestions.includes(`${levelKey}-${i}`)
    );

    // If all questions at current level are used, get unused from all levels
    if (availableQuestions.length === 0) {
        // Try to get questions from any level that haven't been used
        for (let level = 1; level <= 5; level++) {
            const allLevelQuestions = questionDatabase[`level${level}`];
            availableQuestions = allLevelQuestions.filter((_, i) => 
                !gameState.usedQuestions.includes(`level${level}-${i}`)
            );
            if (availableQuestions.length > 0) {
                break;
            }
        }
    }

    // If still no questions available, end game
    if (availableQuestions.length === 0) {
        endGame();
        return;
    }

    // Pick random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];

    // Find which level this question belongs to and track it
    let questionLevelKey = levelKey;
    let questionIndex = -1;
    
    for (let level = 1; level <= 5; level++) {
        const levelQuestions = questionDatabase[`level${level}`];
        questionIndex = levelQuestions.indexOf(question);
        if (questionIndex !== -1) {
            questionLevelKey = `level${level}`;
            break;
        }
    }

    // Track this question as used
    const questionId = `${questionLevelKey}-${questionIndex}`;
    gameState.usedQuestions.push(questionId);
    gameState.currentQuestion = question;

    // Display question
    displayQuestion(question);
    clearFeedback();
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
}

// Display question and illustration
function displayQuestion(question) {
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('illustration').textContent = question.illustration;
    document.getElementById('hintText').textContent = '';
    document.getElementById('articleLabel').textContent = question.article;
    
    // Update progress
    const questionsUntilNext = 5 - (gameState.questionsAnswered % 5);
    document.getElementById('questionsUntilNext').textContent = questionsUntilNext;
    document.getElementById('currentLevel').textContent = gameState.currentLevel;

    // Update progress bar
    const progress = (gameState.correctAnswers % 5) * 20;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Handle answer input - check as user types
function handleAnswerInput(event) {
    if (!gameState.isRunning || gameState.isPaused || gameState.waitingForNext) return;

    const userAnswer = document.getElementById('answerInput').value.trim().toLowerCase();
    const correctAnswer = gameState.currentQuestion.answer.toLowerCase();

    // Only check if user has typed something
    if (userAnswer === '') {
        clearFeedback();
        return;
    }

    // Check if answer is correct
    if (userAnswer === correctAnswer) {
        gameState.questionsAnswered++;
        gameState.correctAnswers++;
        gameState.waitingForNext = true;
        
        showFeedback('✓ Correct! Great job!<br>Press SPACE for next question', 'correct');
        
        // Check for level up
        if (gameState.correctAnswers % 5 === 0) {
            gameState.currentLevel = Math.min(gameState.currentLevel + 1, 5);
        }

        // Disable input while waiting for space bar
        document.getElementById('answerInput').disabled = true;
    }
}

// Show feedback message
function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = message;
    feedback.className = 'feedback ' + type;
}

// Clear feedback
function clearFeedback() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
}

// Handle space bar to load next question
function handleSpaceBar(event) {
    if (event.code === 'Space' && gameState.waitingForNext) {
        event.preventDefault();
        gameState.waitingForNext = false;
        document.getElementById('answerInput').disabled = false;
        loadNextQuestion();
    }
}

// Handle hint button click
function handleHintButton(event) {
    event.preventDefault();
    if (!gameState.isRunning || gameState.isPaused || !gameState.currentQuestion) return;
    
    const hintText = document.getElementById('hintText');
    const currentHint = `Hint: ${gameState.currentQuestion.hint}`;
    
    // Toggle hint visibility
    if (hintText.textContent === currentHint) {
        hintText.textContent = '';
    } else {
        hintText.textContent = currentHint;
    }
}

// Toggle pause
function togglePause() {
    if (!gameState.isRunning) return;

    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gameState.isPaused ? 'Resume' : 'Pause';

    if (gameState.isPaused) {
        document.getElementById('answerInput').disabled = true;
    } else {
        document.getElementById('answerInput').disabled = false;
        document.getElementById('answerInput').focus();
    }
}

// End game
function endGame() {
    gameState.isRunning = false;
    document.getElementById('finalScore').textContent = gameState.correctAnswers;
    document.getElementById('finalLevel').textContent = gameState.currentLevel;
    showScreen('gameOverScreen');
}

// Reset game
function resetGame() {
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.waitingForNext = false;
    gameState.currentLevel = 1;
    gameState.questionsAnswered = 0;
    gameState.correctAnswers = 0;
    gameState.usedQuestions = [];

    updateControlButtons();
    showScreen('welcomeScreen');
    clearFeedback();
}

// Update control buttons state
function updateControlButtons() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    if (gameState.isRunning) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    } else {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
