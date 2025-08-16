
// کلاس مدیریت پنل کاربری
class UserPanelManager {
  constructor() {
    this.currentUser = null;
  }

  async loadUserData() {
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

    return true;
  }

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

  async initialize() {
    const success = await this.loadUserData();
    if (success) {
      this.displayWelcomeInfo();
    } else {
      window.location.href = "Login.html";
    }
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
}

// ایجاد نمونه از کلاس اصلی
const userPanelManager = new UserPanelManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  userPanelManager.initialize();
});

// متدهای global برای backward compatibility
function logout() {
  localStorage.removeItem("loggedInUser");
  return true;
}
