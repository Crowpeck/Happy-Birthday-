// ===== Configuration =====
const CONFIG = {
  unlockDate: new Date('2026-06-03T12:00:00'),
  graduationDate: new Date('2026-06-04T23:00:00'),
  monthsaryDate: new Date('2026-06-06T00:00:00'),
  passcode: '06032004',
  monthsaryPasscode: '100625',
  monthsaryAnswer: '8'
};

// ===== State =====
let currentPhase = 'loading';
let countdownInterval = null;
let gradCountdownInterval = null;
let monthsaryCountdownInterval = null;
let musicPlaying = false;
let listenersInitialized = {
  passcode: false,
  envelope: false,
  flower: false,
  monthsaryPasscode: false,
  quiz: false,
  slideshow: false
};

// ===== DOM Elements =====
const screens = {
  loading: document.getElementById('loading'),
  countdown: document.getElementById('countdown-phase'),
  passcode: document.getElementById('passcode-phase'),
  envelope: document.getElementById('envelope-phase'),
  graduation: document.getElementById('graduation-phase'),
  'monthsary-countdown': document.getElementById('monthsary-countdown-phase'),
  'monthsary-passcode': document.getElementById('monthsary-passcode-phase'),
  'monthsary-quiz': document.getElementById('monthsary-quiz-phase'),
  'slideshow': document.getElementById('slideshow-phase')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializePhase();
  }, 1000);
});

function initializePhase() {
  const savedPhase = localStorage.getItem('gift-phase');
  const now = new Date();
  
  if (now < CONFIG.unlockDate) {
    showPhase('countdown');
  } else if (savedPhase === 'slideshow') {
    showPhase('slideshow');
  } else if (savedPhase === 'monthsary-countdown' || savedPhase === 'monthsary-passcode' || savedPhase === 'monthsary-quiz') {
    // Check if monthsary date has passed
    if (now >= CONFIG.monthsaryDate) {
      showPhase('monthsary-passcode');
    } else {
      showPhase('monthsary-countdown');
    }
  } else if (savedPhase === 'envelope' || savedPhase === 'graduation') {
    showPhase(savedPhase);
  } else {
    showPhase('passcode');
  }
}

// ===== Phase Management =====
function showPhase(phase) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  
  // Show target screen
  if (screens[phase]) {
    screens[phase].classList.remove('hidden');
  }
  currentPhase = phase;
  
  // Initialize phase-specific functionality
  switch (phase) {
    case 'countdown':
      initCountdown();
      createFloatingHearts();
      break;
    case 'passcode':
      initPasscode();
      break;
    case 'envelope':
      initEnvelope();
      break;
    case 'graduation':
      initGraduation();
      createSparkles();
      break;
    case 'monthsary-countdown':
      initMonthsaryCountdown();
      createMonthsaryHearts();
      break;
    case 'monthsary-passcode':
      initMonthsaryPasscode();
      break;
    case 'monthsary-quiz':
      initMonthsaryQuiz();
      break;
    case 'slideshow':
      initSlideshow();
      break;
  }
}

function transitionToPhase(newPhase) {
  const currentScreen = screens[currentPhase];
  currentScreen.classList.add('fade-out');
  
  setTimeout(() => {
    showPhase(newPhase);
    screens[newPhase].classList.add('fade-in');
  }, 500);
}

// ===== Countdown Phase =====
function initCountdown() {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  const diff = CONFIG.unlockDate - now;
  
  if (diff <= 0) {
    clearInterval(countdownInterval);
    transitionToPhase('passcode');
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function createFloatingHearts() {
  const container = document.getElementById('floating-hearts');
  container.innerHTML = '';
  
  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = `
      <svg width="${20 + Math.random() * 20}" height="${20 + Math.random() * 20}" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${8 + Math.random() * 12}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(heart);
  }
}

// ===== Passcode Phase =====
function initPasscode() {
  const input = document.getElementById('passcode-input');
  const button = document.getElementById('unlock-btn');
  const errorMessage = document.getElementById('error-message');
  
  input.value = '';
  errorMessage.classList.add('hidden');
  
  if (!listenersInitialized.passcode) {
    listenersInitialized.passcode = true;
    
    // Only allow numbers
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    // Handle enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkPasscode();
      }
    });
    
    button.addEventListener('click', checkPasscode);
  }
}

function checkPasscode() {
  const input = document.getElementById('passcode-input');
  const errorMessage = document.getElementById('error-message');
  
  if (input.value === CONFIG.passcode) {
    localStorage.setItem('gift-phase', 'envelope');
    transitionToPhase('envelope');
  } else {
    input.classList.add('shake');
    errorMessage.classList.remove('hidden');
    
    setTimeout(() => {
      input.classList.remove('shake');
    }, 500);
  }
}

// ===== Envelope Phase =====
function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const envelopeContainer = document.getElementById('envelope-container');
  const tapHint = document.getElementById('tap-hint');
  const letter = document.getElementById('letter');
  const continueBtn = document.getElementById('continue-btn');
  
  // Reset state
  envelope.classList.remove('open');
  letter.classList.add('hidden');
  envelopeContainer.classList.remove('hidden');
  tapHint.style.opacity = '1';
  
  if (!listenersInitialized.envelope) {
    listenersInitialized.envelope = true;
    envelopeContainer.addEventListener('click', openEnvelope);
    continueBtn.addEventListener('click', goToGraduation);
  }
}

function openEnvelope() {
  const envelope = document.getElementById('envelope');
  const envelopeContainer = document.getElementById('envelope-container');
  const tapHint = document.getElementById('tap-hint');
  const letter = document.getElementById('letter');
  
  envelope.classList.add('open');
  tapHint.style.opacity = '0';
  
  setTimeout(() => {
    envelopeContainer.classList.add('hidden');
    letter.classList.remove('hidden');
  }, 800);
}

function goToGraduation() {
  localStorage.setItem('gift-phase', 'graduation');
  transitionToPhase('graduation');
}

// ===== Graduation Phase =====
function initGraduation() {
  const now = new Date();
  const countdownSection = document.getElementById('grad-countdown-section');
  const flowerSection = document.getElementById('flower-section');
  
  // Check if graduation date has passed
  if (now >= CONFIG.graduationDate) {
    // Countdown is over - show flower section directly
    countdownSection.classList.add('hidden');
    flowerSection.classList.remove('hidden');
    initFlower();
  } else {
    // Still counting down - show countdown section
    countdownSection.classList.remove('hidden');
    flowerSection.classList.add('hidden');
    updateGradCountdown();
    gradCountdownInterval = setInterval(updateGradCountdown, 1000);
  }
  createSparkles();
}

let flowerClickCount = 0;

function initFlower() {
  const flowerContainer = document.getElementById('flower-container');
  const flower = document.getElementById('flower');
  const flowerSection = document.getElementById('flower-section');
  const gradLetter = document.getElementById('grad-letter');
  const backBtn = document.getElementById('back-to-countdown-btn');
  const tapHint = document.getElementById('flower-tap-hint');
  const continueToMonthsaryBtn = document.getElementById('continue-to-monthsary-btn');
  
  // Reset state
  flower.classList.remove('open');
  flowerSection.classList.remove('hidden', 'fade-out', 'fade-in');
  gradLetter.classList.add('hidden');
  gradLetter.classList.remove('fade-out', 'fade-in');
  flowerClickCount = 0;
  tapHint.textContent = 'Tap the flower to reveal a surprise';
  
  if (!listenersInitialized.flower) {
    listenersInitialized.flower = true;
    
    flowerContainer.addEventListener('click', () => {
      flowerClickCount++;
      
      if (flowerClickCount === 1) {
        flower.classList.add('open');
        tapHint.textContent = 'Tap again to open the letter';
      } else if (flowerClickCount >= 2) {
        flowerSection.classList.add('fade-out');
        setTimeout(() => {
          flowerSection.classList.add('hidden');
          flowerSection.classList.remove('fade-out');
          gradLetter.classList.remove('hidden');
          gradLetter.classList.add('fade-in');
        }, 500);
      }
    });
    
    backBtn.addEventListener('click', () => {
      gradLetter.classList.add('fade-out');
      setTimeout(() => {
        gradLetter.classList.add('hidden');
        gradLetter.classList.remove('fade-out', 'fade-in');
        flowerSection.classList.remove('hidden');
        flowerSection.classList.add('fade-in');
        flower.classList.remove('open');
        flowerClickCount = 0;
        tapHint.textContent = 'Tap the flower to reveal a surprise';
        setTimeout(() => {
          flowerSection.classList.remove('fade-in');
        }, 500);
      }, 500);
    });
    
    continueToMonthsaryBtn.addEventListener('click', () => {
      localStorage.setItem('gift-phase', 'monthsary-countdown');
      transitionToPhase('monthsary-countdown');
    });
  }
}

function updateGradCountdown() {
  const now = new Date();
  const diff = CONFIG.graduationDate - now;
  
  if (diff <= 0) {
    clearInterval(gradCountdownInterval);
    // Transition to flower section when countdown ends
    const countdownSection = document.getElementById('grad-countdown-section');
    const flowerSection = document.getElementById('flower-section');
    
    countdownSection.classList.add('fade-out');
    setTimeout(() => {
      countdownSection.classList.add('hidden');
      countdownSection.classList.remove('fade-out');
      flowerSection.classList.remove('hidden');
      flowerSection.classList.add('fade-in');
      initFlower();
      setTimeout(() => {
        flowerSection.classList.remove('fade-in');
      }, 500);
    }, 500);
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  document.getElementById('grad-days').textContent = String(days).padStart(2, '0');
  document.getElementById('grad-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('grad-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('grad-seconds').textContent = String(seconds).padStart(2, '0');
}

function createSparkles() {
  const container = document.getElementById('sparkles');
  container.innerHTML = '';
  
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 2}s`;
    sparkle.style.animationDuration = `${1.5 + Math.random() * 1}s`;
    container.appendChild(sparkle);
  }
}

// ===== Monthsary Countdown Phase =====
function initMonthsaryCountdown() {
  updateMonthsaryCountdown();
  monthsaryCountdownInterval = setInterval(updateMonthsaryCountdown, 1000);
}

function updateMonthsaryCountdown() {
  const now = new Date();
  const diff = CONFIG.monthsaryDate - now;
  
  if (diff <= 0) {
    clearInterval(monthsaryCountdownInterval);
    // Auto transition to passcode when countdown ends
    transitionToPhase('monthsary-passcode');
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  document.getElementById('month-days').textContent = String(days).padStart(2, '0');
  document.getElementById('month-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('month-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('month-seconds').textContent = String(seconds).padStart(2, '0');
}

function createMonthsaryHearts() {
  const container = document.getElementById('monthsary-hearts');
  container.innerHTML = '';
  
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = `
      <svg width="${20 + Math.random() * 20}" height="${20 + Math.random() * 20}" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${8 + Math.random() * 12}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(heart);
  }
}

// ===== Monthsary Passcode Phase =====
function initMonthsaryPasscode() {
  const input = document.getElementById('monthsary-passcode-input');
  const button = document.getElementById('monthsary-unlock-btn');
  const errorMessage = document.getElementById('monthsary-error-message');
  
  input.value = '';
  errorMessage.classList.add('hidden');
  
  if (!listenersInitialized.monthsaryPasscode) {
    listenersInitialized.monthsaryPasscode = true;
    
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkMonthsaryPasscode();
      }
    });
    
    button.addEventListener('click', checkMonthsaryPasscode);
  }
}

function checkMonthsaryPasscode() {
  const input = document.getElementById('monthsary-passcode-input');
  const errorMessage = document.getElementById('monthsary-error-message');
  
  if (input.value === CONFIG.monthsaryPasscode) {
    transitionToPhase('monthsary-quiz');
  } else {
    input.classList.add('shake');
    errorMessage.classList.remove('hidden');
    
    setTimeout(() => {
      input.classList.remove('shake');
    }, 500);
  }
}

// ===== Monthsary Quiz Phase =====
function initMonthsaryQuiz() {
  const input = document.getElementById('quiz-input');
  const button = document.getElementById('quiz-submit-btn');
  const errorMessage = document.getElementById('quiz-error-message');
  
  input.value = '';
  errorMessage.classList.add('hidden');
  
  // Only allow numbers
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
  
  // Handle enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      checkQuizAnswer();
    }
  });
  
  button.addEventListener('click', checkQuizAnswer);
}

function checkQuizAnswer() {
  const input = document.getElementById('quiz-input');
  const errorMessage = document.getElementById('quiz-error-message');
  
  if (input.value === CONFIG.monthsaryAnswer) {
    localStorage.setItem('gift-phase', 'slideshow');
    transitionToPhase('slideshow');
  } else {
    input.classList.add('shake');
    errorMessage.classList.remove('hidden');
    
    setTimeout(() => {
      input.classList.remove('shake');
    }, 500);
  }
}

// ===== Slideshow Phase =====
function initSlideshow() {
  // Initialize card flip functionality
  const cards = document.querySelectorAll('.photo-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
  
  // Initialize music toggle
  const musicToggle = document.getElementById('music-toggle');
  const music = document.getElementById('romantic-music');
  const musicOnIcon = document.getElementById('music-on-icon');
  const musicOffIcon = document.getElementById('music-off-icon');
  
  // Try to autoplay music
  music.volume = 0.5;
  music.play().then(() => {
    musicPlaying = true;
    musicOnIcon.classList.remove('hidden');
    musicOffIcon.classList.add('hidden');
  }).catch(() => {
    // Autoplay blocked, user needs to click
    musicPlaying = false;
    musicOnIcon.classList.add('hidden');
    musicOffIcon.classList.remove('hidden');
  });
  
  musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
      music.pause();
      musicPlaying = false;
      musicOnIcon.classList.add('hidden');
      musicOffIcon.classList.remove('hidden');
    } else {
      music.play();
      musicPlaying = true;
      musicOnIcon.classList.remove('hidden');
      musicOffIcon.classList.add('hidden');
    }
  });
}
