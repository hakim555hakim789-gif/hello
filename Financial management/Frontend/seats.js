// Global variables
let selectedSeats = [];
let selectedMovie = null;
let seatPrice = 50000; // قیمت هر صندلی

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadMovieDetails();
    generateSeats();
    updateUserInfo();
});

// Check if user is authenticated
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        alert('برای انتخاب صندلی ابتدا وارد شوید');
        window.location.href = 'Login.html';
        return;
    }
}

// Load movie details from localStorage
function loadMovieDetails() {
    const movieData = localStorage.getItem('selectedMovie');
    if (!movieData) {
        alert('فیلمی انتخاب نشده است');
        window.location.href = 'index.html';
        return;
    }
    
    selectedMovie = JSON.parse(movieData);
    displayMovieDetails();
}

// Display movie details
function displayMovieDetails() {
    const movieDetails = document.getElementById('movieDetails');
    
    movieDetails.innerHTML = `
        <div class="movie-poster">
            ${selectedMovie.image}
        </div>
        <div class="movie-info">
            <h2>${selectedMovie.title}</h2>
            <p><strong>ژانر:</strong> ${selectedMovie.genre}</p>
            <p><strong>مدت زمان:</strong> ${selectedMovie.duration}</p>
            <p><strong>امتیاز:</strong> ${selectedMovie.rating}/5</p>
            <p class="movie-price">قیمت هر صندلی: ${seatPrice.toLocaleString()} تومان</p>
        </div>
    `;
}

// Generate seats grid
function generateSeats() {
    const seatsGrid = document.getElementById('seatsGrid');
    const totalRows = 8;
    const totalCols = 10;
    
    // Generate some occupied seats randomly
    const occupiedSeats = generateOccupiedSeats(totalRows * totalCols);
    
    for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < totalCols; col++) {
            const seatNumber = row * totalCols + col + 1;
            const seat = document.createElement('div');
            seat.className = 'seat available';
            seat.textContent = seatNumber;
            seat.dataset.seatNumber = seatNumber;
            
            // Check if seat is occupied
            if (occupiedSeats.includes(seatNumber)) {
                seat.className = 'seat occupied';
                seat.textContent = seatNumber;
            } else {
                seat.addEventListener('click', () => toggleSeat(seat, seatNumber));
            }
            
            seatsGrid.appendChild(seat);
        }
    }
}

// Generate random occupied seats
function generateOccupiedSeats(totalSeats) {
    const occupiedCount = Math.floor(totalSeats * 0.3); // 30% occupied
    const occupied = [];
    
    for (let i = 0; i < occupiedCount; i++) {
        let randomSeat;
        do {
            randomSeat = Math.floor(Math.random() * totalSeats) + 1;
        } while (occupied.includes(randomSeat));
        occupied.push(randomSeat);
    }
    
    return occupied;
}

// Toggle seat selection
function toggleSeat(seatElement, seatNumber) {
    if (seatElement.classList.contains('selected')) {
        // Deselect seat
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
        selectedSeats = selectedSeats.filter(seat => seat !== seatNumber);
    } else {
        // Select seat
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
        selectedSeats.push(seatNumber);
    }
    
    updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
    const bookingSummary = document.getElementById('bookingSummary');
    const summaryMovie = document.getElementById('summaryMovie');
    const summarySeats = document.getElementById('summarySeats');
    const summaryPrice = document.getElementById('summaryPrice');
    
    if (selectedSeats.length > 0) {
        bookingSummary.style.display = 'block';
        
        summaryMovie.textContent = selectedMovie.title;
        summarySeats.textContent = selectedSeats.join(', ');
        
        const totalPrice = selectedSeats.length * seatPrice;
        summaryPrice.textContent = totalPrice.toLocaleString() + ' تومان';
    } else {
        bookingSummary.style.display = 'none';
    }
}

// Confirm booking
function confirmBooking() {
    if (selectedSeats.length === 0) {
        alert('لطفاً حداقل یک صندلی انتخاب کنید');
        return;
    }
    
    // Generate booking code
    const bookingCode = generateBookingCode();
    const bookingDate = getPersianDate();
    
    // Save booking to localStorage
    const booking = {
        id: Date.now(),
        code: bookingCode,
        movie: selectedMovie,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * seatPrice,
        date: bookingDate,
        userId: JSON.parse(localStorage.getItem('loggedInUser')).id
    };
    
    // Get existing bookings or create new array
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(booking));
    
    // Update occupied seats
    updateOccupiedSeats(selectedSeats);
    
    // Show success modal
    showSuccessModal(bookingCode, bookingDate);
}

// Generate random booking code
function generateBookingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Get current date in Persian
function getPersianDate() {
    const now = new Date();
    return now.toLocaleDateString('fa-IR');
}

// Update occupied seats
function updateOccupiedSeats(seatNumbers) {
    seatNumbers.forEach(seatNumber => {
        const seatElement = document.querySelector(`[data-seat-number="${seatNumber}"]`);
        if (seatElement) {
            seatElement.classList.remove('selected');
            seatElement.classList.add('occupied');
            seatElement.removeEventListener('click', () => toggleSeat(seatElement, seatNumber));
        }
    });
}

// Show success modal
function showSuccessModal(bookingCode, bookingDate) {
    const modal = document.getElementById('successModal');
    const bookingCodeSpan = document.getElementById('bookingCode');
    const bookingDateSpan = document.getElementById('bookingDate');
    
    bookingCodeSpan.textContent = bookingCode;
    bookingDateSpan.textContent = bookingDate;
    
    modal.style.display = 'flex';
}

// Go to home page
function goToHome() {
    window.location.href = 'index.html';
}

// Logout function
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

// Update user info display
function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const userInfo = document.getElementById('userInfo');
    
    if (user) {
        userInfo.textContent = `سلام ${user.username}`;
    }
}

// Utility function to format price
function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

// Add loading state
function showLoading() {
    const seatsGrid = document.getElementById('seatsGrid');
    seatsGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

// Remove loading state
function hideLoading() {
    // Loading will be removed when seats are generated
}

// Error handling
function showError(message) {
    const seatsGrid = document.getElementById('seatsGrid');
    seatsGrid.innerHTML = `
        <div class="error">
            <p>خطا: ${message}</p>
            <button onclick="generateSeats()" class="btn btn-primary">تلاش مجدد</button>
        </div>
    `;
}

// Export functions for use in other files
window.seatsApp = {
    generateSeats,
    toggleSeat,
    confirmBooking,
    logout
};