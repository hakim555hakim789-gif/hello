


document.addEventListener("DOMContentLoaded", async () => {
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedIn || loggedIn.role !== "admin") {
    alert("دسترسی غیرمجاز");
    window.location.href = "Login.html";
    return;
  }

  await seedDataIfNeeded();
  showUsers();
});

async function seedDataIfNeeded() {
  try {
    let users = JSON.parse(localStorage.getItem("users"));
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

    // Ensure admin user exists
    if (!users.find(u => u.username === "admin")) {
      users.push({
        id: Date.now(),
        username: "admin",
        password: "admin123",
        created_acc: new Date().toLocaleString(),
        role: "admin"
      });
    }

    localStorage.setItem("users", JSON.stringify(users));

    let transactions = JSON.parse(localStorage.getItem("transactions"));
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
  } catch (e) {
    console.error("seed error", e);
  }
}

function showUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const content = document.getElementById("contentArea");

  let html = `
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
  `;

  users.forEach(user => {
    html += `
      <tr>
        <td><button onclick="showUserDetails(${user.id})">ℹ️</button></td>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.created_acc || "-"}</td>
        <td><button onclick="deleteUser(${user.id})">❌</button></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  content.innerHTML = html;
}

function showUserDetails(userId) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const content = document.getElementById("contentArea");

  const user = users.find(u => u.id === userId);
  if (!user) {
    alert("کاربر پیدا نشد");
    showUsers();
    return;
  }

  const userTransactions = transactions
    .filter(t => t.user_id === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = `
    <button onclick="showUsers()" style="margin-bottom: 15px;">⬅️ بازگشت</button>
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
        <div style="margin:6px 0 12px;">${user.created_acc || "-"}</div>

        <button onclick="updateUserDetails(${user.id})" style="margin-top:8px;">💾 ذخیره تغییرات</button>
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
  `;

  if (userTransactions.length === 0) {
    html += `<tr><td colspan="6">هیچ تراکنشی برای این کاربر ثبت نشده است</td></tr>`;
  } else {
    userTransactions.forEach(t => {
      html += `
        <tr>
          <td>${t.id}</td>
          <td>${t.title}</td>
          <td>${t.amount}</td>
          <td>${t.date}</td>
          <td>${t.type}</td>
          <td><button onclick="deleteTransactionFromUser(${t.id}, ${user.id})">❌</button></td>
        </tr>
      `;
    });
  }

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  content.innerHTML = html;
}

function updateUserDetails(userId) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const usernameEl = document.getElementById("edit_username");
  const passwordEl = document.getElementById("edit_password");

  const newUsername = (usernameEl?.value || "").trim();
  const newPassword = (passwordEl?.value || "").trim();

  if (!newUsername) {
    alert("نام کاربری نمی‌تواند خالی باشد");
    return;
  }

  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    alert("کاربر یافت نشد");
    return;
  }

  // Prevent duplicate usernames (except same user)
  const duplicate = users.find(u => u.username === newUsername && u.id !== userId);
  if (duplicate) {
    alert("نام کاربری تکراری است");
    return;
  }

  users[index].username = newUsername;
  if (newPassword) {
    users[index].password = newPassword;
  }

  localStorage.setItem("users", JSON.stringify(users));

  // If editing the currently logged-in admin, sync localStorage
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedIn && loggedIn.id === userId) {
    loggedIn.username = newUsername;
    localStorage.setItem("loggedInUser", JSON.stringify(loggedIn));
  }

  alert("تغییرات ذخیره شد");
  showUserDetails(userId);
}

function deleteUser(id) {
  if (!confirm("آیا مطمئنید که می‌خواهید این کاربر را حذف کنید؟")) return;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.id !== id);

  localStorage.setItem("users", JSON.stringify(users));

  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedIn && loggedIn.id === id) {
    logout();
  } else {
    showUsers();
  }
}

function showTransactions() {
  const transactions = (JSON.parse(localStorage.getItem("transactions")) || [])
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
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

  if (transactions.length === 0) {
    html += `<tr><td colspan="7">هیچ تراکنشی موجود نیست</td></tr>`;
  }

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

function deleteTransactionFromUser(id, userId) {
  if (!confirm("آیا مطمئنید که می‌خواهید این تراکنش را حذف کنید؟")) return;

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  showUserDetails(userId);
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "Login.html";
}

