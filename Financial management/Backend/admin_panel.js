// کلاس پایه برای کاربر
class AdminUser {
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

  getFormattedCreationDate() {
    const date = new Date(this.created_acc);
    return date.toLocaleString('fa-IR');
  }

  getAccountAge() {
    const created = new Date(this.created_acc);
    const now = new Date();
    const diffTime = now - created;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

// کلاس مدیریت کاربران
class UserManager {
  constructor() {
    this.users = [];
    this.transactions = [];
    this.debugMode = false;
  }

  // اضافه کردن کاربر
  addUser(user) {
    if (user instanceof AdminUser) {
      this.users.push(user);
      return true;
    }
    return false;
  }

  // جستجوی کاربر بر اساس ID
  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  // جستجوی کاربر بر اساس نام کاربری
  findUserByUsername(username) {
    return this.users.find(u => u.username === username);
  }

  // حذف کاربر
  removeUser(id) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // به‌روزرسانی کاربر
  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (user) {
      Object.assign(user, updates);
      return true;
    }
    return false;
  }

  // دریافت همه کاربران
  getAllUsers() {
    return [...this.users]; // کپی برای جلوگیری از تغییر مستقیم
  }

  // بررسی تکراری بودن نام کاربری
  isUsernameDuplicate(username, excludeId = null) {
    return this.users.some(u => 
      u.username === username && u.id !== excludeId
    );
  }
}

// کلاس مدیریت تراکنش‌ها
class AdminTransactionManager {
  constructor() {
    this.transactions = [];
  }

  // اضافه کردن تراکنش
  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  // دریافت همه تراکنش‌ها
  getAllTransactions() {
    return [...this.transactions];
  }

  // فیلتر تراکنش‌ها بر اساس کاربر
  getTransactionsByUser(userId) {
    return this.transactions.filter(t => t.user_id === userId);
  }

  // حذف تراکنش
  removeTransaction(id) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  // مرتب‌سازی تراکنش‌ها بر اساس تاریخ
  getSortedTransactions() {
    return this.transactions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

// کلاس اصلی پنل ادمین
class AdminPanel {
  constructor() {
    this.userManager = new UserManager();
    this.transactionManager = new AdminTransactionManager();
    this.currentAdmin = null;
    this.debugMode = false;
    
    // متغیرهای مختلف
    this.maxUsers = 1000;
    this.maxTransactions = 5000;
    this.autoRefreshInterval = null;
    
    // آرایه‌های کمکی
    this.userRoles = ['user', 'admin'];
    this.transactionTypes = ['درآمد', 'هزینه', 'خرید', 'فروش', 'واریز', 'برداشت'];
    
    // آبجکت تنظیمات
    this.settings = {
      showConfirmations: true,
      autoRefresh: false,
      refreshInterval: 30000, // 30 ثانیه
      maxDisplayItems: 100
    };
  }

  // متد async برای بارگذاری داده‌ها
  async seedDataIfNeeded() {
    try {
      if (this.debugMode) {
        console.log('🔍 شروع بارگذاری داده‌های اولیه...');
        console.time('seedData');
      }

      // بارگذاری کاربران
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (!Array.isArray(users) || users.length === 0) {
        try {
          const res = await fetch("/Backend/users.json");
          if (res.ok) {
            users = await res.json();
          } else {
            users = [];
          }
        } catch (_) {
          users = [];
        }
      }

      // اطمینان از وجود کاربر ادمین
      if (!users.find(u => u.username === "admin")) {
        users.push({
          id: Date.now(),
          username: "admin",
          password: "admin123",
          created_acc: new Date().toISOString(),
          role: "admin"
        });
      }

      // تبدیل به کلاس‌ها
      users.forEach(userData => {
        const user = new AdminUser(
          userData.id,
          userData.username,
          userData.password,
          userData.created_acc,
          userData.role
        );
        this.userManager.addUser(user);
      });

      localStorage.setItem("users", JSON.stringify(users));

      // بارگذاری تراکنش‌ها
      let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
      if (!Array.isArray(transactions) || transactions.length === 0) {
        try {
          const resT = await fetch("/Backend/transactions.json");
          if (resT.ok) {
            transactions = await resT.json();
          } else {
            transactions = [];
          }
        } catch (_) {
          transactions = [];
        }
        localStorage.setItem("transactions", JSON.stringify(transactions));
      }

      // اضافه کردن تراکنش‌ها
      transactions.forEach(t => {
        this.transactionManager.addTransaction(t);
      });

      if (this.debugMode) {
        console.log(`✅ ${this.userManager.users.length} کاربر و ${this.transactionManager.transactions.length} تراکنش بارگذاری شد`);
        console.timeEnd('seedData');
      }

    } catch (e) {
      console.error("❌ خطا در بارگذاری داده‌های اولیه:", e);
    }
  }

  // متد برای نمایش کاربران
  showUsers() {
    const content = document.getElementById("contentArea");
    if (!content) return;

    const users = this.userManager.getAllUsers();

    // استفاده از map برای تولید HTML
    const tableRows = users.map(user => `
      <tr>
        <td><button onclick="adminPanel.showUserDetails(${user.id})">ℹ️</button></td>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.getFormattedCreationDate()}</td>
        <td><button onclick="adminPanel.deleteUser(${user.id})">❌</button></td>
      </tr>
    `).join('');

    const html = `
      <h2>لیست کاربران</h2>
      <table border="1" width="100%" style="border-collapse: collapse; text-align: center;">
        <thead>
          <tr>
            <th>اطلاعات بیشتر</th>
            <th>آی‌دی</th>
            <th>نام کاربری</th>
            <th>تاریخ ساخت</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    content.innerHTML = html;
  }

  // متد برای نمایش جزئیات کاربر
  showUserDetails(userId) {
    const user = this.userManager.findUserById(userId);
    if (!user) {
      alert("کاربر پیدا نشد");
      this.showUsers();
      return;
    }

    const userTransactions = this.transactionManager.getTransactionsByUser(userId);
    const content = document.getElementById("contentArea");

    // استفاده از map برای تراکنش‌ها
    const transactionRows = userTransactions.length === 0 
      ? '<tr><td colspan="6">هیچ تراکنشی برای این کاربر ثبت نشده است</td></tr>'
      : userTransactions.map(t => `
          <tr>
            <td>${t.id}</td>
            <td>${t.title}</td>
            <td>${t.amount}</td>
            <td>${t.date}</td>
            <td>${t.type}</td>
            <td><button onclick="adminPanel.deleteTransactionFromUser(${t.id}, ${user.id})">❌</button></td>
          </tr>
        `).join('');

    const html = `
      <button onclick="adminPanel.showUsers()" style="margin-bottom: 15px;">⬅️ بازگشت</button>
      <h2>جزئیات کاربر</h2>

      <div style="display:flex; gap:20px; flex-wrap: wrap;">
        <div style="min-width:280px;">
          <label>آی‌دی:</label>
          <div style="margin:6px 0 12px;">${user.id}</div>

          <label for="edit_username">نام کاربری:</label>
          <input id="edit_username" type="text" value="${user.username}" style="width:100%; margin-bottom:12px;" />

          <label for="edit_password">رمز عبور:</label>
          <input id="edit_password" type="text" value="${user.password || ""}" style="width:100%; margin-bottom:12px;" />

          <label>تاریخ ساخت:</label>
          <div style="margin:6px 0 12px;">${user.getFormattedCreationDate()}</div>

          <button onclick="adminPanel.updateUserDetails(${user.id})" style="margin-top:8px;">💾 ذخیره تغییرات</button>
        </div>

        <div style="flex:1; min-width:380px;">
          <h3>تراکنش‌های کاربر</h3>
          <table border="1" width="100%" style="border-collapse: collapse; text-align:center;">
            <thead>
              <tr>
                <th>آی‌دی</th>
                <th>عنوان</th>
                <th>مبلغ</th>
                <th>تاریخ</th>
                <th>نوع</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    content.innerHTML = html;
  }

  // متد برای به‌روزرسانی جزئیات کاربر
  updateUserDetails(userId) {
    const usernameEl = document.getElementById("edit_username");
    const passwordEl = document.getElementById("edit_password");

    if (!usernameEl || !passwordEl) return;

    const newUsername = usernameEl.value.trim();
    const newPassword = passwordEl.value.trim();

    if (!newUsername) {
      alert("نام کاربری نمی‌تواند خالی باشد");
      return;
    }

    // بررسی تکراری بودن نام کاربری
    if (this.userManager.isUsernameDuplicate(newUsername, userId)) {
      alert("نام کاربری تکراری است");
      return;
    }

    // به‌روزرسانی کاربر
    const updates = { username: newUsername };
    if (newPassword) {
      updates.password = newPassword;
    }

    if (this.userManager.updateUser(userId, updates)) {
      // به‌روزرسانی LocalStorage
      const users = this.userManager.getAllUsers();
      localStorage.setItem("users", JSON.stringify(users));

      // همگام‌سازی کاربر وارد شده
      const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedIn && loggedIn.id === userId) {
        loggedIn.username = newUsername;
        localStorage.setItem("loggedInUser", JSON.stringify(loggedIn));
      }

      alert("تغییرات ذخیره شد");
      this.showUserDetails(userId);
    }
  }

  // متد برای حذف کاربر
  deleteUser(id) {
    if (!this.settings.showConfirmations || 
        confirm("آیا مطمئنید که می‌خواهید این کاربر را حذف کنید؟")) {
      
      if (this.userManager.removeUser(id)) {
        // به‌روزرسانی LocalStorage
        const users = this.userManager.getAllUsers();
        localStorage.setItem("users", JSON.stringify(users));

        const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
        if (loggedIn && loggedIn.id === id) {
          this.logout();
        } else {
          this.showUsers();
        }
      }
    }
  }

  // متد برای نمایش تراکنش‌ها
  showTransactions() {
    const transactions = this.transactionManager.getSortedTransactions();
    const users = this.userManager.getAllUsers();
    const content = document.getElementById("contentArea");

    // استفاده از map برای تولید ردیف‌ها
    const tableRows = transactions.map(t => {
      const username = users.find(u => u.id === t.user_id)?.username || "نامشخص";
      return `
        <tr>
          <td>${t.id}</td>
          <td>${username}</td>
          <td>${t.title}</td>
          <td>${t.amount}</td>
          <td>${t.date}</td>
          <td>${t.type}</td>
          <td><button onclick="adminPanel.deleteTransaction(${t.id})">❌</button></td>
        </tr>
      `;
    }).join('');

    const html = `
      <h2>لیست تراکنش‌ها</h2>
      <table border="1" width="100%" style="border-collapse: collapse; text-align: center;">
        <thead>
          <tr>
            <th>آی‌دی</th>
            <th>کاربر</th>
            <th>عنوان</th>
            <th>مبلغ</th>
            <th>تاریخ</th>
            <th>نوع</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    if (transactions.length === 0) {
      html += '<tr><td colspan="7">هیچ تراکنشی موجود نیست</td></tr>';
    }

    content.innerHTML = html;
  }

  // متد برای حذف تراکنش
  deleteTransaction(id) {
    if (!this.settings.showConfirmations || 
        confirm("آیا مطمئنید که می‌خواهید این تراکنش را حذف کنید؟")) {
      
      if (this.transactionManager.removeTransaction(id)) {
        // به‌روزرسانی LocalStorage
        const transactions = this.transactionManager.getAllTransactions();
        localStorage.setItem("transactions", JSON.stringify(transactions));
        this.showTransactions();
      }
    }
  }

  // متد برای حذف تراکنش از کاربر
  deleteTransactionFromUser(id, userId) {
    if (!this.settings.showConfirmations || 
        confirm("آیا مطمئنید که می‌خواهید این تراکنش را حذف کنید؟")) {
      
      if (this.transactionManager.removeTransaction(id)) {
        // به‌روزرسانی LocalStorage
        const transactions = this.transactionManager.getAllTransactions();
        localStorage.setItem("transactions", JSON.stringify(transactions));
        this.showUserDetails(userId);
      }
    }
  }

  // متد برای خروج
  logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "Login.html";
  }

  // متد برای راه‌اندازی
  async initialize() {
    const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedIn || loggedIn.role !== "admin") {
      alert("دسترسی غیرمجاز");
      window.location.href = "Login.html";
      return;
    }

    this.currentAdmin = new AdminUser(
      loggedIn.id,
      loggedIn.username,
      null,
      loggedIn.created_acc,
      loggedIn.role
    );

    await this.seedDataIfNeeded();
    this.showUsers();
  }
}

// ایجاد نمونه از کلاس اصلی
const adminPanel = new AdminPanel();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  adminPanel.initialize();
});

// متدهای global برای backward compatibility
function showUsers() {
  adminPanel.showUsers();
}

function showUserDetails(userId) {
  adminPanel.showUserDetails(userId);
}

function updateUserDetails(userId) {
  adminPanel.updateUserDetails(userId);
}

function deleteUser(id) {
  adminPanel.deleteUser(id);
}

function showTransactions() {
  adminPanel.showTransactions();
}

function deleteTransaction(id) {
  adminPanel.deleteTransaction(id);
}

function deleteTransactionFromUser(id, userId) {
  adminPanel.deleteTransactionFromUser(id, userId);
}

function logout() {
  adminPanel.logout();
}

