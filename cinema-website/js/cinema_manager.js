// Cinema Manager Panel System
class CinemaManagerSystem {
    constructor() {
        this.currentUser = null;
        this.currentCinema = null;
        this.init();
    }

    // Initialize the system
    init() {
        this.checkAuth();
        this.loadUserInfo();
        this.loadCinemaInfo();
        this.setupEventListeners();
        this.loadDashboardData();
        this.loadSchedules();
        this.loadBookings();
        this.loadSeatsData();
    }

    // Check authentication
    checkAuth() {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user || user.role !== 'cinema_manager') {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = user;
    }

    // Load user information
    loadUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <span>سلام ${this.currentUser.firstName} ${this.currentUser.lastName}</span>
            `;
        }
    }

    // Load cinema information
    loadCinemaInfo() {
        const cinemas = JSON.parse(localStorage.getItem('cinemas') || '[]');
        this.currentCinema = cinemas.find(c => c.id === this.currentUser.cinemaId);
        
        if (!this.currentCinema) {
            console.error('Cinema not found for user');
            return;
        }

        // Update cinema info display
        document.getElementById('cinemaName').textContent = this.currentCinema.name;
        document.getElementById('cinemaAddress').textContent = this.currentCinema.address;
        document.getElementById('cinemaPhone').textContent = this.currentCinema.phone;
        document.getElementById('cinemaEmail').textContent = this.currentCinema.email;
        document.getElementById('cinemaCapacity').textContent = this.currentCinema.capacity;

        // Update settings form
        document.getElementById('cinemaNameInput').value = this.currentCinema.name;
        document.getElementById('cinemaAddressInput').value = this.currentCinema.address;
        document.getElementById('cinemaPhoneInput').value = this.currentCinema.phone;
        document.getElementById('cinemaEmailInput').value = this.currentCinema.email;
        document.getElementById('cinemaCapacityInput').value = this.currentCinema.capacity;

        // Update features checkboxes
        this.updateFeaturesCheckboxes();
    }

    // Update features checkboxes
    updateFeaturesCheckboxes() {
        const featuresContainer = document.getElementById('cinemaFeatures');
        const checkboxes = featuresContainer.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.currentCinema.features.includes(checkbox.value);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(item.getAttribute('data-section'));
            });
        });
    }

    // Show section
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }

        // Add active class to clicked nav item
        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    // Load dashboard data
    loadDashboardData() {
        this.loadTodayStats();
        this.loadRecentActivities();
    }

    // Load today's statistics
    loadTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        
        // Count today's schedules
        const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        const todaySchedules = schedules.filter(s => 
            s.cinemaId === this.currentCinema.id && s.date === today
        );
        document.getElementById('todaySchedules').textContent = todaySchedules.length;

        // Count today's bookings
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const todayBookings = bookings.filter(b => 
            b.cinemaId === this.currentCinema.id && 
            b.date.split('T')[0] === today
        );
        document.getElementById('todayBookings').textContent = todayBookings.length;

        // Calculate today's revenue
        const todayRevenue = todayBookings.reduce((total, booking) => total + booking.totalPrice, 0);
        document.getElementById('todayRevenue').textContent = `${this.formatPrice(todayRevenue)} تومان`;

        // Calculate occupancy rate
        const totalSeats = this.currentCinema.capacity;
        const occupiedSeats = todayBookings.reduce((total, booking) => total + booking.seats.length, 0);
        const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;
        document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;
    }

    // Load recent activities
    loadRecentActivities() {
        const activitiesContainer = document.getElementById('recentActivities');
        if (!activitiesContainer) return;

        const activities = [
            {
                icon: 'fas fa-ticket-alt',
                title: 'رزرو جدید',
                description: 'کاربر جدیدی صندلی رزرو کرد',
                time: '2 دقیقه پیش'
            },
            {
                icon: 'fas fa-calendar-plus',
                title: 'برنامه جدید',
                description: 'برنامه نمایش جدیدی اضافه شد',
                time: '1 ساعت پیش'
            },
            {
                icon: 'fas fa-user-plus',
                title: 'کاربر جدید',
                description: 'کاربر جدیدی در سیستم ثبت‌نام کرد',
                time: '3 ساعت پیش'
            }
        ];

        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="${activity.icon}"></i>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description} - ${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    // Load schedules
    loadSchedules() {
        const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        const cinemaSchedules = schedules.filter(s => s.cinemaId === this.currentCinema.id);
        
        this.displaySchedules(cinemaSchedules);
    }

    // Display schedules in table
    displaySchedules(schedules) {
        const tbody = document.getElementById('schedulesTableBody');
        if (!tbody) return;

        tbody.innerHTML = schedules.map(schedule => {
            const movie = this.getMovieById(schedule.movieId);
            return `
                <tr>
                    <td>${movie ? movie.title : 'نامشخص'}</td>
                    <td>${this.formatDate(schedule.date)}</td>
                    <td>${schedule.time}</td>
                    <td>${schedule.price} تومان</td>
                    <td>
                        <span class="status-badge ${schedule.isActive ? 'active' : 'inactive'}">
                            ${schedule.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline" onclick="editSchedule(${schedule.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteSchedule(${schedule.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Load bookings
    loadBookings() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const cinemaBookings = bookings.filter(b => b.cinemaId === this.currentCinema.id);
        
        this.displayBookings(cinemaBookings);
    }

    // Display bookings in table
    displayBookings(bookings) {
        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        tbody.innerHTML = bookings.map(booking => {
            const movie = this.getMovieById(booking.movieId);
            const user = this.getUserById(booking.userId);
            return `
                <tr>
                    <td>${booking.code}</td>
                    <td>${movie ? movie.title : 'نامشخص'}</td>
                    <td>${user ? `${user.firstName} ${user.lastName}` : 'نامشخص'}</td>
                    <td>${booking.seats.join(', ')}</td>
                    <td>${this.formatPrice(booking.totalPrice)} تومان</td>
                    <td>${this.formatDate(booking.date)}</td>
                    <td>
                        <span class="status-badge ${booking.status}">
                            ${this.getStatusText(booking.status)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline" onclick="viewBooking(${booking.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="confirmBooking(${booking.id})">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Load seats data
    loadSeatsData() {
        this.updateSeatsStats();
    }

    // Update seats statistics
    updateSeatsStats() {
        const totalSeats = this.currentCinema.capacity;
        const vipSeats = Math.ceil(totalSeats * 0.2); // 20% VIP seats
        const normalSeats = totalSeats - vipSeats;

        document.getElementById('totalSeats').textContent = totalSeats;
        document.getElementById('vipSeats').textContent = vipSeats;
        document.getElementById('normalSeats').textContent = normalSeats;
    }

    // Show seat map
    showSeatMap() {
        const container = document.getElementById('seatMapContainer');
        if (container) {
            container.style.display = 'block';
            this.generateSeatMap();
        }
    }

    // Generate seat map
    generateSeatMap() {
        const seatsGrid = document.getElementById('seatsGrid');
        if (!seatsGrid) return;

        const capacity = this.currentCinema.capacity;
        let rows, cols;
        
        // Calculate optimal grid layout
        if (capacity <= 30) {
            rows = 6;
            cols = 5;
        } else if (capacity <= 40) {
            rows = 8;
            cols = 5;
        } else {
            rows = 10;
            cols = 6;
        }

        seatsGrid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
        seatsGrid.innerHTML = '';

        const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        for (let row = 0; row < rows; row++) {
            for (let col = 1; col <= cols; col++) {
                const seatNumber = `${rowLetters[row]}${col}`;
                const isVip = (row === 0 || row === 1) && (col >= 2 && col <= cols - 1);
                
                const seatElement = document.createElement('div');
                seatElement.className = `seat-item ${isVip ? 'vip' : 'available'}`;
                seatElement.textContent = seatNumber;
                seatElement.title = `صندلی ${seatNumber}${isVip ? ' (VIP)' : ''}`;
                
                seatsGrid.appendChild(seatElement);
            }
        }
    }

    // Save cinema settings
    saveCinemaSettings() {
        const name = document.getElementById('cinemaNameInput').value;
        const address = document.getElementById('cinemaAddressInput').value;
        const phone = document.getElementById('cinemaPhoneInput').value;
        const email = document.getElementById('cinemaEmailInput').value;
        const capacity = parseInt(document.getElementById('cinemaCapacityInput').value);

        // Get selected features
        const featuresContainer = document.getElementById('cinemaFeatures');
        const checkboxes = featuresContainer.querySelectorAll('input[type="checkbox"]:checked');
        const features = Array.from(checkboxes).map(cb => cb.value);

        // Update cinema data
        this.currentCinema.name = name;
        this.currentCinema.address = address;
        this.currentCinema.phone = phone;
        this.currentCinema.email = email;
        this.currentCinema.capacity = capacity;
        this.currentCinema.features = features;

        // Save to localStorage
        const cinemas = JSON.parse(localStorage.getItem('cinemas') || '[]');
        const cinemaIndex = cinemas.findIndex(c => c.id === this.currentCinema.id);
        if (cinemaIndex !== -1) {
            cinemas[cinemaIndex] = this.currentCinema;
            localStorage.setItem('cinemas', JSON.stringify(cinemas));
        }

        // Update display
        this.loadCinemaInfo();
        this.updateSeatsStats();

        // Show success message
        this.showNotification('تنظیمات سینما با موفقیت ذخیره شد', 'success');
    }

    // Utility functions
    getMovieById(movieId) {
        const movies = JSON.parse(localStorage.getItem('movies') || '[]');
        return movies.find(m => m.id === movieId);
    }

    getUserById(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.id === userId);
    }

    formatPrice(price) {
        return price.toLocaleString('fa-IR');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return date.toLocaleDateString('fa-IR', options);
    }

    getStatusText(status) {
        const statusMap = {
            'confirmed': 'تایید شده',
            'pending': 'در انتظار',
            'cancelled': 'لغو شده'
        };
        return statusMap[status] || status;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-family: 'Vazirmatn', 'Tahoma', sans-serif;
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

    getNotificationColor(type) {
        const colors = {
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// Global functions
function showAddScheduleModal() {
    document.getElementById('addScheduleModal').classList.add('show');
    loadMoviesForSchedule();
}

function showAddSeatModal() {
    document.getElementById('addSeatModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function addSchedule() {
    const movieId = document.getElementById('scheduleMovie').value;
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const price = document.getElementById('schedulePrice').value;

    if (!movieId || !date || !time || !price) {
        window.cinemaManager.showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
        return;
    }

    // Create new schedule
    const newSchedule = {
        id: Date.now(),
        cinemaId: window.cinemaManager.currentCinema.id,
        movieId: parseInt(movieId),
        date: date,
        time: time,
        price: price,
        isActive: true,
        createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    schedules.push(newSchedule);
    localStorage.setItem('schedules', JSON.stringify(schedules));

    // Close modal and reload
    closeModal('addScheduleModal');
    window.cinemaManager.loadSchedules();
    window.cinemaManager.loadDashboardData();
    window.cinemaManager.showNotification('برنامه جدید با موفقیت اضافه شد', 'success');
}

function addSeat() {
    const row = document.getElementById('seatRow').value;
    const number = document.getElementById('seatNumber').value;
    const type = document.getElementById('seatType').value;

    if (!row || !number || !type) {
        window.cinemaManager.showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
        return;
    }

    // Close modal and show success message
    closeModal('addSeatModal');
    window.cinemaManager.showNotification('صندلی جدید اضافه شد', 'success');
}

function loadMoviesForSchedule() {
    const select = document.getElementById('scheduleMovie');
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    
    select.innerHTML = '<option value="">انتخاب فیلم</option>';
    movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = movie.title;
        select.appendChild(option);
    });
}

function filterBookings() {
    // Implementation for filtering bookings
    console.log('Filtering bookings...');
}

function generateDailyReport() {
    window.cinemaManager.showNotification('گزارش روزانه در حال آماده‌سازی است', 'info');
}

function generateWeeklyReport() {
    window.cinemaManager.showNotification('گزارش هفتگی در حال آماده‌سازی است', 'info');
}

function generateMonthlyReport() {
    window.cinemaManager.showNotification('گزارش ماهانه در حال آماده‌سازی است', 'info');
}

function generateSeatsReport() {
    window.cinemaManager.showNotification('گزارش صندلی‌ها در حال آماده‌سازی است', 'info');
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

// Initialize cinema manager system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cinemaManager = new CinemaManagerSystem();
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification {
        font-family: 'Vazirmatn', 'Tahoma', sans-serif;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(notificationStyles);