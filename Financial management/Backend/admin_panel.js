document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedIn || loggedIn.role !== "admin") {
    alert("دسترسی غیرمجاز");
    window.location.href = "Login.html";
    return;
  }

  showUsers();
});

function showUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const content = document.getElementById("contentArea");

  let html = `
    <h2>لیست کاربران</h2>
    <table border="1" width="100%" style="border-collapse: collapse; text-align: center;">
      <thead>
        <tr>
          <th>آی‌دی</th>
          <th>نام کاربری</th>
          <th>تاریخ ساخت</th>
          <th>حذف</th>
        </tr>
      </thead>
      <tbody>
  `;

  users.forEach(user => {
    html += `
      <tr>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.created_acc}</td>
        <td><button onclick="deleteUser(${user.id})">❌</button></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  content.innerHTML = html;
}

function deleteUser(id) {
  if (!confirm("آیا مطمئنید که می‌خواهید این کاربر را حذف کنید؟")) return;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.id !== id);

  localStorage.setItem("users", JSON.stringify(users));

  // اگر کاربر حذف شده، اگر لاگین شده بود حذفش کن
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedIn && loggedIn.id === id) {
    logout();
  } else {
    showUsers();
  }
}

function showTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const content = document.getElementById("contentArea");

  let html = `
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
  `;

  transactions.forEach(t => {
    const username = users.find(u => u.id === t.user_id)?.username || "نامشخص";
    html += `
      <tr>
        <td>${t.id}</td>
        <td>${username}</td>
        <td>${t.title}</td>
        <td>${t.amount}</td>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td><button onclick="deleteTransaction(${t.id})">❌</button></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  content.innerHTML = html;
}

function deleteTransaction(id) {
  if (!confirm("آیا مطمئنید که می‌خواهید این تراکنش را حذف کنید؟")) return;

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  showTransactions();
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "Login.html";
}

