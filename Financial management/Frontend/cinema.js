// Sample movies data
const movies = [
    {
        id: 1,
        title: "آواتار: راه آب",
        genre: "علمی-تخیلی، ماجراجویی",
        rating: 4.8,
        price: "120,000 تومان",
        duration: "3 ساعت و 12 دقیقه",
        description: "داستان خانواده Sully در دنیای Pandora و ماجراجویی‌های جدیدشان",
        image: "🎬"
    },
    {
        id: 2,
        title: "تنت",
        genre: "علمی-تخیلی، اکشن",
        rating: 4.5,
        price: "100,000 تومان",
        duration: "2 ساعت و 30 دقیقه",
        description: "فیلمی درباره سفر در زمان و مبارزه برای نجات جهان",
        image: "🎭"
    },
    {
        id: 3,
        title: "جوکر",
        genre: "درام، جنایی",
        rating: 4.9,
        price: "90,000 تومان",
        duration: "2 ساعت و 2 دقیقه",
        description: "داستان زندگی Arthur Fleck و تبدیل شدنش به جوکر",
        image: "🃏"
    },
    {
        id: 4,
        title: "اینتراستلار",
        genre: "علمی-تخیلی، درام",
        rating: 4.7,
        price: "110,000 تومان",
        duration: "2 ساعت و 49 دقیقه",
        description: "سفری فضایی برای یافتن خانه جدید برای بشریت",
        image: "🚀"
    },
    {
        id: 5,
        title: "پلنگ سیاه",
        genre: "اکشن، ماجراجویی",
        rating: 4.6,
        price: "95,000 تومان",
        duration: "2 ساعت و 14 دقیقه",
        description: "داستان T'Challa و پادشاهی Wakanda",
        image: "🐆"
    },
    {
        id: 6,
        title: "مرد عنکبوتی: راهی به خانه نیست",
        genre: "اکشن، ماجراجویی",
        rating: 4.4,
        price: "105,000 تومان",
        duration: "2 ساعت و 28 دقیقه",
        description: "پیتر پارکر با دنیای چندجهانی مواجه می‌شود",
        image: "🕷️"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadMovies();
    setupScrollAnimations();
    setupNavigation();
});

// Load movies into the grid
function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    
    if (!moviesGrid) return;
    
    moviesGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

// Create a movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card fade-in';
    card.innerHTML = `
        <div class="movie-image">
            ${movie.image}
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-genre">${movie.genre}</p>
            <div class="movie-rating">
                <i class="fas fa-star"></i>
                <span>${movie.rating}/5</span>
            </div>
            <p class="movie-price">${movie.price}</p>
            <button class="book-btn" onclick="bookMovie(${movie.id})">
                رزرو صندلی
            </button>
        </div>
    `;
    
    return card;
}

// Book a movie function
function bookMovie(movieId) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!user) {
        alert('برای رزرو صندلی ابتدا وارد شوید');
        window.location.href = 'Login.html';
        return;
    }
    
    // Store selected movie in localStorage
    localStorage.setItem('selectedMovie', JSON.stringify(movies.find(m => m.id === movieId)));
    
    // Redirect to seat selection page
    window.location.href = 'seats.html';
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active navigation link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Search functionality
function searchMovies(query) {
    const filteredMovies = movies.filter(movie => 
        movie.title.includes(query) || 
        movie.genre.includes(query)
    );
    
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '';
    
    if (filteredMovies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="no-results">
                <p>فیلمی با این مشخصات یافت نشد</p>
            </div>
        `;
        return;
    }
    
    filteredMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

// Filter movies by genre
function filterByGenre(genre) {
    const filteredMovies = genre === 'all' ? 
        movies : 
        movies.filter(movie => movie.genre.includes(genre));
    
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '';
    
    filteredMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

// Utility function to format price
function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

// Utility function to get current date in Persian
function getPersianDate() {
    const now = new Date();
    return now.toLocaleDateString('fa-IR');
}

// Add loading state
function showLoading() {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

// Remove loading state
function hideLoading() {
    // Loading will be removed when movies are loaded
}

// Error handling
function showError(message) {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = `
        <div class="error">
            <p>خطا: ${message}</p>
            <button onclick="loadMovies()" class="btn btn-primary">تلاش مجدد</button>
        </div>
    `;
}

// Export functions for use in other files
window.cinemaApp = {
    loadMovies,
    bookMovie,
    searchMovies,
    filterByGenre,
    movies
};