document.addEventListener("DOMContentLoaded", () => {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");
  const signupBtn = document.getElementById("signupBtn");

  signupBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();

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

    if (users.find(u => u.username === username)) {
      alert("این نام کاربری قبلاً ثبت شده است");
      return;
    }

    const newUser = {
      id: Date.now(),
      username: username,
      password: password,
      created_acc: new Date().toISOString(),
      role: "user"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("ثبت‌نام با موفقیت انجام شد");
    window.location.href = "Login.html";
  });
});

function getPersianDate() {
  const now = new Date();
  return now.toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
}



