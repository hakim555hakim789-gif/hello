// Admin Panel System
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    // Initialize admin panel
    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardData();
        this.loadMovies();
        this.loadUsers();
        this.loadBookings();
        this.loadCinemas();
    }

    // Check authentication and role
    checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        if (currentUser.role !== 'admin') {
            alert('شما دسترسی به این صفحه را ندارید');
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = currentUser;
        this.updateUserInfo();
    }

    // Update user information in header
    updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span>${this.currentUser.firstName} ${this.currentUser.lastName}</span>
            `;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(item.getAttribute('data-section'));
            });
        });
    }

    // Navigate to section
    navigateToSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to clicked nav item
        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    // Load dashboard data
    loadDashboardData() {
        // Load movies count
        const movies = JSON.parse(localStorage.getItem('movies') || '[]');
        document.getElementById('totalMovies').textContent = movies.length;

        // Load users count
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        document.getElementById('totalUsers').textContent = users.length;

        // Load today's bookings
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const today = new Date().toDateString();
        const todayBookings = bookings.filter(booking => 
            new Date(booking.date).toDateString() === today
        );
        document.getElementById('todayBookings').textContent = todayBookings.length;

        // Calculate today's revenue
        const todayRevenue = todayBookings.reduce((total, booking) => 
            total + (booking.totalPrice || 0), 0
        );
        document.getElementById('todayRevenue').textContent = 
            `${this.formatPrice(todayRevenue)} تومان`;
    }

    // Load movies
    loadMovies() {
        const movies = JSON.parse(localStorage.getItem('movies') || '[]');
        const tbody = document.getElementById('moviesTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (movies.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-film" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
                        <p>هیچ فیلمی یافت نشد</p>
                    </td>
                </tr>
            `;
            return;
        }

        movies.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #e74c3c, #f39c12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                        ${movie.image || '🎬'}
                    </div>
                </td>
                <td>${movie.title}</td>
                <td>${movie.genre}</td>
                <td>${movie.rating}/5</td>
                <td>${movie.price} تومان</td>
                <td><span class="status-badge active">فعال</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="editMovie(${movie.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMovie(${movie.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Load users
    loadUsers() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const tbody = document.getElementById('usersTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-users" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
                        <p>هیچ کاربری یافت نشد</p>
                    </td>
                </tr>
            `;
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${this.getRoleLabel(user.role)}</span></td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'فعال' : 'غیرفعال'}</span></td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="toggleUserStatus(${user.id})">
                            <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="changeUserRole(${user.id})">
                            <i class="fas fa-user-cog"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Load bookings
    loadBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const tbody = document.getElementById('bookingsTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-ticket-alt" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
                        <p>هیچ رزروی یافت نشد</p>
                    </td>
                </tr>
            `;
            return;
        }

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><code>${booking.code}</code></td>
                <td>${booking.movie?.title || 'نامشخص'}</td>
                <td>${booking.user?.firstName || ''} ${booking.user?.lastName || ''}</td>
                <td>${booking.seats.join(', ')}</td>
                <td>${this.formatPrice(booking.totalPrice)} تومان</td>
                <td>${this.formatDate(booking.date)}</td>
                <td><span class="status-badge active">تایید شده</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewBookingDetails(${booking.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Load cinemas
    loadCinemas() {
        const cinemas = [
            {
                id: 1,
                name: 'سینما مرکزی',
                address: 'تهران، خیابان ولیعصر',
                phone: '021-12345678',
                features: ['صندلی راحت', 'صدای دالبی', 'وای‌فای رایگان']
            },
            {
                id: 2,
                name: 'سینما پارک',
                address: 'تهران، پارک ملت',
                phone: '021-87654321',
                features: ['صندلی VIP', 'صدای IMAX', 'کافه']
            },
            {
                id: 3,
                name: 'سینما آفتاب',
                address: 'تهران، خیابان انقلاب',
                phone: '021-11223344',
                features: ['صندلی راحت', 'صدای دالبی', 'پارکینگ']
            }
        ];

        const cinemasGrid = document.getElementById('cinemasGrid');
        if (!cinemasGrid) return;

        cinemasGrid.innerHTML = '';

        cinemas.forEach(cinema => {
            const cinemaCard = document.createElement('div');
            cinemaCard.className = 'cinema-card';
            cinemaCard.innerHTML = `
                <h3>${cinema.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${cinema.address}</p>
                <p><i class="fas fa-phone"></i> ${cinema.phone}</p>
                <div class="cinema-features">
                    ${cinema.features.map(feature => `<span>${feature}</span>`).join('')}
                </div>
                <div class="table-actions" style="margin-top: 1rem;">
                    <button class="btn btn-sm btn-outline" onclick="editCinema(${cinema.id})">
                        <i class="fas fa-edit"></i> ویرایش
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCinema(${cinema.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            `;
            cinemasGrid.appendChild(cinemaCard);
        });
    }

    // Utility functions
    getRoleLabel(role) {
        const labels = {
            'admin': 'مدیر',
            'representative': 'نماینده',
            'user': 'کاربر'
        };
        return labels[role] || role;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatPrice(price) {
        return price.toLocaleString('fa-IR');
    }
}

// Global functions for admin panel
function showAddMovieModal() {
    document.getElementById('addMovieModal').classList.add('show');
}

function showAddCinemaModal() {
    document.getElementById('addCinemaModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function addMovie() {
    const form = document.getElementById('addMovieForm');
    const formData = new FormData(form);
    
    const movieData = {
        id: Date.now(),
        title: document.getElementById('movieTitle').value,
        genre: document.getElementById('movieGenre').value,
        rating: parseFloat(document.getElementById('movieRating').value),
        price: document.getElementById('moviePrice').value,
        description: document.getElementById('movieDescription').value,
        duration: document.getElementById('movieDuration').value,
        year: parseInt(document.getElementById('movieYear').value),
        image: '🎬',
        createdAt: new Date().toISOString()
    };

    // Validate required fields
    if (!movieData.title || !movieData.genre || !movieData.price) {
        alert('لطفاً تمام فیلدهای ضروری را پر کنید');
        return;
    }

    // Save movie
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    movies.push(movieData);
    localStorage.setItem('movies', JSON.stringify(movies));

    // Close modal and reload
    closeModal('addMovieModal');
    form.reset();
    
    // Reload movies table
    if (window.adminPanel) {
        window.adminPanel.loadMovies();
        window.adminPanel.loadDashboardData();
    }

    showNotification('فیلم با موفقیت اضافه شد', 'success');
}

function addCinema() {
    const form = document.getElementById('addCinemaModal');
    
    const cinemaData = {
        id: Date.now(),
        name: document.getElementById('cinemaName').value,
        address: document.getElementById('cinemaAddress').value,
        phone: document.getElementById('cinemaPhone').value,
        features: Array.from(document.querySelectorAll('#addCinemaModal input[type="checkbox"]:checked'))
            .map(cb => cb.value)
    };

    // Validate required fields
    if (!cinemaData.name || !cinemaData.address || !cinemaData.phone) {
        alert('لطفاً تمام فیلدهای ضروری را پر کنید');
        return;
    }

    // Close modal and reload
    closeModal('addCinemaModal');
    form.reset();
    
    // Reload cinemas
    if (window.adminPanel) {
        window.adminPanel.loadCinemas();
    }

    showNotification('سینما با موفقیت اضافه شد', 'success');
}

function editMovie(movieId) {
    showNotification('این قابلیت در حال توسعه است', 'info');
}

function deleteMovie(movieId) {
    if (confirm('آیا از حذف این فیلم اطمینان دارید؟')) {
        const movies = JSON.parse(localStorage.getItem('movies') || '[]');
        const updatedMovies = movies.filter(movie => movie.id !== movieId);
        localStorage.setItem('movies', JSON.stringify(updatedMovies));
        
        if (window.adminPanel) {
            window.adminPanel.loadMovies();
            window.adminPanel.loadDashboardData();
        }
        
        showNotification('فیلم با موفقیت حذف شد', 'success');
    }
}

function toggleUserStatus(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].isActive = !users[userIndex].isActive;
        localStorage.setItem('users', JSON.stringify(users));
        
        if (window.adminPanel) {
            window.adminPanel.loadUsers();
        }
        
        const status = users[userIndex].isActive ? 'فعال' : 'غیرفعال';
        showNotification(`وضعیت کاربر به ${status} تغییر یافت`, 'success');
    }
}

function changeUserRole(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        const currentRole = users[userIndex].role;
        const roles = ['user', 'representative', 'admin'];
        const currentIndex = roles.indexOf(currentRole);
        const newRole = roles[(currentIndex + 1) % roles.length];
        
        users[userIndex].role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        
        if (window.adminPanel) {
            window.adminPanel.loadUsers();
        }
        
        showNotification(`نقش کاربر به ${window.adminPanel.getRoleLabel(newRole)} تغییر یافت`, 'success');
    }
}

function viewBookingDetails(bookingId) {
    showNotification('این قابلیت در حال توسعه است', 'info');
}

function cancelBooking(bookingId) {
    if (confirm('آیا از لغو این رزرو اطمینان دارید؟')) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        
        if (window.adminPanel) {
            window.adminPanel.loadBookings();
            window.adminPanel.loadDashboardData();
        }
        
        showNotification('رزرو با موفقیت لغو شد', 'success');
    }
}

function editCinema(cinemaId) {
    showNotification('این قابلیت در حال توسعه است', 'info');
}

function deleteCinema(cinemaId) {
    if (confirm('آیا از حذف این سینما اطمینان دارید؟')) {
        showNotification('سینما با موفقیت حذف شد', 'success');
        
        if (window.adminPanel) {
            window.adminPanel.loadCinemas();
        }
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

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

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db'
    };
    return colors[type] || '#3498db';
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
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
    
    /* Mobile menu toggle for admin panel */
    @media (max-width: 768px) {
        .admin-sidebar {
            transform: translateX(-100%);
        }
        
        .admin-sidebar.show {
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(notificationStyles);