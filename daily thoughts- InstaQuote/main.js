const elements = {
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author'),
    quoteCard: document.querySelector('.quote-card'),
    progressFill: document.querySelector('.progress-fill'),
    categories: document.getElementById('categories'),
    favoriteBtn: document.getElementById('favoriteBtn')
};
const categories = {
    'motivational': 'Motivational',
    'friendship': 'Friendship',
    'life': 'Life',
    'success': 'Success',
    'love': 'Love'
};

let currentQuote = null;
let progressInterval = null;

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

// Progress Animation
function startProgress() {
    let width = 0;
    clearInterval(progressInterval);
    elements.progressFill.style.width = '0%';
    
    progressInterval = setInterval(() => {
        if(width >= 100) {
            clearInterval(progressInterval);
            getNewQuote();
        } else {
            width += 1;
            elements.progressFill.style.width = width + '%';
        }
    }, 86400); // 24 hours in milliseconds / 100
}

// Fetch Quote
async function getNewQuote(category = '') {
    try {
        elements.quoteCard.classList.add('loading');
        const url = `https://api.quotable.io/random${category ? `?tags=${category}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        
        currentQuote = {
            content: data.content,
            author: data.author,
            category: data.tags[0] || 'general',
            id: data._id
        };

        updateUI();
        startProgress();
        saveToHistory();
        checkFavorite();
    } catch (error) {
        showError();
    }
}

// Update Display
function updateUI() {
    elements.quoteText.textContent = `"${currentQuote.content}"`;
    elements.quoteAuthor.textContent = `- ${currentQuote.author}`;
    elements.quoteCard.classList.remove('loading');
}
// Error Handling
function showError() {
    elements.quoteText.textContent = "There was an issue loading the thought. Please try again later!";
    elements.quoteAuthor.textContent = "";
    elements.quoteCard.classList.remove('loading');
}

// Sharing
function shareQuote() {
    const text = encodeURIComponent(
    `${currentQuote.content}\n- ${currentQuote.author}\n\n#InstaQuote #DailyThought`
    );
    window.open(`whatsapp://send?text=${text}`, '_blank');
}

// Favorites
function toggleFavorite() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(f => f.id === currentQuote.id);
    
    if(index === -1) {
    favorites.push(currentQuote);
    elements.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
    } else {
    favorites.splice(index, 1);
    elements.favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favorite';
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function checkFavorite() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = favorites.some(f => f.id === currentQuote.id);
    elements.favoriteBtn.innerHTML = isFavorite ? 
    '<i class="fas fa-heart"></i> Favorite' : 
    '<i class="far fa-heart"></i> Favorite';
}

// Category Selection
function initCategories() {
    elements.categories.innerHTML = Object.entries(categories)
        .map(([key, value]) => `
            <button class="category-btn" onclick="selectCategory('${key}')">
                ${value}
            </button>
        `).join('');
}

function selectCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    getNewQuote(category);
}

// History Management
function saveToHistory() {
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.unshift({
        ...currentQuote,
        date: new Date().toISOString()
    });
    localStorage.setItem('history', history.slice(0, 50));
}

// Initialization
function init() {
    initCategories();
    const lastQuote = JSON.parse(localStorage.getItem('lastQuote'));
    
    if(lastQuote && new Date().getTime() - lastQuote.timestamp < 86400000) {
        currentQuote = lastQuote;
        updateUI();
        startProgress();
        checkFavorite();
    } else {
        getNewQuote();
    }
}

init();