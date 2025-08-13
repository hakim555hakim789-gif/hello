// Global variables
let currentMovies = [];
let filteredMovies = [];
let currentPage = 1;
const moviesPerPage = 6;

// Sample movies data with Persian titles and descriptions
const moviesData = [
    {
        id: 1,
        title: "آواتار: راه آب",
        genre: "علمی-تخیلی",
        rating: 4.8,
        price: "180,000",
        duration: "3 ساعت و 12 دقیقه",
        description: "داستان خانواده Sully در دنیای Pandora و ماجراجویی‌های جدیدشان در اقیانوس‌های آبی",
        image: "🎬",
        year: 2024,
        director: "جیمز کامرون",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 2,
        title: "تنت",
        genre: "اکشن",
        rating: 4.5,
        price: "150,000",
        duration: "2 ساعت و 30 دقیقه",
        description: "فیلمی درباره سفر در زمان و مبارزه برای نجات جهان از تهدیدات آینده",
        image: "🎭",
        year: 2023,
        director: "کریستوفر نولان",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 3,
        title: "جوکر",
        genre: "درام",
        rating: 4.9,
        price: "120,000",
        duration: "2 ساعت و 2 دقیقه",
        description: "داستان زندگی Arthur Fleck و تبدیل شدنش به یکی از معروف‌ترین شرورهای دنیای کمیک",
        image: "🃏",
        year: 2023,
        director: "تاد فیلیپس",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 4,
        title: "اینتراستلار",
        genre: "علمی-تخیلی",
        rating: 4.7,
        price: "140,000",
        duration: "2 ساعت و 49 دقیقه",
        description: "سفری فضایی برای یافتن خانه جدید برای بشریت در اعماق کیهان",
        image: "🚀",
        year: 2023,
        director: "کریستوفر نولان",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 5,
        title: "پلنگ سیاه: واکاندا برای همیشه",
        genre: "اکشن",
        rating: 4.6,
        price: "130,000",
        duration: "2 ساعت و 14 دقیقه",
        description: "داستان Wakanda و محافظت از آن در برابر تهدیدات جدید",
        image: "🐆",
        year: 2024,
        director: "رایان کوگلر",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 6,
        title: "مرد عنکبوتی: راهی به خانه نیست",
        genre: "اکشن",
        rating: 4.4,
        price: "160,000",
        duration: "2 ساعت و 28 دقیقه",
        description: "پیتر پارکر با دنیای چندجهانی مواجه می‌شود و باید با شرورهای مختلف مبارزه کند",
        image: "🕷️",
        year: 2023,
        director: "جان واتس",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 7,
        title: "داستان اسباب‌بازی 4",
        genre: "کمدی",
        rating: 4.3,
        price: "100,000",
        duration: "1 ساعت و 40 دقیقه",
        description: "ماجراجویی جدید وودی و دوستانش در دنیای اسباب‌بازی‌ها",
        image: "🧸",
        year: 2023,
        director: "جاش کوولی",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 8,
        title: "آنا و برف",
        genre: "ترسناک",
        rating: 4.2,
        price: "110,000",
        duration: "1 ساعت و 55 دقیقه",
        description: "داستان ترسناک دختری که در برف گم شده و با موجودات عجیب مواجه می‌شود",
        image: "❄️",
        year: 2024,
        director: "کریس باکن",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 9,
        title: "مرد آهنی: بازگشت",
        genre: "اکشن",
        rating: 4.6,
        price: "170,000",
        duration: "2 ساعت و 15 دقیقه",
        description: "تونی استارک با تهدید جدیدی مواجه می‌شود و باید از فناوری پیشرفته استفاده کند",
        image: "🤖",
        year: 2024,
        director: "شین بلک",
        language: "انگلیسی با زیرنویس فارسی"
    },
    {
        id: 10,
        title: "جادوگران: میراث",
        genre: "فانتزی",
        rating: 4.1,
        price: "95,000",
        duration: "1 ساعت و 50 دقیقه",
        description: "داستان جادوگران جوان که باید میراث اجدادی خود را کشف کنند",
        image: "🔮",
        year: 2023,
        director: "رابرت زمکیس",
        language: "انگلیسی با زیرنویس فارسی"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize website functionality
function initializeWebsite() {
    loadMovies();
    setupEventListeners();
    setupScrollEffects();
    setupNavigation();
    setupContactForm();
    setupNewsletterForm();
}

// Load movies
function loadMovies() {
    currentMovies = [...moviesData];
    filteredMovies = [...moviesData];
    displayMovies();
}

// Display movies in grid
function displayMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const moviesToShow = filteredMovies.slice(startIndex, endIndex);
    
    if (moviesToShow.length === 0) {
        moviesGrid.innerHTML = `
            <div class="no-movies">
                <i class="fas fa-film"></i>
                <h3>فیلمی یافت نشد</h3>
                <p>لطفاً فیلتر دیگری انتخاب کنید</p>
            </div>
        `;
        return;
    }
    
    moviesGrid.innerHTML = moviesToShow.map(movie => `
        <div class="movie-card" data-movie-id="${movie.id}">
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
                <p class="movie-price">${movie.price} تومان</p>
                <button class="book-btn" onclick="bookMovie(${movie.id})">
                    رزرو صندلی
                </button>
            </div>
        </div>
    `).join('');
    
    // Update load more button
    updateLoadMoreButton();
}

// Update load more button visibility
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
    
    if (currentPage >= totalPages) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

// Load more movies
function loadMoreMovies() {
    currentPage++;
    displayMovies();
}

// Filter movies by genre
function filterMovies(genre) {
    currentPage = 1;
    
    if (genre === 'all') {
        filteredMovies = [...currentMovies];
    } else {
        filteredMovies = currentMovies.filter(movie => movie.genre === genre);
    }
    
    displayMovies();
}

// Book a movie
function bookMovie(movieId) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!user) {
        showNotification('برای رزرو صندلی ابتدا وارد شوید', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Store selected movie in localStorage
    const selectedMovie = currentMovies.find(m => m.id === movieId);
    localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
    
    // Redirect to seat selection page
    window.location.href = 'seats.html';
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const genre = this.getAttribute('data-genre');
            filterMovies(genre);
        });
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreMovies);
    }
    
    // Hero scroll button
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', function() {
            document.getElementById('movies').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
}

// Setup scroll effects
function setupScrollEffects() {
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active navigation link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
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

// Setup navigation
function setupNavigation() {
    // Add click event to logo
    const logo = document.querySelector('.nav-brand .logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Here you would typically send the data to a server
            console.log('Contact form submitted:', formData);
            
            // Show success message
            showNotification('پیام شما با موفقیت ارسال شد', 'success');
            
            // Reset form
            contactForm.reset();
        });
    }
}

// Setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send the email to a server
            console.log('Newsletter subscription:', email);
            
            // Show success message
            showNotification('عضویت در خبرنامه با موفقیت انجام شد', 'success');
            
            // Reset form
            this.reset();
        });
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db'
    };
    return colors[type] || '#3498db';
}

// Search movies
function searchMovies(query) {
    if (!query.trim()) {
        filteredMovies = [...currentMovies];
    } else {
        filteredMovies = currentMovies.filter(movie => 
            movie.title.includes(query) || 
            movie.genre.includes(query) ||
            movie.description.includes(query)
        );
    }
    
    currentPage = 1;
    displayMovies();
}

// Get movie details
function getMovieDetails(movieId) {
    return currentMovies.find(movie => movie.id === movieId);
}

// Export functions for use in other files
window.cinemaApp = {
    loadMovies,
    filterMovies,
    bookMovie,
    searchMovies,
    getMovieDetails,
    showNotification
};

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to movie cards
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .no-movies {
        text-align: center;
        padding: 3rem;
        color: var(--text-light);
    }
    
    .no-movies i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .no-movies h3 {
        color: var(--text-dark);
        margin-bottom: 0.5rem;
    }
    
    body.loaded .hero-content {
        animation: none;
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: var(--shadow);
            padding: 1rem;
        }
    }
`;
document.head.appendChild(notificationStyles);