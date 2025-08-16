// Global variables
let currentMovies = [];
let currentUsers = [];
let currentBookings = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboard();
    loadMovies();
    loadUsers();
    loadBookings();
    setupNavigation();
    updateAdminInfo();
});

// Check if user is admin
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || user.role !== 'admin') {
        alert('شما دسترسی ادمین ندارید');
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
    // Load movies count
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    document.getElementById('totalMovies').textContent = movies.length;
    
    // Load users count
    const users = JSON.parse(localStorage.getItem('users')) || [];
    document.getElementById('totalUsers').textContent = users.length;
    
    // Load bookings count and revenue
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    document.getElementById('totalBookings').textContent = bookings.length;
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' تومان';
}

// Load movies
function loadMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    currentMovies = movies;
    displayMovies(movies);
}

// Display movies in table
function displayMovies(movies) {
    const tbody = document.getElementById('moviesTableBody');
    
    if (movies.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-film"></i>
                    <p>هیچ فیلمی یافت نشد</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = movies.map(movie => `
        <tr>
            <td>
                <div class="movie-poster-small">
                    ${movie.image || '🎬'}
                </div>
            </td>
            <td>${movie.title}</td>
            <td>${movie.genre}</td>
            <td>${movie.rating}/5</td>
            <td>${movie.price}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editMovie(${movie.id})" class="btn btn-success btn-small">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteMovie(${movie.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load users
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    currentUsers = users;
    displayUsers(users);
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>هیچ کاربری یافت نشد</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-pending'}">
                    ${user.role === 'admin' ? 'ادمین' : 'کاربر'}
                </span>
            </td>
            <td>${formatDate(user.created_acc)}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="toggleUserRole(${user.id})" class="btn btn-success btn-small">
                        ${user.role === 'admin' ? 'حذف ادمین' : 'تبدیل به ادمین'}
                    </button>
                    <button onclick="deleteUser(${user.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load bookings
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    currentBookings = bookings;
    displayBookings(bookings);
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <p>هیچ رزروی یافت نشد</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.code}</td>
            <td>${booking.movie.title}</td>
            <td>${getUsernameById(booking.userId)}</td>
            <td>${booking.seats.join(', ')}</td>
            <td>${booking.totalPrice.toLocaleString()} تومان</td>
            <td>${booking.date}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="viewBookingDetails(${booking.id})" class="btn btn-primary btn-small">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteBooking(${booking.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get username by ID
function getUsernameById(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'نامشخص';
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
    
    if (!title || !genre || !price || !duration || !description) {
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
        image: '🎬'
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

// Show edit movie modal
function editMovie(movieId) {
    const movie = currentMovies.find(m => m.id === movieId);
    if (!movie) return;
    
    document.getElementById('editMovieId').value = movie.id;
    document.getElementById('editMovieTitle').value = movie.title;
    document.getElementById('editMovieGenre').value = movie.genre;
    document.getElementById('editMovieRating').value = movie.rating;
    document.getElementById('editMoviePrice').value = movie.price.replace(' تومان', '');
    document.getElementById('editMovieDuration').value = movie.duration;
    document.getElementById('editMovieDescription').value = movie.description;
    
    document.getElementById('editMovieModal').style.display = 'flex';
}

// Close edit movie modal
function closeEditMovieModal() {
    document.getElementById('editMovieModal').style.display = 'none';
}

// Update movie
function updateMovie() {
    const id = parseInt(document.getElementById('editMovieId').value);
    const title = document.getElementById('editMovieTitle').value.trim();
    const genre = document.getElementById('editMovieGenre').value.trim();
    const rating = parseFloat(document.getElementById('editMovieRating').value);
    const price = document.getElementById('editMoviePrice').value.trim();
    const duration = document.getElementById('editMovieDuration').value.trim();
    const description = document.getElementById('editMovieDescription').value.trim();
    
    if (!title || !genre || !price || !duration || !description) {
        alert('لطفاً همه فیلدها را پر کنید');
        return;
    }
    
    // Get existing movies
    let movies = JSON.parse(localStorage.getItem('movies')) || [];
    const movieIndex = movies.findIndex(m => m.id === id);
    
    if (movieIndex === -1) return;
    
    // Update movie
    movies[movieIndex] = {
        ...movies[movieIndex],
        title,
        genre,
        rating: rating || 0,
        price: price + ' تومان',
        duration,
        description
    };
    
    localStorage.setItem('movies', JSON.stringify(movies));
    
    // Reload movies
    loadMovies();
    
    // Close modal
    closeEditMovieModal();
    
    // Show success message
    showMessage('فیلم با موفقیت بروزرسانی شد', 'success');
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

// Toggle user role
function toggleUserRole(userId) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    const newRole = users[userIndex].role === 'admin' ? 'user' : 'admin';
    users[userIndex].role = newRole;
    
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
    
    showMessage(`نقش کاربر به ${newRole === 'admin' ? 'ادمین' : 'کاربر'} تغییر یافت`, 'success');
}

// Delete user
function deleteUser(userId) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) return;
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    
    loadUsers();
    loadDashboard();
    
    showMessage('کاربر با موفقیت حذف شد', 'success');
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = currentBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    alert(`
کد رزرو: ${booking.code}
فیلم: ${booking.movie.title}
کاربر: ${getUsernameById(booking.userId)}
صندلی‌ها: ${booking.seats.join(', ')}
قیمت کل: ${booking.totalPrice.toLocaleString()} تومان
تاریخ: ${booking.date}
    `);
}

// Delete booking
function deleteBooking(bookingId) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این رزرو را حذف کنید؟')) return;
    
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    loadBookings();
    loadDashboard();
    
    showMessage('رزرو با موفقیت حذف شد', 'success');
}

// Update admin info
function updateAdminInfo() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const adminInfo = document.getElementById('adminInfo');
    
    if (user) {
        adminInfo.textContent = `سلام ${user.username}`;
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
window.adminApp = {
    loadDashboard,
    loadMovies,
    loadUsers,
    loadBookings,
    addMovie,
    editMovie,
    deleteMovie,
    toggleUserRole,
    deleteUser,
    deleteBooking
};