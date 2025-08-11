// کلاس مدیریت احراز هویت
class AuthManager {
  constructor() {
    this.users = [];
  }

  async loadUsers() {
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
    }

    this.users = users;
    return true;
  }

  async login(username, password) {
    const user = this.users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify({
        id: user.id,
        username: user.username,
        created_acc: user.created_acc,
        role: user.role || "user"
      }));

      if (user.role === "admin") {
        window.location.href = "admin_panel.html";
      } else {
        window.location.href = "panel.html";
      }
      
      return { success: true, user };
    } else {
      alert("نام کاربری یا رمز عبور اشتباه است.");
      return { success: false };
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
}

// ایجاد نمونه از کلاس اصلی
const authManager = new AuthManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  authManager.loadUsers();
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

