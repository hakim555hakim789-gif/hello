
// کلاس مدیریت پنل کاربری
class UserPanelManager {
  constructor() {
    this.currentUser = null;
    this.debugMode = false;
    this.lastActivity = Date.now();
    
    // متغیرهای مختلف
    this.autoLogoutTimeout = null;
    this.activityCheckInterval = null;
    this.maxInactivityTime = 1800000; // 30 دقیقه
    
    // آرایه‌های کمکی
    this.navigationItems = ['dashboard', 'profile', 'settings', 'logout'];
    this.userStats = {
      totalTransactions: 0,
      lastLogin: null,
      accountAge: 0,
      profileCompleteness: 0
    };
    
    // آبجکت تنظیمات
    this.settings = {
      showNotifications: true,
      autoRefresh: false,
      theme: 'dark',
      language: 'fa-IR',
      timezone: 'Asia/Tehran'
    };
  }

  // متد async برای بارگذاری اطلاعات کاربر
  async loadUserData() {
    try {
      if (this.debugMode) {
        console.log('🔍 بارگذاری اطلاعات کاربر...');
        console.time('loadUserData');
      }

      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        throw new Error('کاربر وارد نشده است');
      }

      this.currentUser = new PanelUser(
        user.id,
        user.username,
        user.created_acc,
        user.role
      );

      // به‌روزرسانی آمار کاربر
      this.updateUserStats();

      if (this.debugMode) {
        console.log(`✅ اطلاعات کاربر ${this.currentUser.username} بارگذاری شد`);
        console.timeEnd('loadUserData');
      }

      return true;
    } catch (error) {
      console.error('❌ خطا در بارگذاری اطلاعات کاربر:', error);
      return false;
    }
  }

  // متد برای به‌روزرسانی آمار کاربر
  updateUserStats() {
    if (!this.currentUser) return;

    this.userStats.accountAge = this.currentUser.getAccountAge();
    this.userStats.lastLogin = new Date().toISOString();
    
    // محاسبه تکمیل پروفایل (مثال ساده)
    let completeness = 0;
    if (this.currentUser.username) completeness += 25;
    if (this.currentUser.created_acc) completeness += 25;
    if (this.currentUser.role) completeness += 25;
    completeness += 25; // همیشه 100% برای سادگی
    
    this.userStats.profileCompleteness = completeness;
  }

  // متد برای نمایش اطلاعات خوش‌آمدگویی
  displayWelcomeInfo() {
    const welcomeTitle = document.getElementById("welcomeTitle");
    const accountDate = document.getElementById("accountDate");

    if (welcomeTitle) {
      welcomeTitle.textContent = `خوش آمدید، ${this.currentUser.username}`;
    }

    if (accountDate) {
      const createdDate = new Date(this.currentUser.created_acc);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = today - createdDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // استفاده از Intl برای تاریخ فارسی
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedPersianDate = formatter.format(createdDate);

      accountDate.textContent = `🗓️ تاریخ ساخت حساب: ${formattedPersianDate} (${diffDays} روز پیش)`;
    }
  }

  // متد برای شروع نظارت بر فعالیت
  startActivityMonitoring() {
    // بررسی فعالیت هر 5 دقیقه
    this.activityCheckInterval = setInterval(() => {
      this.checkUserActivity();
    }, 300000); // 5 دقیقه

    // تنظیم timeout برای خروج خودکار
    this.resetAutoLogoutTimeout();

    // اضافه کردن event listeners برای فعالیت
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.resetAutoLogoutTimeout(), true);
    });
  }

  // متد برای بررسی فعالیت کاربر
  checkUserActivity() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    if (timeSinceLastActivity > this.maxInactivityTime) {
      if (this.debugMode) {
        console.log('⏰ کاربر غیرفعال - خروج خودکار');
      }
      this.logout();
    }
  }

  // متد برای بازنشانی timeout خروج خودکار
  resetAutoLogoutTimeout() {
    this.lastActivity = Date.now();
    
    if (this.autoLogoutTimeout) {
      clearTimeout(this.autoLogoutTimeout);
    }
    
    this.autoLogoutTimeout = setTimeout(() => {
      if (this.debugMode) {
        console.log('⏰ timeout خروج خودکار فعال شد');
      }
    }, this.maxInactivityTime);
  }

  // متد برای نمایش آمار کاربر
  displayUserStats() {
    const statsContainer = document.querySelector('.section');
    if (!statsContainer) return;

    const statsHTML = `
      <div class="user-stats">
        <h3>📊 آمار حساب کاربری</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">سن حساب:</span>
            <span class="stat-value">${this.userStats.accountAge} روز</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">تکمیل پروفایل:</span>
            <span class="stat-value">${this.userStats.profileCompleteness}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">آخرین ورود:</span>
            <span class="stat-value">${new Date(this.userStats.lastLogin).toLocaleString('fa-IR')}</span>
          </div>
        </div>
      </div>
    `;

    // اضافه کردن آمار به انتهای بخش
    const existingStats = statsContainer.querySelector('.user-stats');
    if (existingStats) {
      existingStats.remove();
    }
    statsContainer.insertAdjacentHTML('beforeend', statsHTML);
  }

  // متد برای مدیریت خروج
  logout() {
    try {
      // پاک کردن interval ها
      if (this.activityCheckInterval) {
        clearInterval(this.activityCheckInterval);
      }
      if (this.autoLogoutTimeout) {
        clearTimeout(this.autoLogoutTimeout);
      }

      // حذف event listeners
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      activityEvents.forEach(event => {
        document.removeEventListener(event, () => this.resetAutoLogoutTimeout(), true);
      });

      // حذف از LocalStorage
      localStorage.removeItem("loggedInUser");

      if (this.debugMode) {
        console.log(`🚪 خروج کاربر ${this.currentUser?.username || 'نامشخص'}`);
      }

      return true;
    } catch (error) {
      console.error('❌ خطا در خروج:', error);
      return false;
    }
  }

  // متد برای راه‌اندازی
  async initialize() {
    const success = await this.loadUserData();
    if (success) {
      this.displayWelcomeInfo();
      this.displayUserStats();
      this.startActivityMonitoring();
      
      if (this.debugMode) {
        console.log('🚀 UserPanelManager راه‌اندازی شد');
      }
    } else {
      // هدایت به صفحه ورود در صورت عدم موفقیت
      window.location.href = "Login.html";
    }
  }

  // متد برای به‌روزرسانی تنظیمات
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // ذخیره در LocalStorage
    localStorage.setItem('userPanelSettings', JSON.stringify(this.settings));
    
    if (this.debugMode) {
      console.log('⚙️ تنظیمات به‌روزرسانی شد:', this.settings);
    }
  }

  // متد برای دریافت تنظیمات
  getSettings() {
    return { ...this.settings };
  }
}

// کلاس کاربر پنل
class PanelUser {
  constructor(id, username, created_acc, role = 'user') {
    this.id = id;
    this.username = username;
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

  // متد برای بررسی وضعیت حساب
  getAccountStatus() {
    const age = this.getAccountAge();
    
    if (age < 7) return 'جدید';
    if (age < 30) return 'فعال';
    if (age < 365) return 'قدیمی';
    return 'بسیار قدیمی';
  }

  // متد برای محاسبه امتیاز کاربر
  calculateUserScore() {
    let score = 0;
    
    // امتیاز بر اساس سن حساب
    const age = this.getAccountAge();
    if (age >= 365) score += 100;
    else if (age >= 30) score += 50;
    else if (age >= 7) score += 25;
    else score += 10;
    
    // امتیاز بر اساس نقش
    if (this.isAdmin()) score += 50;
    
    return Math.min(score, 200);
  }
}

// ایجاد نمونه از کلاس اصلی
const userPanelManager = new UserPanelManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  userPanelManager.initialize();
});

// متدهای global برای backward compatibility
function logout() {
  return userPanelManager.logout();
}
