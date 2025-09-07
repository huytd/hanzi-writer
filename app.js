// HSK 1 Chinese Character Learning App - JavaScript

// Global app instance
let hskApp = null;

// Character data
const CHARACTER_DATA = [
    {"character": "一", "pinyin": "yī", "meaning": "one", "category": "numbers"},
    {"character": "二", "pinyin": "èr", "meaning": "two", "category": "numbers"}, 
    {"character": "三", "pinyin": "sān", "meaning": "three", "category": "numbers"},
    {"character": "人", "pinyin": "rén", "meaning": "person", "category": "people"},
    {"character": "我", "pinyin": "wǒ", "meaning": "I, me", "category": "pronouns"},
    {"character": "你", "pinyin": "nǐ", "meaning": "you", "category": "pronouns"},
    {"character": "他", "pinyin": "tā", "meaning": "he, him", "category": "pronouns"},
    {"character": "大", "pinyin": "dà", "meaning": "big", "category": "adjectives"},
    {"character": "小", "pinyin": "xiǎo", "meaning": "small", "category": "adjectives"},
    {"character": "好", "pinyin": "hǎo", "meaning": "good", "category": "adjectives"},
    {"character": "不", "pinyin": "bù", "meaning": "not", "category": "common"},
    {"character": "很", "pinyin": "hěn", "meaning": "very", "category": "common"},
    {"character": "是", "pinyin": "shì", "meaning": "to be", "category": "verbs"},
    {"character": "有", "pinyin": "yǒu", "meaning": "to have", "category": "verbs"},
    {"character": "来", "pinyin": "lái", "meaning": "to come", "category": "verbs"},
    {"character": "去", "pinyin": "qù", "meaning": "to go", "category": "verbs"},
    {"character": "看", "pinyin": "kàn", "meaning": "to look", "category": "verbs"},
    {"character": "吃", "pinyin": "chī", "meaning": "to eat", "category": "verbs"},
    {"character": "水", "pinyin": "shuǐ", "meaning": "water", "category": "nouns"},
    {"character": "火", "pinyin": "huǒ", "meaning": "fire", "category": "nouns"},
    {"character": "日", "pinyin": "rì", "meaning": "sun, day", "category": "nouns"},
    {"character": "月", "pinyin": "yuè", "meaning": "moon, month", "category": "nouns"},
    {"character": "山", "pinyin": "shān", "meaning": "mountain", "category": "nouns"},
    {"character": "田", "pinyin": "tián", "meaning": "field", "category": "nouns"},
    {"character": "口", "pinyin": "kǒu", "meaning": "mouth", "category": "nouns"},
    {"character": "手", "pinyin": "shǒu", "meaning": "hand", "category": "nouns"},
    {"character": "木", "pinyin": "mù", "meaning": "wood", "category": "nouns"},
    {"character": "林", "pinyin": "lín", "meaning": "forest", "category": "nouns"},
    {"character": "上", "pinyin": "shàng", "meaning": "up, above", "category": "directions"},
    {"character": "下", "pinyin": "xià", "meaning": "down, below", "category": "directions"},
    {"character": "中", "pinyin": "zhōng", "meaning": "middle", "category": "directions"},
    {"character": "里", "pinyin": "lǐ", "meaning": "inside", "category": "directions"},
    {"character": "四", "pinyin": "sì", "meaning": "four", "category": "numbers"},
    {"character": "五", "pinyin": "wǔ", "meaning": "five", "category": "numbers"},
    {"character": "六", "pinyin": "liù", "meaning": "six", "category": "numbers"},
    {"character": "七", "pinyin": "qī", "meaning": "seven", "category": "numbers"},
    {"character": "八", "pinyin": "bā", "meaning": "eight", "category": "numbers"},
    {"character": "九", "pinyin": "jiǔ", "meaning": "nine", "category": "numbers"},
    {"character": "十", "pinyin": "shí", "meaning": "ten", "category": "numbers"},
    {"character": "车", "pinyin": "chē", "meaning": "car", "category": "nouns"},
    {"character": "门", "pinyin": "mén", "meaning": "door", "category": "nouns"},
    {"character": "家", "pinyin": "jiā", "meaning": "home", "category": "nouns"}
];

const CATEGORIES = {
    "numbers": {"name": "Numbers 数字", "icon": "🔢", "description": "Learn basic numbers 1-10"},
    "pronouns": {"name": "Pronouns 代词", "icon": "👤", "description": "Personal pronouns like I, you, he"},
    "verbs": {"name": "Verbs 动词", "icon": "🏃", "description": "Common action words"},
    "adjectives": {"name": "Adjectives 形容词", "icon": "⭐", "description": "Describing words"},
    "nouns": {"name": "Nouns 名词", "icon": "🏠", "description": "Objects and things"},
    "directions": {"name": "Directions 方向", "icon": "🧭", "description": "Position and direction words"},
    "people": {"name": "People 人物", "icon": "👥", "description": "Words about people"},
    "common": {"name": "Common 常用", "icon": "📝", "description": "Frequently used words"}
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
        const charactersInCategory = CHARACTER_DATA.filter(char => char.category === categoryId);
        const completedCount = 0; // Start with no completed characters
        
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <div class="category-name">${category.name}</div>
            <div class="category-description">${category.description}</div>
            <div class="category-progress">${completedCount}/${charactersInCategory.length} completed</div>
        `;
        
        card.addEventListener('click', () => {
            selectCategory(categoryId);
        });
        
        grid.appendChild(card);
    });
    
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
    const grid = document.getElementById('characters-grid');
    const title = document.getElementById('category-title');
    const progressText = document.getElementById('category-progress-text');
    
    if (title) title.textContent = CATEGORIES[categoryId].name;
    if (progressText) progressText.textContent = `0/${charactersInCategory.length}`;
    
    if (!grid) {
        console.error('Characters grid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    charactersInCategory.forEach((character, index) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-display-small">${character.character}</div>
            <div class="character-pinyin-small">${character.pinyin}</div>
            <div class="character-meaning-small">${character.meaning}</div>
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
    if (meaning) meaning.textContent = character.meaning;
    
    // Reset progress bar
    const progressFill = document.getElementById('stroke-progress');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
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
            padding: 20,
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
            },
            onCorrectStroke: function(strokeData) {
                showFeedback('success', 'Great stroke!');
                updateStrokeProgress(strokeData);
            },
            onComplete: function(summaryData) {
                showFeedback('success', '🎉 Character completed!');
                const nextBtn = document.getElementById('next-btn');
                if (nextBtn) nextBtn.style.display = 'block';
                updateStrokeProgress({ strokeNum: summaryData.totalStrokes - 1 });
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
                    hskApp.writer.showHint();
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
                setTimeout(() => {
                    if (hskApp.writer && typeof hskApp.writer.quiz === 'function') {
                        hskApp.writer.quiz();
                    }
                }, 500);
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
                    utterance.rate = 0.7;
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up HSK App...');
    
    // Initialize simple app state first
    hskApp = {
        currentScreen: 'welcome-screen',
        currentCategory: null,
        currentCharacter: null,
        currentCharacterIndex: 0,
        charactersInCategory: [],
        writer: null
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
