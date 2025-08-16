// کلاس مدیریت ثبت‌نام
class SignupManager {
  constructor() {
    this.users = [];
  }

  async loadUsers() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    this.users = users;
    return true;
  }

  async signup(formData) {
    if (this.users.find(u => u.username === formData.username)) {
      alert("این نام کاربری قبلاً ثبت شده است");
      return { success: false };
    }

    const newUser = {
      id: Date.now(),
      username: formData.username.trim(),
      password: formData.password.trim(),
      created_acc: new Date().toISOString(),
      role: "user"
    };

    this.users.push(newUser);
    localStorage.setItem("users", JSON.stringify(this.users));

    alert("ثبت‌نام با موفقیت انجام شد");
    window.location.href = "Login.html";
    
    return { success: true, user: newUser };
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
}

// ایجاد نمونه از کلاس اصلی
const signupManager = new SignupManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener("DOMContentLoaded", () => {
  signupManager.loadUsers();
  
  // تنظیم event listeners
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");
  const signupBtn = document.getElementById("signupBtn");

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const username = usernameInput?.value || '';
      const password = passwordInput?.value || '';
      const confirm = confirmInput?.value || '';

      if (!username || !password || !confirm) {
        alert("همه فیلدها را پر کنید");
        return;
      }

      if (password !== confirm) {
        alert("رمز عبور و تایید آن یکسان نیست");
        return;
      }

      if (username.toLowerCase() === "admin") {
        alert("شما نمی‌توانید با این نام کاربری ثبت‌نام کنید");
        return;
      }

      const formData = { username, password, confirm };
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



