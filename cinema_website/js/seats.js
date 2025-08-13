// Seat selection system
class SeatSelectionSystem {
    constructor() {
        this.selectedMovie = null;
        this.selectedSeats = [];
        this.seatsData = this.generateSeatsData();
        this.init();
    }

    // Initialize the system
    init() {
        this.loadMovieData();
        this.setupEventListeners();
        this.renderSeats();
        this.updateUserInfo();
        this.updateSummary();
    }

    // Load movie data from localStorage
    loadMovieData() {
        const movieData = localStorage.getItem('selectedMovie');
        if (movieData) {
            this.selectedMovie = JSON.parse(movieData);
            this.displayMovieInfo();
        } else {
            // Redirect to home if no movie selected
            window.location.href = 'index.html';
        }
    }

    // Display movie information
    displayMovieInfo() {
        if (!this.selectedMovie) return;

        document.getElementById('movieImage').textContent = this.selectedMovie.image;
        document.getElementById('movieTitle').textContent = this.selectedMovie.title;
        document.getElementById('movieGenre').textContent = this.selectedMovie.genre;
        document.getElementById('movieDuration').textContent = this.selectedMovie.duration;
        document.getElementById('movieRating').textContent = `${this.selectedMovie.rating}/5`;
        document.getElementById('movieDescription').textContent = this.selectedMovie.description;
        document.getElementById('moviePrice').textContent = `${this.selectedMovie.price} تومان`;
    }

    // Generate seats data
    generateSeatsData() {
        const seats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const cols = 20;

        for (let row = 0; row < rows.length; row++) {
            for (let col = 1; col <= cols; col++) {
                const seatNumber = `${rows[row]}${col}`;
                const isVip = (row === 0 || row === 1) && (col >= 8 && col <= 13);
                const isOccupied = Math.random() < 0.3; // 30% chance of being occupied

                seats.push({
                    id: seatNumber,
                    row: rows[row],
                    col: col,
                    isVip: isVip,
                    isOccupied: isOccupied,
                    isSelected: false
                });
            }
        }

        return seats;
    }

    // Render seats grid
    renderSeats() {
        const seatsGrid = document.getElementById('seatsGrid');
        if (!seatsGrid) return;

        seatsGrid.innerHTML = '';

        this.seatsData.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.className = `seat-grid-item ${this.getSeatClass(seat)}`;
            seatElement.setAttribute('data-seat', seat.id);
            seatElement.setAttribute('data-seat-id', seat.id);
            
            if (!seat.isOccupied) {
                seatElement.addEventListener('click', () => this.toggleSeat(seat.id));
            }

            seatsGrid.appendChild(seatElement);
        });
    }

    // Get seat CSS class
    getSeatClass(seat) {
        if (seat.isOccupied) return 'occupied';
        if (seat.isSelected) return 'selected';
        if (seat.isVip) return 'vip';
        return 'available';
    }

    // Toggle seat selection
    toggleSeat(seatId) {
        const seat = this.seatsData.find(s => s.id === seatId);
        if (!seat || seat.isOccupied) return;

        if (seat.isSelected) {
            // Deselect seat
            seat.isSelected = false;
            this.selectedSeats = this.selectedSeats.filter(s => s !== seatId);
        } else {
            // Select seat
            seat.isSelected = true;
            this.selectedSeats.push(seatId);
        }

        // Update UI
        this.renderSeats();
        this.updateSummary();
        this.updateConfirmButton();
    }

    // Update booking summary
    updateSummary() {
        if (!this.selectedMovie) return;

        const currentDate = new Date();
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1);

        document.getElementById('summaryMovie').textContent = this.selectedMovie.title;
        document.getElementById('summaryDate').textContent = this.formatDate(tomorrow);
        document.getElementById('summaryTime').textContent = '20:00';
        document.getElementById('summarySeats').textContent = this.selectedSeats.join(', ') || '-';
        document.getElementById('summaryCount').textContent = this.selectedSeats.length;
        
        const totalPrice = this.selectedSeats.length * this.parsePrice(this.selectedMovie.price);
        document.getElementById('summaryTotal').textContent = `${this.formatPrice(totalPrice)} تومان`;
    }

    // Update confirm button state
    updateConfirmButton() {
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedSeats.length === 0;
        }
    }

    // Parse price string to number
    parsePrice(priceString) {
        return parseInt(priceString.replace(/,/g, ''));
    }

    // Format price number
    formatPrice(price) {
        return price.toLocaleString('fa-IR');
    }

    // Format date
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('fa-IR', options);
    }

    // Update user information in header
    updateUserInfo() {
        const navUser = document.getElementById('navUser');
        if (!navUser) return;

        const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (currentUser) {
            navUser.innerHTML = `
                <span class="user-name">سلام ${currentUser.firstName}!</span>
                <button class="btn btn-outline btn-sm" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    خروج
                </button>
            `;
        } else {
            navUser.innerHTML = `
                <a href="login.html" class="btn btn-outline btn-sm">ورود</a>
            `;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Add any additional event listeners here
    }

    // Clear seat selection
    clearSelection() {
        this.selectedSeats.forEach(seatId => {
            const seat = this.seatsData.find(s => s.id === seatId);
            if (seat) {
                seat.isSelected = false;
            }
        });
        
        this.selectedSeats = [];
        this.renderSeats();
        this.updateSummary();
        this.updateConfirmButton();
    }

    // Confirm booking
    async confirmBooking() {
        if (this.selectedSeats.length === 0) {
            this.showNotification('لطفاً حداقل یک صندلی انتخاب کنید', 'error');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!currentUser) {
            this.showNotification('برای رزرو صندلی ابتدا وارد شوید', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Show loading
        this.showLoading(true);

        try {
            // Simulate API call
            await this.delay(2000);

            // Generate booking code
            const bookingCode = this.generateBookingCode();

            // Save booking to localStorage
            this.saveBooking(bookingCode);

            // Show success modal
            this.showSuccessModal(bookingCode);

        } catch (error) {
            this.showNotification('خطا در رزرو. لطفاً دوباره تلاش کنید', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Generate unique booking code
    generateBookingCode() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `CIN${timestamp.toUpperCase()}${random.toUpperCase()}`;
    }

    // Save booking to localStorage
    saveBooking(bookingCode) {
        const booking = {
            id: Date.now(),
            code: bookingCode,
            movie: this.selectedMovie,
            seats: this.selectedSeats,
            user: JSON.parse(localStorage.getItem('loggedInUser')),
            date: new Date().toISOString(),
            totalPrice: this.selectedSeats.length * this.parsePrice(this.selectedMovie.price),
            status: 'confirmed'
        };

        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    // Show success modal
    showSuccessModal(bookingCode) {
        document.getElementById('bookingCode').textContent = bookingCode;
        document.getElementById('successModal').classList.add('show');
    }

    // Show loading overlay
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('show');
            } else {
                loadingOverlay.classList.remove('show');
            }
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
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
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Get notification color
    getNotificationColor(type) {
        const colors = {
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }

    // Utility function for delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions
function clearSelection() {
    if (window.seatSystem) {
        window.seatSystem.clearSelection();
    }
}

function confirmBooking() {
    if (window.seatSystem) {
        window.seatSystem.confirmBooking();
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('show');
        // Redirect to home after closing modal
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

function logout() {
    if (window.authSystem) {
        window.authSystem.logoutUser();
    } else {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    }
}

// Initialize seat selection system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.seatSystem = new SeatSelectionSystem();
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
    
    .user-name {
        color: var(--text-dark);
        font-weight: 500;
    }
    
    .btn-sm {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
    
    /* Additional seat styles */
    .seat-grid-item.vip::after {
        content: 'VIP';
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.6rem;
        color: var(--secondary-color);
        font-weight: 700;
    }
    
    /* Hover effects for VIP seats */
    .seat-grid-item.vip:hover {
        box-shadow: 0 8px 25px rgba(243, 156, 18, 0.6);
    }
    
    /* Selected seat animation */
    .seat-grid-item.selected {
        animation: seatSelected 0.3s ease-out;
    }
    
    @keyframes seatSelected {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1.1); }
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .seats-grid {
            overflow-x: auto;
            padding-bottom: 1rem;
        }
        
        .seat-grid-item::before {
            font-size: 0.6rem;
        }
        
        .seat-grid-item.vip::after {
            font-size: 0.5rem;
        }
    }
`;
document.head.appendChild(notificationStyles);