// async function check_loging() {

//   const username = document.getElementById("username").value.trim();
//   const password = document.getElementById("password").value.trim();

//   if (!username || !password) {
//     alert("لطفاً نام کاربری و رمز عبور را وارد کنید.");
//     return;
//   }

//   try {
// const response = await fetch('/Backend/users.json');
//     const users = await response.json();

//     const user = users.find(u => u.username === username && u.password === password);

//     if (user) {
//       localStorage.setItem('loggedInUser', JSON.stringify({
//         id: user.id,
//         username: user.username,
//         created_acc: user.created_acc
//       }));

//       window.location.href = 'panel.html';
//     } else {
//       alert("نام کاربری یا رمز اشتباه است.");
//     }
//   } catch (error) {
//     console.error("خطا در دریافت فایل کاربران:", error);
//     alert("مشکلی در ورود به سیستم رخ داد.");
//   }
// }




document.addEventListener("DOMContentLoaded", () => {
  // اگر ادمین تو localStorage نیست بسازش
  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.find(u => u.username === "admin")) {
    users.push({
      id: Date.now(),
      username: "admin",
      password: "admin123",
      created_acc: new Date().toLocaleString(),
      role: "admin"
    });
    localStorage.setItem("users", JSON.stringify(users));
  }
});

async function check_loging() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("لطفاً نام کاربری و رمز عبور را وارد کنید.");
    return;
  }

  try {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // بررسی ورود
    const user = users.find(u => u.username === username && u.password === password);

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
    } else {
      alert("نام کاربری یا رمز عبور اشتباه است.");
    }
  } catch (error) {
    console.error("خطا در ورود:", error);
    alert("مشکلی در ورود به سیستم رخ داد.");
  }
}





/*













*/

