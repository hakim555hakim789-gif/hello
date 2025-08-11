// کلاس مدیریت احراز هویت
class AuthManager {
  constructor() {
    this.users = [];
    this.debugMode = false;
    this.maxLoginAttempts = 3;
    this.lockoutDuration = 300000; // 5 دقیقه
    
    // متغیرهای مختلف
    this.currentUser = null;
    this.loginAttempts = new Map();
    this.sessions = new Map();
    
    // آرایه‌های کمکی
    this.validRoles = ['user', 'admin'];
    this.passwordRequirements = {
      minLength: 3,
      requireSpecial: false,
      requireNumber: false
    };
    
    // آبجکت تنظیمات
    this.settings = {
      autoLogout: true,
      sessionTimeout: 3600000, // 1 ساعت
      rememberMe: false,
      secureCookies: false
    };
  }

  // متد async برای بارگذاری کاربران
  async loadUsers() {
    try {
      if (this.debugMode) {
        console.log('🔍 بارگذاری کاربران...');
        console.time('loadUsers');
      }

      let users = JSON.parse(localStorage.getItem("users")) || [];
      
      // اطمینان از وجود کاربر ادمین
      if (!users.find(u => u.username === "admin")) {
        const adminUser = {
          id: Date.now(),
          username: "admin",
          password: "admin123",
          created_acc: new Date().toISOString(),
          role: "admin"
        };
        
        users.push(adminUser);
        localStorage.setItem("users", JSON.stringify(users));
        
        if (this.debugMode) {
          console.log('👑 کاربر ادمین ایجاد شد');
        }
      }

      // تبدیل به کلاس‌ها
      this.users = users.map(userData => new User(
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

  // متد برای بررسی اعتبار ورودی
  validateInput(username, password) {
    const errors = [];
    
    if (!username || username.trim().length === 0) {
      errors.push('نام کاربری نمی‌تواند خالی باشد');
    }
    
    if (!password || password.trim().length === 0) {
      errors.push('رمز عبور نمی‌تواند خالی باشد');
    }
    
    if (username && username.trim().length < 2) {
      errors.push('نام کاربری باید حداقل 2 کاراکتر باشد');
    }
    
    if (password && password.trim().length < this.passwordRequirements.minLength) {
      errors.push(`رمز عبور باید حداقل ${this.passwordRequirements.minLength} کاراکتر باشد`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // متد برای بررسی قفل شدن حساب
  isAccountLocked(username) {
    const userAttempts = this.loginAttempts.get(username);
    if (!userAttempts) return false;
    
    const { attempts, lastAttempt } = userAttempts;
    const timeSinceLastAttempt = Date.now() - lastAttempt;
    
    if (attempts >= this.maxLoginAttempts && timeSinceLastAttempt < this.lockoutDuration) {
      return true;
    }
    
    // باز کردن قفل اگر زمان قفل تمام شده
    if (timeSinceLastAttempt >= this.lockoutDuration) {
      this.loginAttempts.delete(username);
    }
    
    return false;
  }

  // متد برای ثبت تلاش ورود
  recordLoginAttempt(username, success) {
    if (success) {
      this.loginAttempts.delete(username);
      return;
    }
    
    const currentAttempts = this.loginAttempts.get(username) || { attempts: 0, lastAttempt: 0 };
    currentAttempts.attempts += 1;
    currentAttempts.lastAttempt = Date.now();
    
    this.loginAttempts.set(username, currentAttempts);
    
    if (this.debugMode) {
      console.log(`⚠️ تلاش ورود ناموفق برای ${username}: ${currentAttempts.attempts}/${this.maxLoginAttempts}`);
    }
  }

  // متد برای ایجاد جلسه
  createSession(user) {
    const sessionId = this.generateSessionId();
    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.settings.sessionTimeout
    };
    
    this.sessions.set(sessionId, session);
    
    if (this.debugMode) {
      console.log(`🔐 جلسه جدید برای ${user.username} ایجاد شد`);
    }
    
    return sessionId;
  }

  // متد برای تولید ID جلسه
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // متد برای بررسی اعتبار جلسه
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session;
  }

  // متد async برای ورود
  async login(username, password) {
    try {
      // بارگذاری کاربران اگر هنوز بارگذاری نشده
      if (this.users.length === 0) {
        await this.loadUsers();
      }

      // اعتبارسنجی ورودی
      const validation = this.validateInput(username, password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
      }

      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      // بررسی قفل شدن حساب
      if (this.isAccountLocked(trimmedUsername)) {
        const remainingTime = Math.ceil((this.lockoutDuration - (Date.now() - this.loginAttempts.get(trimmedUsername).lastAttempt)) / 1000);
        throw new Error(`حساب شما قفل شده است. ${remainingTime} ثانیه دیگر تلاش کنید.`);
      }

      // جستجوی کاربر
      const user = this.users.find(u => 
        u.username === trimmedUsername && u.password === trimmedPassword
      );

      if (user) {
        // ورود موفق
        this.recordLoginAttempt(trimmedUsername, true);
        
        // ایجاد جلسه
        const sessionId = this.createSession(user);
        
        // ذخیره در LocalStorage
        const userData = {
          id: user.id,
          username: user.username,
          created_acc: user.created_acc,
          role: user.role,
          sessionId: sessionId
        };
        
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        this.currentUser = user;

        if (this.debugMode) {
          console.log(`✅ ورود موفق برای ${user.username} (نقش: ${user.role})`);
        }

        // هدایت بر اساس نقش
        if (user.isAdmin()) {
          window.location.href = "admin_panel.html";
        } else {
          window.location.href = "panel.html";
        }
        
        return { success: true, user: userData };
      } else {
        // ورود ناموفق
        this.recordLoginAttempt(trimmedUsername, false);
        
        const remainingAttempts = this.maxLoginAttempts - (this.loginAttempts.get(trimmedUsername)?.attempts || 0);
        
        if (remainingAttempts <= 0) {
          throw new Error(`حساب شما قفل شده است. ${Math.ceil(this.lockoutDuration / 1000)} ثانیه دیگر تلاش کنید.`);
        } else {
          throw new Error(`نام کاربری یا رمز عبور اشتباه است. ${remainingAttempts} تلاش باقی مانده.`);
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.error('❌ خطا در ورود:', error);
      }
      
      alert(error.message || "مشکلی در ورود به سیستم رخ داد.");
      return { success: false, error: error.message };
    }
  }

  // متد برای خروج
  logout() {
    if (this.currentUser) {
      const sessionId = JSON.parse(localStorage.getItem('loggedInUser'))?.sessionId;
      if (sessionId) {
        this.sessions.delete(sessionId);
      }
      
      if (this.debugMode) {
        console.log(`🚪 خروج کاربر ${this.currentUser.username}`);
      }
    }
    
    localStorage.removeItem('loggedInUser');
    this.currentUser = null;
  }

  // متد برای راه‌اندازی
  async initialize() {
    await this.loadUsers();
    
    if (this.debugMode) {
      console.log('🚀 AuthManager راه‌اندازی شد');
    }
  }
}

// کلاس کاربر
class User {
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
}

// ایجاد نمونه از کلاس اصلی
const authManager = new AuthManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  authManager.initialize();
});

// متد global برای backward compatibility
async function check_loging() {
  const username = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;
  
  if (!username || !password) {
    alert("لطفاً نام کاربری و رمز عبور را وارد کنید.");
    return;
  }
  
  await authManager.login(username, password);
}





/*













*/



/*













*/

