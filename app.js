// HSK 1 Chinese Character Learning App - JavaScript

// Global app instance
let hskApp = null;

// Track practice session data
let currentSessionData = {
    startTime: null,
    mistakes: 0,
    strokes: 0,
    totalStrokes: 0
};

// Stats and progress tracking
const STORAGE_KEYS = {
    CHARACTER_PROGRESS: 'hsk_char_progress',
    GLOBAL_STATS: 'hsk_global_stats',
    DAILY_STREAK: 'hsk_daily_streak'
};

// Initialize stats system
function initializeStats() {
    // Load character progress
    const characterProgress = loadFromStorage(STORAGE_KEYS.CHARACTER_PROGRESS, {});
    
    // Load global stats
    const globalStats = loadFromStorage(STORAGE_KEYS.GLOBAL_STATS, {
        totalLearned: 0,
        totalPracticeTime: 0,
        totalAttempts: 0,
        lastPracticeDate: null
    });
    
    // Load daily streak
    const dailyStreak = loadFromStorage(STORAGE_KEYS.DAILY_STREAK, {
        currentStreak: 0,
        lastPracticeDate: null
    });
    
    return {
        characterProgress,
        globalStats,
        dailyStreak
    };
}

// Storage helper functions
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

// Character progress tracking
function updateCharacterProgress(character, accuracy, attempts, timeSpent) {
    const progress = loadFromStorage(STORAGE_KEYS.CHARACTER_PROGRESS, {});
    
    if (!progress[character.character]) {
        progress[character.character] = {
            character: character.character,
            pinyin: character.pinyin,
            meaning: character.meaning,
            category: character.category,
            completed: false,
            accuracy: 0,
            attempts: 0,
            timeSpent: 0,
            firstCompleted: null,
            lastPracticed: null
        };
    }
    
    const charProgress = progress[character.character];
    charProgress.attempts += attempts;
    charProgress.timeSpent += timeSpent;
    charProgress.lastPracticed = new Date().toISOString();
    
    // Update accuracy (weighted average)
    const newAccuracy = (charProgress.accuracy * (charProgress.attempts - attempts) + accuracy * attempts) / charProgress.attempts;
    charProgress.accuracy = Math.round(newAccuracy);
    
    // Mark as completed if accuracy is good enough
    if (accuracy >= 70 && !charProgress.completed) {
        charProgress.completed = true;
        charProgress.firstCompleted = new Date().toISOString();
    }
    
    saveToStorage(STORAGE_KEYS.CHARACTER_PROGRESS, progress);
    return charProgress;
}

// Global stats tracking
function updateGlobalStats(characterCompleted = false, timeSpent = 0, attempts = 0) {
    const stats = loadFromStorage(STORAGE_KEYS.GLOBAL_STATS, {
        totalLearned: 0,
        totalPracticeTime: 0,
        totalAttempts: 0,
        lastPracticeDate: null
    });
    
    stats.totalPracticeTime += timeSpent;
    stats.totalAttempts += attempts;
    stats.lastPracticeDate = new Date().toISOString();
    
    if (characterCompleted) {
        stats.totalLearned += 1;
    }
    
    saveToStorage(STORAGE_KEYS.GLOBAL_STATS, stats);
    return stats;
}

// Daily streak tracking
function updateDailyStreak() {
    const streak = loadFromStorage(STORAGE_KEYS.DAILY_STREAK, {
        currentStreak: 0,
        lastPracticeDate: null
    });
    
    const today = new Date().toDateString();
    const lastPractice = streak.lastPracticeDate ? new Date(streak.lastPracticeDate).toDateString() : null;
    
    if (lastPractice === today) {
        // Already practiced today, no change
        return streak;
    }
    
    if (lastPractice) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPractice === yesterday.toDateString()) {
            // Consecutive day, increment streak
            streak.currentStreak += 1;
        } else {
            // Streak broken, reset to 1
            streak.currentStreak = 1;
        }
    } else {
        // First practice
        streak.currentStreak = 1;
    }
    
    streak.lastPracticeDate = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.DAILY_STREAK, streak);
    return streak;
}

// Get character completion status
function getCharacterCompletionStatus(character) {
    const progress = loadFromStorage(STORAGE_KEYS.CHARACTER_PROGRESS, {});
    return progress[character.character] || {
        completed: false,
        accuracy: 0,
        attempts: 0,
        timeSpent: 0
    };
}

// Get category progress
function getCategoryProgress(categoryId) {
    const progress = loadFromStorage(STORAGE_KEYS.CHARACTER_PROGRESS, {});
    const charactersInCategory = CHARACTER_DATA.filter(char => char.category === categoryId);
    
    let completed = 0;
    let totalAccuracy = 0;
    let totalAttempts = 0;
    
    charactersInCategory.forEach(char => {
        const charProgress = progress[char.character];
        if (charProgress) {
            if (charProgress.completed) completed++;
            totalAccuracy += charProgress.accuracy || 0;
            totalAttempts += charProgress.attempts || 0;
        }
    });
    
    return {
        completed,
        total: charactersInCategory.length,
        averageAccuracy: charactersInCategory.length > 0 ? Math.round(totalAccuracy / charactersInCategory.length) : 0,
        totalAttempts
    };
}

// Reset all progress
function resetAllProgress() {
    localStorage.removeItem(STORAGE_KEYS.CHARACTER_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.GLOBAL_STATS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_STREAK);
    console.log('All progress reset');
}

// Character data (will be loaded from JSON file)
let CHARACTER_DATA = [];

// Split multi-character words into individual characters
function splitMultiCharacterWords(characters) {
    const singleCharacters = [];
    
    characters.forEach(char => {
        if (char.character.length === 1) {
            // Single character - add as is
            singleCharacters.push(char);
        } else {
            // Multi-character word - split into individual characters
            const chars = char.character.split('');
            const pinyinParts = char.pinyin.split(' ');
            
            chars.forEach((singleChar, index) => {
                // Create individual character entry
                const singleCharEntry = {
                    character: singleChar,
                    pinyin: pinyinParts[index] || char.pinyin,
                    meaning: char.meaning,
                    category: char.category,
                    originalWord: char.character, // Keep reference to original word
                    position: index + 1, // Position in the original word
                    totalChars: chars.length
                };
                singleCharacters.push(singleCharEntry);
            });
        }
    });
    
    return singleCharacters;
}

// Load character data from JSON file
async function loadCharacterData() {
    try {
        const response = await fetch('hsk2_characters.json');
        if (!response.ok) {
            throw new Error(`Failed to load character data: ${response.status}`);
        }

        const data = await response.json();

        // Map category names to match existing code structure
        const categoryMapping = {
            'number': 'number',
            'adverb': 'adverb',
            'verb': 'verb',
            'adjective': 'adjective',
            'pronoun': 'pronoun',
            'noun': 'noun',
            'direction': 'direction',
            'conjunction': 'conjunction',
            'interjection': 'interjection',
            'particle': 'particle',
            'measure': 'measure'
        };

        // Transform the data and apply category mapping
        const mappedCharacters = data.characters.map(char => ({
            ...char,
            category: categoryMapping[char.category] || char.category
        }));

        // Split multi-character words into individual characters
        CHARACTER_DATA = splitMultiCharacterWords(mappedCharacters);

        console.log(`Loaded ${CHARACTER_DATA.length} individual characters from ${data.characters.length} vocabulary entries`);
        return CHARACTER_DATA;
    } catch (error) {
        console.error('Error loading character data:', error);
        // Fallback to hardcoded HSK 2 data if JSON loading fails
        CHARACTER_DATA = [];
        console.log('Using fallback hardcoded HSK 2 data');
        return CHARACTER_DATA;
    }
}

const CATEGORIES = {
    "number": {"name": "Numbers 数字", "icon": "🔢", "description": "Learn basic numbers 1-10"},
    "pronoun": {"name": "Pronouns 代词", "icon": "👤", "description": "Personal pronouns like I, you, he"},
    "verb": {"name": "Verbs 动词", "icon": "🏃", "description": "Common action words"},
    "adjective": {"name": "Adjectives 形容词", "icon": "⭐", "description": "Describing words"},
    "adverb": {"name": "Adverbs 副词", "icon": "💬", "description": "Words that modify verbs, adjectives, or other adverbs"},
    "noun": {"name": "Nouns 名词", "icon": "🏠", "description": "Objects and things"},
    "direction": {"name": "Directions 方向", "icon": "🧭", "description": "Position and direction words"},
    "conjunction": {"name": "Conjunctions 连词", "icon": "🔗", "description": "Words that connect clauses or sentences"},
    "interjection": {"name": "Interjections 感叹词", "icon": "😮", "description": "Words expressing emotion or exclamation"},
    "particle": {"name": "Particles 助词", "icon": "✨", "description": "Grammatical particles in Chinese"},
    "measure": {"name": "Measure Words 量词", "icon": "📏", "description": "Words used to count or measure nouns"}
};

// HanziWriter availability check
let isHanziWriterLoaded = false;

// Show loading message
function showLoadingMessage(message) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        const loadingText = overlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
}

// Hide loading message
function hideLoadingMessage() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Check if HanziWriter is available
function checkHanziWriterAvailability() {
    isHanziWriterLoaded = typeof HanziWriter !== 'undefined';
    return isHanziWriterLoaded;
}

// Update library status indicator
function updateLibraryStatus() {
    const indicator = document.getElementById('library-status-indicator');
    if (indicator) {
        const dot = indicator.querySelector('.indicator-dot');
        const text = indicator.querySelector('.indicator-text');
        
        if (checkHanziWriterAvailability()) {
            dot.className = 'indicator-dot loaded';
            text.textContent = 'Writing library loaded';
        } else {
            dot.className = 'indicator-dot error';
            text.textContent = 'Writing library not available';
        }
    }
}

// Global navigation functions
function showScreen(screenId) {
    console.log('Navigating to screen:', screenId);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Successfully showed screen:', screenId);
        
        // Update app state if app exists
        if (hskApp) {
            hskApp.currentScreen = screenId;
        }
        
        // Update library status when showing settings
        if (screenId === 'settings-screen') {
            updateLibraryStatus();
        }
        
        return true;
    } else {
        console.error('Screen not found:', screenId);
        return false;
    }
}

function startLearning() {
    console.log('Start Learning clicked!');
    renderCategories();
    showScreen('categories-screen');
}

function renderCategories() {
    console.log('Rendering categories...');
    const grid = document.getElementById('categories-grid');
    if (!grid) {
        console.error('Categories grid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    Object.entries(CATEGORIES).forEach(([categoryId, category]) => {
        const categoryProgress = getCategoryProgress(categoryId);
        
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <div class="category-name">${category.name}</div>
            <div class="category-description">${category.description}</div>
            <div class="category-progress">${categoryProgress.completed}/${categoryProgress.total} completed</div>
        `;
        
        card.addEventListener('click', () => {
            selectCategory(categoryId);
        });
        
        grid.appendChild(card);
    });
    
    // Update global stats display
    updateGlobalStatsDisplay();
    
    console.log('Categories rendered successfully');
}

function selectCategory(categoryId) {
    console.log('Category selected:', categoryId);
    
    if (hskApp) {
        hskApp.currentCategory = categoryId;
        hskApp.charactersInCategory = CHARACTER_DATA.filter(char => char.category === categoryId);
    }
    
    renderCharacterSelection(categoryId);
    showScreen('character-selection-screen');
}

function renderCharacterSelection(categoryId) {
    console.log('Rendering character selection for:', categoryId);
    
    const charactersInCategory = CHARACTER_DATA.filter(char => char.category === categoryId);
    const categoryProgress = getCategoryProgress(categoryId);
    const grid = document.getElementById('characters-grid');
    const title = document.getElementById('category-title');
    const progressText = document.getElementById('category-progress-text');
    
    if (title) title.textContent = CATEGORIES[categoryId].name;
    if (progressText) progressText.textContent = `${categoryProgress.completed}/${charactersInCategory.length}`;
    
    if (!grid) {
        console.error('Characters grid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    charactersInCategory.forEach((character, index) => {
        const charStatus = getCharacterCompletionStatus(character);
        const card = document.createElement('div');
        card.className = `character-card ${charStatus.completed ? 'completed' : ''}`;
        
        let statusIcon = '';
        if (charStatus.completed) {
            statusIcon = '<div class="completion-badge">✓</div>';
        } else if (charStatus.attempts > 0) {
            statusIcon = '<div class="progress-badge">●</div>';
        }
        
        // Show meaning with context if it's from a multi-character word
        let displayMeaning = character.meaning;
        if (character.originalWord && character.originalWord.length > 1) {
            displayMeaning = `${character.meaning} (${character.originalWord})`;
        }
        
        card.innerHTML = `
            <div class="character-display-small">${character.character}</div>
            <div class="character-pinyin-small">${character.pinyin}</div>
            <div class="character-meaning-small">${displayMeaning}</div>
            ${statusIcon}
        `;
        
        card.addEventListener('click', () => {
            selectCharacter(categoryId, index);
        });
        
        grid.appendChild(card);
    });
    
    console.log('Character selection rendered');
}

function selectCharacter(categoryId, index) {
    console.log('Character selected:', categoryId, index);
    
    const charactersInCategory = CHARACTER_DATA.filter(char => char.category === categoryId);
    const character = charactersInCategory[index];
    
    if (hskApp) {
        hskApp.currentCharacter = character;
        hskApp.currentCharacterIndex = index;
    }
    
    setupPracticeScreen(character);
    showScreen('practice-screen');
}

function setupPracticeScreen(character) {
    console.log('Setting up practice screen for:', character.character);
    
    // Update character display
    const charDisplay = document.getElementById('character-display');
    const pinyin = document.getElementById('character-pinyin');
    const meaning = document.getElementById('character-meaning');
    
    if (charDisplay) charDisplay.textContent = character.character;
    if (pinyin) pinyin.textContent = character.pinyin;
    
    // Show meaning with context if it's from a multi-character word
    let displayMeaning = character.meaning;
    if (character.originalWord && character.originalWord.length > 1) {
        displayMeaning = `${character.meaning} (from ${character.originalWord})`;
    }
    if (meaning) meaning.textContent = displayMeaning;
    
    // Reset progress bar
    const progressFill = document.getElementById('stroke-progress');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Track practice start time
    if (hskApp) {
        hskApp.practiceStartTime = Date.now();
    }
    
    // Initialize session data
    currentSessionData = {
        startTime: Date.now(),
        mistakes: 0,
        strokes: 0,
        totalStrokes: 0
    };
    
    // Initialize Hanzi Writer
    initializeHanziWriter(character);
    
    // Hide next button initially
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';
}

function initializeHanziWriter(character) {
    const container = document.getElementById('hanzi-writer-container');
    if (!container) {
        console.error('Hanzi writer container not found');
        return;
    }
    
    container.innerHTML = '';
    
    // Check if HanziWriter is available
    if (typeof HanziWriter === 'undefined') {
        console.error('HanziWriter is not defined');
        container.innerHTML = `
            <div class="writer-fallback">
                <div class="fallback-character">${character.character}</div>
                <p>Writing practice unavailable</p>
                <p class="fallback-details">Please refresh the page to reload the writing library</p>
            </div>
        `;
        return;
    }
    
    try {
        console.log('Creating Hanzi Writer for:', character.character);
        
        const writer = HanziWriter.create(container, character.character, {
            width: 320,
            height: 320,
            padding: 0,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 300,
            strokeColor: '#2563eb',
            drawingWidth: 24,
            radicalColor: '#dc2626',
            highlightColor: '#fbbf24',
            outlineColor: '#d1d5db',
            drawingColor: '#059669',
            showHintAfterMisses: 2,
            highlightOnComplete: true,
            highlightCompleteColor: '#10b981',
            
            onMistake: function(strokeData) {
                showFeedback('error', 'Try again! Watch the stroke order.');
                currentSessionData.mistakes++;
            },
            onCorrectStroke: function(strokeData) {
                showFeedback('success', 'Great stroke!');
                currentSessionData.strokes++;
                updateStrokeProgress(strokeData);
            },
            onComplete: function(summaryData) {
                // Enhanced completion feedback
                showFeedback('success', '🎉 Character completed!');
                
                // Show completion celebration
                showCompletionCelebration();
                
                const nextBtn = document.getElementById('next-btn');
                if (nextBtn) nextBtn.style.display = 'block';
                
                // Update stroke progress with safe values
                const safeStrokeNum = (summaryData.totalStrokes || currentSessionData.strokes || 1) - 1;
                updateStrokeProgress({ strokeNum: safeStrokeNum });
                
                // Track character completion
                if (hskApp && hskApp.currentCharacter) {
                    const character = hskApp.currentCharacter;
                    
                    // Debug: Log both data sources
                    console.log('HanziWriter completion data:', summaryData);
                    console.log('Session data:', currentSessionData);
                    
                    // Use session data as primary source, fallback to summaryData
                    const totalStrokes = currentSessionData.strokes || summaryData.totalStrokes || 1;
                    const mistakes = currentSessionData.mistakes || summaryData.mistakes || 0;
                    const accuracy = totalStrokes > 0 ? Math.round((totalStrokes / (totalStrokes + mistakes)) * 100) : 100;
                    const attempts = mistakes + 1;
                    const timeSpent = currentSessionData.startTime ? Math.round((Date.now() - currentSessionData.startTime) / 1000) : 0;
                    
                    console.log('Final calculated stats:', { totalStrokes, mistakes, accuracy, attempts, timeSpent });
                    
                    updateCharacterProgress(character, accuracy, attempts, timeSpent);
                    updateGlobalStats(true, timeSpent, attempts);
                    updateDailyStreak();
                    
                    // Show completion stats preview on practice screen
                    showCompletionStatsPreview(character, accuracy, attempts, timeSpent);
                    
                    // Delay before showing results screen to let user see their achievement
                    setTimeout(() => {
                        showResultsScreen(character, accuracy, attempts, timeSpent);
                    }, 1000); // 3 second delay
                    
                    // Reset session data for next character
                    currentSessionData = {
                        startTime: null,
                        mistakes: 0,
                        strokes: 0,
                        totalStrokes: 0
                    };
                }
            }
        });
        
        if (hskApp) {
            hskApp.writer = writer;
        }
        
        // Start quiz mode
        writer.quiz();
        
        console.log('Hanzi Writer created successfully');
        
    } catch (error) {
        console.error('Error creating Hanzi Writer:', error);
        showFeedback('error', 'Failed to load character. Please try again.');
        
        // Show fallback interface
        container.innerHTML = `
            <div class="writer-fallback">
                <div class="fallback-character">${character.character}</div>
                <p>Writing practice unavailable</p>
                <p class="fallback-details">Study the character shape and pronunciation</p>
            </div>
        `;
    }
}

function updateStrokeProgress(strokeData) {
    const progressFill = document.getElementById('stroke-progress');
    if (progressFill && hskApp && hskApp.writer) {
        try {
            const totalStrokes = hskApp.writer._data.strokes.length;
            const currentStroke = strokeData.strokeNum + 1;
            const progress = (currentStroke / totalStrokes) * 100;
            progressFill.style.width = `${Math.min(progress, 100)}%`;
        } catch (error) {
            console.warn('Could not update stroke progress:', error);
        }
    }
}

function showFeedback(type, message) {
    const feedback = document.getElementById('practice-feedback');
    if (feedback) {
        feedback.innerHTML = `<div class="feedback-message ${type}">${message}</div>`;
        
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 3000);
    }
}

// Show completion celebration animation
function showCompletionCelebration() {
    const container = document.getElementById('hanzi-writer-container');
    if (!container) return;
    
    // Create celebration overlay
    const celebration = document.createElement('div');
    celebration.className = 'completion-celebration';
    celebration.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-icon">🎉</div>
            <div class="celebration-text">Excellent!</div>
        </div>
    `;
    
    container.appendChild(celebration);
    
    // Remove celebration after animation
    setTimeout(() => {
        if (celebration.parentNode) {
            celebration.parentNode.removeChild(celebration);
        }
    }, 1000);
}

// Show completion stats preview on practice screen
function showCompletionStatsPreview(character, accuracy, attempts, timeSpent) {
    const feedback = document.getElementById('practice-feedback');
    if (!feedback) return;
    
    // Create stats preview
    const statsPreview = document.createElement('div');
    statsPreview.className = 'completion-stats-preview';
    statsPreview.innerHTML = `
        <div class="stats-preview-content">
            <div class="stats-preview-title">🎯 Great Job!</div>
            <div class="stats-preview-stats">
                <div class="stat-item">
                    <span class="stat-label">Accuracy:</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Time:</span>
                    <span class="stat-value">${timeSpent}s</span>
                </div>
            </div>
            <div class="stats-preview-message">Moving to results...</div>
        </div>
    `;
    
    feedback.innerHTML = '';
    feedback.appendChild(statsPreview);
    
    // Add countdown effect
    let countdown = 3;
    const countdownElement = statsPreview.querySelector('.stats-preview-message');
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.textContent = `Moving to results in ${countdown}...`;
        } else {
            countdownElement.textContent = 'Moving to results...';
            clearInterval(countdownInterval);
        }
    }, 100);
}

// Update global stats display
function updateGlobalStatsDisplay() {
    const globalStats = loadFromStorage(STORAGE_KEYS.GLOBAL_STATS, {
        totalLearned: 0,
        totalPracticeTime: 0,
        totalAttempts: 0,
        lastPracticeDate: null
    });
    
    const dailyStreak = loadFromStorage(STORAGE_KEYS.DAILY_STREAK, {
        currentStreak: 0,
        lastPracticeDate: null
    });
    
    // Update total learned
    const totalLearnedEl = document.getElementById('total-learned');
    if (totalLearnedEl) {
        totalLearnedEl.textContent = globalStats.totalLearned;
    }
    
    // Update streak days
    const streakDaysEl = document.getElementById('streak-days');
    if (streakDaysEl) {
        streakDaysEl.textContent = dailyStreak.currentStreak;
    }
}

// Show results screen with stats
function showResultsScreen(character, accuracy, attempts, timeSpent) {
    // Debug: Log the values being passed
    console.log('showResultsScreen called with:', { character: character.character, accuracy, attempts, timeSpent });
    
    // Update results screen elements
    const completionIcon = document.getElementById('completion-icon');
    const resultsTitle = document.getElementById('results-title');
    const resultsMessage = document.getElementById('results-message');
    const accuracyScore = document.getElementById('accuracy-score');
    const attemptsCount = document.getElementById('attempts-count');
    const completionTime = document.getElementById('completion-time');
    
    if (completionIcon) completionIcon.textContent = '🎉';
    if (resultsTitle) resultsTitle.textContent = 'Great Job!';
    if (resultsMessage) resultsMessage.textContent = `You've completed ${character.character}`;
    
    // Ensure values are numbers and not NaN
    const safeAccuracy = isNaN(accuracy) ? 100 : accuracy;
    const safeAttempts = isNaN(attempts) ? 1 : attempts;
    const safeTimeSpent = isNaN(timeSpent) ? 0 : timeSpent;
    
    if (accuracyScore) accuracyScore.textContent = `${safeAccuracy}%`;
    if (attemptsCount) attemptsCount.textContent = safeAttempts;
    if (completionTime) completionTime.textContent = `${safeTimeSpent}s`;
    
    console.log('Updated results screen with safe values:', { safeAccuracy, safeAttempts, safeTimeSpent });
    
    // Show results screen with smooth transition
    showScreen('results-screen');
    
    // Add entrance animation to results screen
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.style.opacity = '0';
        resultsScreen.style.transform = 'translateY(20px)';
        
        // Animate in
        setTimeout(() => {
            resultsScreen.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            resultsScreen.style.opacity = '1';
            resultsScreen.style.transform = 'translateY(0)';
        }, 50);
    }
}


// Setup all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Set up main navigation
    const startBtn = document.getElementById('start-learning-btn');
    if (startBtn) {
        console.log('Setting up start button');
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Start learning button clicked');
            startLearning();
        });
    } else {
        console.error('Start button not found!');
    }
    
    // Set up back navigation
    const backToWelcome = document.getElementById('back-to-welcome');
    if (backToWelcome) {
        backToWelcome.addEventListener('click', function(e) {
            e.preventDefault();
            showScreen('welcome-screen');
        });
    }
    
    const backToCategories = document.getElementById('back-to-categories');
    if (backToCategories) {
        backToCategories.addEventListener('click', function(e) {
            e.preventDefault();
            renderCategories();
            showScreen('categories-screen');
        });
    }
    
    const backToCharacters = document.getElementById('back-to-characters');
    if (backToCharacters) {
        backToCharacters.addEventListener('click', function(e) {
            e.preventDefault();
            showScreen('character-selection-screen');
        });
    }
    
    // Set up practice controls
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.writer) {
                try {
                    // Show the next stroke hint
                    hskApp.writer.animateCharacter();
                    showFeedback('hint', 'Watch the next stroke!');
                } catch (error) {
                    console.warn('Hint not available:', error);
                    showFeedback('warning', 'Hint not available for this stroke.');
                }
            } else {
                showFeedback('error', 'Writing library not available.');
            }
        });
    }
    
    const outlineBtn = document.getElementById('show-outline-btn');
    if (outlineBtn) {
        outlineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.writer) {
                hskApp.writer.cancelQuiz();
                // Toggle outline visibility
                if (hskApp.writer._options.showOutline) {
                    hskApp.writer.hideOutline();
                    outlineBtn.textContent = '👁️ Show Outline';
                    showFeedback('hint', 'Outline hidden.');
                } else {
                    hskApp.writer.showOutline();
                    outlineBtn.textContent = '👁️ Hide Outline';
                    showFeedback('hint', 'Outline shown.');
                }
                hskApp.writer.quiz();
            } else {
                showFeedback('error', 'Writing library not available.');
            }
        });
    }
    
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.writer && typeof hskApp.writer.cancelQuiz === 'function') {
                hskApp.writer.cancelQuiz();
                hskApp.writer.quiz();
                showFeedback('hint', 'Cleared! Try again.');
                
                // Reset progress bar
                const progressFill = document.getElementById('stroke-progress');
                if (progressFill) {
                    progressFill.style.width = '0%';
                }
            } else {
                showFeedback('error', 'Writing library not available.');
            }
        });
    }
    
    const pronunciationBtn = document.getElementById('pronunciation-btn');
    if (pronunciationBtn) {
        pronunciationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.currentCharacter) {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(hskApp.currentCharacter.pinyin);
                    utterance.lang = 'zh-CN';
                    utterance.rate = 1.0;
                    speechSynthesis.speak(utterance);
                } else {
                    showFeedback('hint', `Pronunciation: ${hskApp.currentCharacter.pinyin}`);
                }
            }
        });
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.currentCategory) {
                const nextIndex = hskApp.currentCharacterIndex + 1;
                const charactersInCategory = CHARACTER_DATA.filter(char => char.category === hskApp.currentCategory);
                
                if (nextIndex < charactersInCategory.length) {
                    selectCharacter(hskApp.currentCategory, nextIndex);
                } else {
                    // Go back to character selection
                    renderCharacterSelection(hskApp.currentCategory);
                    showScreen('character-selection-screen');
                }
            }
        });
    }
    
    // Set up settings navigation
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showScreen('settings-screen');
        });
    }
    
    const backFromSettings = document.getElementById('back-from-settings');
    if (backFromSettings) {
        backFromSettings.addEventListener('click', function(e) {
            e.preventDefault();
            renderCategories();
            showScreen('categories-screen');
        });
    }
    
    // Set up reset progress button
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                resetAllProgress();
                showFeedback('success', 'All progress has been reset');
                // Refresh the categories to show updated progress
                setTimeout(() => {
                    renderCategories();
                }, 1000);
            }
        });
    }
    
    // Set up results screen navigation
    const practiceAgainBtn = document.getElementById('practice-again-btn');
    if (practiceAgainBtn) {
        practiceAgainBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.currentCharacter) {
                setupPracticeScreen(hskApp.currentCharacter);
                showScreen('practice-screen');
            }
        });
    }
    
    const continueLearningBtn = document.getElementById('continue-learning-btn');
    if (continueLearningBtn) {
        continueLearningBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (hskApp && hskApp.currentCategory) {
                const nextIndex = hskApp.currentCharacterIndex + 1;
                const charactersInCategory = CHARACTER_DATA.filter(char => char.category === hskApp.currentCategory);
                
                if (nextIndex < charactersInCategory.length) {
                    selectCharacter(hskApp.currentCategory, nextIndex);
                } else {
                    renderCharacterSelection(hskApp.currentCategory);
                    showScreen('character-selection-screen');
                }
            }
        });
    }
    
    console.log('Event listeners setup complete');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, setting up HSK App...');

    // Load character data first
    await loadCharacterData();

    // Initialize stats system
    initializeStats();

    // Initialize simple app state first
    hskApp = {
        currentScreen: 'welcome-screen',
        currentCategory: null,
        currentCharacter: null,
        currentCharacterIndex: 0,
        charactersInCategory: [],
        writer: null,
        practiceStartTime: null
    };

    // Setup all event listeners immediately
    setupEventListeners();

    // Ensure welcome screen is active
    showScreen('welcome-screen');

    // Pre-render categories for faster navigation
    renderCategories();

    console.log('HSK App basic setup complete');

    // Check if HanziWriter is available
    setTimeout(() => {
        checkHanziWriterAvailability();
        console.log('HanziWriter available:', isHanziWriterLoaded);
    }, 100);
});

// Handle network connectivity changes
window.addEventListener('online', function() {
    console.log('Network connection restored');
    showFeedback('success', 'Connection restored.');
});

window.addEventListener('offline', function() {
    console.log('Network connection lost');
    showFeedback('warning', 'Connection lost. Some features may not work.');
}); 
