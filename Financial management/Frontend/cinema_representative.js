// Global variables
let currentMovies = [];
let currentSchedules = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkRepAuth();
    loadDashboard();
    loadMovies();
    loadSchedules();
    setupNavigation();
    updateRepInfo();
});

// Check if user is representative
function checkRepAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || (user.role !== 'admin' && user.role !== 'representative')) {
        alert('شما دسترسی نماینده سینما ندارید');
        window.location.href = 'Login.html';
        return;
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
    
    // Show dashboard by default
    document.getElementById('dashboard').style.display = 'block';
}

// Load dashboard data
function loadDashboard() {
    // Load active movies count
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    document.getElementById('activeMovies').textContent = movies.length;
    
    // Load today's schedules count
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter(s => s.date === today);
    document.getElementById('todaySchedules').textContent = todaySchedules.length;
    
    // Load today's bookings count
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const todayBookings = bookings.filter(b => b.date === getPersianDate());
    document.getElementById('todayBookings').textContent = todayBookings.length;
    
    // Load average rating
    if (movies.length > 0) {
        const avgRating = movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    }
}

// Load movies
function loadMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    currentMovies = movies;
    displayMovies(movies);
    updateMovieSelect();
}

// Display movies in grid
function displayMovies(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    
    if (movies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <p>هیچ فیلمی یافت نشد</p>
            </div>
        `;
        return;
    }
    
    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card fade-in">
            <div class="movie-image">
                ${movie.image || '🎬'}
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${movie.genre}</p>
                <div class="movie-rating">
                    <i class="fas fa-star"></i>
                    <span>${movie.rating}/5</span>
                </div>
                <p class="movie-price">${movie.price}</p>
                <div class="action-buttons">
                    <button onclick="editMovie(${movie.id})" class="btn btn-success btn-small">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button onclick="deleteMovie(${movie.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update movie select in schedule form
function updateMovieSelect() {
    const movieSelect = document.getElementById('scheduleMovie');
    if (!movieSelect) return;
    
    movieSelect.innerHTML = '<option value="">فیلم را انتخاب کنید</option>';
    currentMovies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = movie.title;
        movieSelect.appendChild(option);
    });
}

// Load schedules
function loadSchedules() {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    currentSchedules = schedules;
    displaySchedules(schedules);
}

// Display schedules in table
function displaySchedules(schedules) {
    const tbody = document.getElementById('schedulesTableBody');
    
    if (schedules.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>هیچ برنامه‌ای یافت نشد</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = schedules.map(schedule => `
        <tr>
            <td>${getMovieTitleById(schedule.movieId)}</td>
            <td>${formatDate(schedule.date)}</td>
            <td>${schedule.time}</td>
            <td>${schedule.hall}</td>
            <td>${schedule.price.toLocaleString()} تومان</td>
            <td>
                <span class="status-badge status-active">فعال</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button onclick="editSchedule(${schedule.id})" class="btn btn-success btn-small">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSchedule(${schedule.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get movie title by ID
function getMovieTitleById(movieId) {
    const movie = currentMovies.find(m => m.id === movieId);
    return movie ? movie.title : 'نامشخص';
}

// Show add movie modal
function showAddMovieModal() {
    document.getElementById('addMovieModal').style.display = 'flex';
    document.getElementById('addMovieForm').reset();
}

// Close add movie modal
function closeAddMovieModal() {
    document.getElementById('addMovieModal').style.display = 'none';
}

// Add new movie
function addMovie() {
    const title = document.getElementById('movieTitle').value.trim();
    const genre = document.getElementById('movieGenre').value.trim();
    const rating = parseFloat(document.getElementById('movieRating').value);
    const price = document.getElementById('moviePrice').value.trim();
    const duration = document.getElementById('movieDuration').value.trim();
    const description = document.getElementById('movieDescription').value.trim();
    const image = document.getElementById('movieImage').value.trim();
    
    if (!title || !genre || !price || !duration || !description || !image) {
        alert('لطفاً همه فیلدها را پر کنید');
        return;
    }
    
    const newMovie = {
        id: Date.now(),
        title,
        genre,
        rating: rating || 0,
        price: price + ' تومان',
        duration,
        description,
        image
    };
    
    // Get existing movies or create new array
    let movies = JSON.parse(localStorage.getItem('movies')) || [];
    movies.push(newMovie);
    localStorage.setItem('movies', JSON.stringify(movies));
    
    // Reload movies
    loadMovies();
    loadDashboard();
    
    // Close modal
    closeAddMovieModal();
    
    // Show success message
    showMessage('فیلم با موفقیت اضافه شد', 'success');
}

// Edit movie
function editMovie(movieId) {
    const movie = currentMovies.find(m => m.id === movieId);
    if (!movie) return;
    
    // For now, just show an alert with movie info
    alert(`
فیلم: ${movie.title}
ژانر: ${movie.genre}
امتیاز: ${movie.rating}/5
قیمت: ${movie.price}
مدت زمان: ${movie.duration}
توضیحات: ${movie.description}
    `);
}

// Delete movie
function deleteMovie(movieId) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این فیلم را حذف کنید؟')) return;
    
    let movies = JSON.parse(localStorage.getItem('movies')) || [];
    movies = movies.filter(m => m.id !== movieId);
    localStorage.setItem('movies', JSON.stringify(movies));
    
    loadMovies();
    loadDashboard();
    
    showMessage('فیلم با موفقیت حذف شد', 'success');
}

// Show add schedule modal
function showAddScheduleModal() {
    document.getElementById('addScheduleModal').style.display = 'flex';
    document.getElementById('addScheduleForm').reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').value = today;
}

// Close add schedule modal
function closeAddScheduleModal() {
    document.getElementById('addScheduleModal').style.display = 'none';
}

// Add new schedule
function addSchedule() {
    const movieId = parseInt(document.getElementById('scheduleMovie').value);
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const hall = document.getElementById('scheduleHall').value;
    const price = parseInt(document.getElementById('schedulePrice').value);
    
    if (!movieId || !date || !time || !hall || !price) {
        alert('لطفاً همه فیلدها را پر کنید');
        return;
    }
    
    const newSchedule = {
        id: Date.now(),
        movieId,
        date,
        time,
        hall,
        price,
        status: 'active'
    };
    
    // Get existing schedules or create new array
    let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    schedules.push(newSchedule);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    // Reload schedules
    loadSchedules();
    loadDashboard();
    
    // Close modal
    closeAddScheduleModal();
    
    // Show success message
    showMessage('برنامه با موفقیت اضافه شد', 'success');
}

// Edit schedule
function editSchedule(scheduleId) {
    const schedule = currentSchedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    // For now, just show an alert with schedule info
    alert(`
فیلم: ${getMovieTitleById(schedule.movieId)}
تاریخ: ${formatDate(schedule.date)}
ساعت: ${schedule.time}
سالن: ${schedule.hall}
قیمت: ${schedule.price.toLocaleString()} تومان
    `);
}

// Delete schedule
function deleteSchedule(scheduleId) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟')) return;
    
    let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    schedules = schedules.filter(s => s.id !== scheduleId);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    loadSchedules();
    loadDashboard();
    
    showMessage('برنامه با موفقیت حذف شد', 'success');
}

// Update rep info
function updateRepInfo() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const repInfo = document.getElementById('repInfo');
    
    if (user) {
        repInfo.textContent = `سلام ${user.username}`;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

// Utility functions
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR');
    } catch {
        return dateString;
    }
}

function getPersianDate() {
    const now = new Date();
    return now.toLocaleDateString('fa-IR');
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Insert at top of main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Export functions for use in other files
window.repApp = {
    loadDashboard,
    loadMovies,
    loadSchedules,
    addMovie,
    deleteMovie,
    addSchedule,
    deleteSchedule
};