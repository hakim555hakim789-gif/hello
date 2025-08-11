// کلاس مدیریت ثبت‌نام
class SignupManager {
  constructor() {
    this.users = [];
    this.debugMode = false;
    this.minUsernameLength = 2;
    this.minPasswordLength = 3;
    
    // متغیرهای مختلف
    this.currentFormData = null;
    this.validationErrors = [];
    this.successMessages = [];
    
    // آرایه‌های کمکی
    this.reservedUsernames = ['admin', 'root', 'system', 'guest', 'test'];
    this.passwordStrengthLevels = ['ضعیف', 'متوسط', 'قوی', 'خیلی قوی'];
    this.usernamePatterns = {
      minLength: 2,
      maxLength: 20,
      allowedChars: /^[a-zA-Z0-9_\u0600-\u06FF]+$/
    };
    
    // آبجکت تنظیمات
    this.settings = {
      autoLoginAfterSignup: false,
      requireEmail: false,
      requirePhone: false,
      sendWelcomeMessage: true,
      validatePasswordStrength: true
    };
  }

  // متد async برای بارگذاری کاربران
  async loadUsers() {
    try {
      if (this.debugMode) {
        console.log('🔍 بارگذاری کاربران برای ثبت‌نام...');
        console.time('loadUsers');
      }

      let users = JSON.parse(localStorage.getItem("users")) || [];
      
      // تبدیل به کلاس‌ها
      this.users = users.map(userData => new SignupUser(
        userData.id,
        userData.username,
        userData.password,
        userData.created_acc,
        userData.role
      ));

      if (this.debugMode) {
        console.log(`✅ ${this.users.length} کاربر بارگذاری شد`);
        console.timeEnd('loadUsers');
      }

      return true;
    } catch (error) {
      console.error('❌ خطا در بارگذاری کاربران:', error);
      return false;
    }
  }

  // متد برای اعتبارسنجی نام کاربری
  validateUsername(username) {
    const errors = [];
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      errors.push('نام کاربری نمی‌تواند خالی باشد');
      return { isValid: false, errors, strength: 0 };
    }

    if (trimmedUsername.length < this.usernamePatterns.minLength) {
      errors.push(`نام کاربری باید حداقل ${this.usernamePatterns.minLength} کاراکتر باشد`);
    }

    if (trimmedUsername.length > this.usernamePatterns.maxLength) {
      errors.push(`نام کاربری نمی‌تواند بیشتر از ${this.usernamePatterns.maxLength} کاراکتر باشد`);
    }

    if (!this.usernamePatterns.allowedChars.test(trimmedUsername)) {
      errors.push('نام کاربری فقط می‌تواند شامل حروف، اعداد، خط زیر و حروف فارسی باشد');
    }

    if (this.reservedUsernames.includes(trimmedUsername.toLowerCase())) {
      errors.push('این نام کاربری رزرو شده است');
    }

    if (this.users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      errors.push('این نام کاربری قبلاً ثبت شده است');
    }

    // محاسبه قدرت نام کاربری
    let strength = 0;
    if (trimmedUsername.length >= 4) strength += 1;
    if (/[0-9]/.test(trimmedUsername)) strength += 1;
    if (/[a-zA-Z]/.test(trimmedUsername)) strength += 1;
    if (/[\u0600-\u06FF]/.test(trimmedUsername)) strength += 1;
    if (trimmedUsername.length >= 8) strength += 1;

    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.min(strength, 5)
    };
  }

  // متد برای اعتبارسنجی رمز عبور
  validatePassword(password, confirmPassword) {
    const errors = [];
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      errors.push('رمز عبور نمی‌تواند خالی باشد');
      return { isValid: false, errors, strength: 0 };
    }

    if (trimmedPassword.length < this.minPasswordLength) {
      errors.push(`رمز عبور باید حداقل ${this.minPasswordLength} کاراکتر باشد`);
    }

    if (trimmedPassword !== trimmedConfirm) {
      errors.push('رمز عبور و تایید آن یکسان نیست');
    }

    // محاسبه قدرت رمز عبور
    let strength = 0;
    if (trimmedPassword.length >= 6) strength += 1;
    if (/[a-z]/.test(trimmedPassword)) strength += 1;
    if (/[A-Z]/.test(trimmedPassword)) strength += 1;
    if (/[0-9]/.test(trimmedPassword)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(trimmedPassword)) strength += 1;
    if (trimmedPassword.length >= 10) strength += 1;

    const strengthLevel = this.passwordStrengthLevels[Math.min(Math.floor(strength / 2), 3)];

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      strengthLevel
    };
  }

  // متد برای اعتبارسنجی کامل فرم
  validateForm(formData) {
    this.validationErrors = [];
    
    const usernameValidation = this.validateUsername(formData.username);
    const passwordValidation = this.validatePassword(formData.password, formData.confirm);

    if (!usernameValidation.isValid) {
      this.validationErrors.push(...usernameValidation.errors);
    }

    if (!passwordValidation.isValid) {
      this.validationErrors.push(...passwordValidation.errors);
    }

    return {
      isValid: this.validationErrors.length === 0,
      errors: this.validationErrors,
      usernameStrength: usernameValidation.strength,
      passwordStrength: passwordValidation.strength,
      passwordStrengthLevel: passwordValidation.strengthLevel
    };
  }

  // متد برای ایجاد کاربر جدید
  createUser(formData) {
    const newUser = new SignupUser(
      Date.now(),
      formData.username.trim(),
      formData.password.trim(),
      new Date().toISOString(),
      'user'
    );

    return newUser;
  }

  // متد برای ذخیره کاربر
  saveUser(user) {
    try {
      this.users.push(user);
      
      // به‌روزرسانی LocalStorage
      const usersData = this.users.map(u => ({
        id: u.id,
        username: u.username,
        password: u.password,
        created_acc: u.created_acc,
        role: u.role
      }));
      
      localStorage.setItem("users", JSON.stringify(usersData));
      
      if (this.debugMode) {
        console.log(`✅ کاربر جدید ${user.username} ایجاد شد`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ خطا در ذخیره کاربر:', error);
      return false;
    }
  }

  // متد async برای ثبت‌نام
  async signup(formData) {
    try {
      // بارگذاری کاربران اگر هنوز بارگذاری نشده
      if (this.users.length === 0) {
        await this.loadUsers();
      }

      // اعتبارسنجی فرم
      const validation = this.validateForm(formData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
      }

      // ایجاد کاربر جدید
      const newUser = this.createUser(formData);
      
      // ذخیره کاربر
      if (this.saveUser(newUser)) {
        this.successMessages.push(`کاربر ${newUser.username} با موفقیت ایجاد شد`);
        
        if (this.debugMode) {
          console.log(`🎉 ثبت‌نام موفق برای ${newUser.username}`);
          console.log(`📊 قدرت نام کاربری: ${validation.usernameStrength}/5`);
          console.log(`🔒 قدرت رمز عبور: ${validation.passwordStrengthLevel}`);
        }

        // نمایش پیام موفقیت
        alert("ثبت‌نام با موفقیت انجام شد");
        
        // هدایت به صفحه ورود
        window.location.href = "Login.html";
        
        return { success: true, user: newUser };
      } else {
        throw new Error('خطا در ذخیره کاربر');
      }
    } catch (error) {
      if (this.debugMode) {
        console.error('❌ خطا در ثبت‌نام:', error);
      }
      
      alert(error.message || "مشکلی در ثبت‌نام رخ داد.");
      return { success: false, error: error.message };
    }
  }

  // متد برای راه‌اندازی
  async initialize() {
    await this.loadUsers();
    
    if (this.debugMode) {
      console.log('🚀 SignupManager راه‌اندازی شد');
    }
  }
}

// کلاس کاربر ثبت‌نام
class SignupUser {
  constructor(id, username, password, created_acc, role = 'user') {
    this.id = id;
    this.username = username;
    this.password = password;
    this.created_acc = created_acc;
    this.role = role;
  }

  isAdmin() {
    return this.role === 'admin';
  }

  getAccountAge() {
    const created = new Date(this.created_acc);
    const now = new Date();
    const diffTime = now - created;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  getFormattedCreationDate() {
    const date = new Date(this.created_acc);
    return date.toLocaleString('fa-IR');
  }

  // متد برای بررسی امنیت رمز عبور
  isPasswordSecure() {
    return this.password.length >= 8 && 
           /[a-z]/.test(this.password) && 
           /[A-Z]/.test(this.password) && 
           /[0-9]/.test(this.password);
  }
}

// ایجاد نمونه از کلاس اصلی
const signupManager = new SignupManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  signupManager.initialize();
  
  // تنظیم event listeners
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");
  const signupBtn = document.getElementById("signupBtn");

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const formData = {
        username: usernameInput?.value || '',
        password: passwordInput?.value || '',
        confirm: confirmInput?.value || ''
      };

      await signupManager.signup(formData);
    });
  }
});

// متدهای global برای backward compatibility
function getPersianDate() {
  const now = new Date();
  return now.toLocaleString("fa-IR", { 
    dateStyle: "short", 
    timeStyle: "short" 
  });
}



