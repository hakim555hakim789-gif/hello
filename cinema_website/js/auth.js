// Authentication system with password hashing
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.init();
    }

    // Initialize authentication system
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.setupPasswordStrength();
    }

    // Load users from localStorage
    loadUsers() {
        const users = localStorage.getItem('users');
        if (!users) {
            // Create default admin user
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@cinema-iran.ir',
                    firstName: 'مدیر',
                    lastName: 'سیستم',
                    phone: '09123456789',
                    password: this.hashPassword('admin123'),
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 2,
                    username: 'representative',
                    email: 'rep@cinema-iran.ir',
                    firstName: 'نماینده',
                    lastName: 'سینما',
                    phone: '09187654321',
                    password: this.hashPassword('rep123'),
                    role: 'representative',
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            return defaultUsers;
        }
        return JSON.parse(users);
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const user = localStorage.getItem('loggedInUser');
        return user ? JSON.parse(user) : null;
    }

    // Hash password using SHA-256
    hashPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Check password strength
    checkPasswordStrength(password) {
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength += 1;
        else feedback.push('حداقل 8 کاراکتر');

        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('حداقل یک حرف کوچک');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('حداقل یک حرف بزرگ');

        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('حداقل یک عدد');

        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else feedback.push('حداقل یک کاراکتر خاص');

        let strengthText = '';
        let strengthClass = '';

        if (strength <= 2) {
            strengthText = 'ضعیف';
            strengthClass = 'weak';
        } else if (strength <= 3) {
            strengthText = 'متوسط';
            strengthClass = 'medium';
        } else {
            strengthText = 'قوی';
            strengthClass = 'strong';
        }

        return { strength, strengthText, strengthClass, feedback };
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password strength checker
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        // Social login buttons
        this.setupSocialLogin();
    }

    // Setup password strength indicator
    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    // Update password strength display
    updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;

        const result = this.checkPasswordStrength(password);
        
        // Remove all classes
        strengthFill.classList.remove('weak', 'medium', 'strong');
        
        if (password.length > 0) {
            strengthFill.classList.add(result.strengthClass);
            strengthText.textContent = result.strengthText;
        } else {
            strengthText.textContent = 'قدرت رمز عبور';
        }
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Validate inputs
        if (!this.validateLoginInputs(username, password)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call delay
            await this.delay(1000);

            const user = this.authenticateUser(username, password);
            
            if (user) {
                // Login successful
                this.loginUser(user, rememberMe);
                this.showNotification('ورود موفقیت‌آمیز بود', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (user.role === 'representative') {
                        window.location.href = 'representative.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                // Login failed
                this.showNotification('نام کاربری یا رمز عبور اشتباه است', 'error');
                this.shakeForm(form);
            }
        } catch (error) {
            this.showNotification('خطا در ورود. لطفاً دوباره تلاش کنید', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Get form data
        const formData = this.getFormData(form);
        
        // Validate inputs
        if (!this.validateRegisterInputs(formData)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call delay
            await this.delay(1000);

            // Check if user already exists
            if (this.userExists(formData.username, formData.email)) {
                this.showNotification('کاربری با این نام کاربری یا ایمیل قبلاً وجود دارد', 'error');
                return;
            }

            // Create new user
            const newUser = this.createUser(formData);
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));

            // Show success message
            this.showNotification('ثبت‌نام با موفقیت انجام شد', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            this.showNotification('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Get form data
    getFormData(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else {
                formData[input.id] = input.value.trim();
            }
        });
        
        return formData;
    }

    // Validate login inputs
    validateLoginInputs(username, password) {
        if (!username) {
            this.showNotification('لطفاً نام کاربری را وارد کنید', 'error');
            this.highlightInput('username', 'error');
            return false;
        }
        
        if (!password) {
            this.showNotification('لطفاً رمز عبور را وارد کنید', 'error');
            this.highlightInput('password', 'error');
            return false;
        }
        
        return true;
    }

    // Validate register inputs
    validateRegisterInputs(formData) {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
        
        for (const field of requiredFields) {
            if (!formData[field]) {
                this.showNotification(`لطفاً ${this.getFieldLabel(field)} را وارد کنید`, 'error');
                this.highlightInput(field, 'error');
                return false;
            }
        }
        
        // Validate email format
        if (!this.isValidEmail(formData.email)) {
            this.showNotification('فرمت ایمیل صحیح نیست', 'error');
            this.highlightInput('email', 'error');
            return false;
        }
        
        // Validate phone format
        if (!this.isValidPhone(formData.phone)) {
            this.showNotification('فرمت شماره تلفن صحیح نیست', 'error');
            this.highlightInput('phone', 'error');
            return false;
        }
        
        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            this.showNotification('رمز عبور و تایید آن مطابقت ندارند', 'error');
            this.highlightInput('confirmPassword', 'error');
            return false;
        }
        
        // Validate password strength
        const strength = this.checkPasswordStrength(formData.password);
        if (strength.strength < 3) {
            this.showNotification('رمز عبور باید حداقل متوسط باشد', 'error');
            this.highlightInput('password', 'error');
            return false;
        }
        
        // Validate terms agreement
        if (!formData.agreeTerms) {
            this.showNotification('لطفاً با شرایط استفاده موافقت کنید', 'error');
            return false;
        }
        
        return true;
    }

    // Get field label in Persian
    getFieldLabel(field) {
        const labels = {
            firstName: 'نام',
            lastName: 'نام خانوادگی',
            email: 'ایمیل',
            phone: 'شماره تلفن',
            password: 'رمز عبور',
            confirmPassword: 'تایید رمز عبور'
        };
        return labels[field] || field;
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone format
    isValidPhone(phone) {
        const phoneRegex = /^09\d{9}$/;
        return phoneRegex.test(phone);
    }

    // Check if user exists
    userExists(username, email) {
        return this.users.some(user => 
            user.username === username || user.email === email
        );
    }

    // Create new user
    createUser(formData) {
        return {
            id: this.users.length + 1,
            username: formData.email.split('@')[0], // Use email prefix as username
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            password: this.hashPassword(formData.password),
            role: 'user',
            createdAt: new Date().toISOString(),
            isActive: true,
            newsletter: formData.newsletter || false
        };
    }

    // Authenticate user
    authenticateUser(username, password) {
        const user = this.users.find(u => 
            (u.username === username || u.email === username) && 
            u.isActive
        );
        
        if (user && this.verifyPassword(password, user.password)) {
            return user;
        }
        
        return null;
    }

    // Login user
    loginUser(user, rememberMe) {
        this.currentUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
    }

    // Logout user
    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        window.location.href = 'index.html';
    }

    // Check authentication status
    checkAuthStatus() {
        if (this.currentUser) {
            // User is logged in
            this.updateUIForLoggedInUser();
        } else {
            // Check for remember me
            const rememberMe = localStorage.getItem('rememberMe');
            if (rememberMe) {
                // Auto-login logic could go here
            }
        }
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        // This would update the UI to show user info
        // For now, just redirect if on auth pages
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    }

    // Setup social login
    setupSocialLogin() {
        const googleBtn = document.querySelector('.btn-google');
        const telegramBtn = document.querySelector('.btn-telegram');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleSocialLogin('google'));
        }
        
        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => this.handleSocialLogin('telegram'));
        }
    }

    // Handle social login
    handleSocialLogin(provider) {
        this.showNotification(`ورود با ${provider} در حال توسعه است`, 'info');
    }

    // Utility functions
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    highlightInput(inputId, type) {
        const input = document.getElementById(inputId);
        if (input) {
            const inputIcon = input.closest('.input-icon');
            inputIcon.classList.remove('error', 'success');
            inputIcon.classList.add(type);
        }
    }

    shakeForm(form) {
        form.classList.add('shake');
        setTimeout(() => {
            form.classList.remove('shake');
        }, 500);
    }

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

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Toggle password visibility
function togglePassword(button) {
    const input = button.previousElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new AuthSystem();
});

// Export for use in other files
window.AuthSystem = AuthSystem;