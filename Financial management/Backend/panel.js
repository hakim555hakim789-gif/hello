
document.addEventListener("DOMContentLoaded", () => {
  
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) {
    window.location.href = "Login.html";
    return;
  }

  document.getElementById("welcomeTitle").textContent = `خوش آمدید، ${user.username}`;

  const createdDate = new Date(user.created_acc);
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

  document.getElementById("accountDate").textContent =
    `🗓️ تاریخ ساخت حساب: ${formattedPersianDate} (${diffDays} روز پیش)`;
});

function logout() {
  localStorage.removeItem("loggedInUser");
  return true; 
}
