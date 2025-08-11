// کلاس پایه برای تراکنش
class Transaction {
  constructor(id, user_id, title, amount, type, category, date) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.amount = amount;
    this.type = type;
    this.category = category;
    this.date = date;
  }

  // متد برای بررسی نوع تراکنش
  isIncome() {
    return ["درآمد", "واریز", "فروش"].includes(this.type);
  }

  // متد برای فرمت کردن مبلغ
  getFormattedAmount() {
    return `${this.amount} تومان`;
  }

  // متد برای بررسی اعتبار داده‌ها
  isValid() {
    return this.title && this.amount !== undefined && this.type && this.date;
  }
}

// کلاس مدیریت تراکنش‌ها با ارث‌بری
class TransactionManager extends Array {
  constructor() {
    super();
  }

  // اضافه کردن تراکنش جدید
  addTransaction(transaction) {
    if (transaction instanceof Transaction && transaction.isValid()) {
      this.push(transaction);
      return true;
    }
    return false;
  }

  // فیلتر کردن بر اساس کاربر
  getTransactionsByUser(userId) {
    return this.filter(t => t.user_id === userId);
  }

  // فیلتر کردن بر اساس نوع
  getTransactionsByType(type) {
    return this.filter(t => t.type === type);
  }

  // فیلتر کردن بر اساس بازه تاریخ
  getTransactionsByDateRange(fromDate, toDate) {
    return this.filter(t => {
      const transactionDate = new Date(t.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      
      if (from && to) {
        return transactionDate >= from && transactionDate <= to;
      } else if (from) {
        return transactionDate >= from;
      } else if (to) {
        return transactionDate <= to;
      }
      return true;
    });
  }

  // جستجو در عنوان
  searchByTitle(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return this.filter(t => 
      t.title.toLowerCase().includes(normalizedSearch)
    );
  }

  // محاسبه آمار
  calculateStats() {
    const income = this.filter(t => t.isIncome()).reduce((sum, t) => sum + t.amount, 0);
    const expense = this.filter(t => !t.isIncome()).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expense;
    
    return { income, expense, balance };
  }

  // حذف تراکنش
  removeTransaction(id) {
    const index = this.findIndex(t => t.id === id);
    if (index !== -1) {
      this.splice(index, 1);
      return true;
    }
    return false;
  }

  // به‌روزرسانی تراکنش
  updateTransaction(id, updates) {
    const transaction = this.find(t => t.id === id);
    if (transaction) {
      Object.assign(transaction, updates);
      return true;
    }
    return false;
  }
}

// کلاس مدیریت کاربر
class User {
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

  getAccountAge() {
    const created = new Date(this.created_acc);
    const now = new Date();
    const diffTime = now - created;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

// کلاس اصلی مدیریت مالی
class FinancialManager {
  constructor() {
    this.transactions = new TransactionManager();
    this.currentUser = null;
    this.editMode = false;
    this.editId = null;
    
    // متغیرهای مختلف
    this.debugMode = false;
    this.maxTransactions = 1000;
    this.defaultCurrency = 'تومان';
    
    // آرایه‌های کمکی
    this.transactionTypes = ['درآمد', 'هزینه', 'خرید', 'فروش', 'واریز', 'برداشت'];
    this.categories = ['job', 'clothing', 'personal', 'food', 'support', 'banking', 'tech', 'bills', 'transport', 'gift', 'freelance', 'entertainment'];
    
    // آبجکت تنظیمات
    this.settings = {
      autoSave: true,
      showConfirmations: true,
      dateFormat: 'fa-IR',
      currency: 'تومان'
    };
  }

  // متد async برای بارگذاری داده‌ها
  async loadData() {
    try {
      // تست و دیباگ
      if (this.debugMode) {
        console.log('🔍 شروع بارگذاری داده‌ها...');
        console.time('loadData');
      }

      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        throw new Error('کاربر وارد نشده است');
      }

      this.currentUser = new User(user.id, user.username, null, user.created_acc, user.role);

      // بارگذاری تراکنش‌ها
      let allTransactions = [];
      if (localStorage.getItem('allTransactions')) {
        allTransactions = JSON.parse(localStorage.getItem('allTransactions'));
      } else {
        const response = await fetch('../Backend/transactions.json');
        allTransactions = await response.json();
        localStorage.setItem('allTransactions', JSON.stringify(allTransactions));
      }

      // تبدیل به کلاس‌ها
      allTransactions.forEach(t => {
        const transaction = new Transaction(t.id, t.user_id, t.title, t.amount, t.type, t.category, t.date);
        this.transactions.addTransaction(transaction);
      });

      if (this.debugMode) {
        console.log(`✅ ${this.transactions.length} تراکنش بارگذاری شد`);
        console.timeEnd('loadData');
      }

      return true;
    } catch (error) {
      console.error('❌ خطا در بارگذاری داده‌ها:', error);
      return false;
    }
  }

  // متد برای نمایش تراکنش‌ها
  showTransactions(filteredTransactions = null) {
    const container = document.getElementById("transactionsContainer");
    if (!container) return;

    container.innerHTML = "";
    
    const transactionsToShow = filteredTransactions || this.transactions.getTransactionsByUser(this.currentUser.id);

    // استفاده از map برای تبدیل داده‌ها
    const transactionElements = transactionsToShow.map(t => {
      const div = document.createElement("div");
      div.classList.add("transaction-item");
      
      // استفاده از عملگرهای مختلف
      const isPositive = t.amount >= 0;
      const bgColor = isPositive ? "#3cc15bff" : "#d25660ff";
      div.style.backgroundColor = bgColor;

      // استفاده از Template literal
      div.innerHTML = `
        <strong>${t.title}</strong> - ${t.getFormattedAmount()} - ${t.type}
        <br><small>${t.date}</small>
        <button onclick="financialManager.deleteTransaction(${t.id})">❌ حذف</button>
        <button onclick="financialManager.editTransaction(${t.id})" class="edit">✏️ ویرایش</button>
      `;

      return div;
    });

    // اضافه کردن به DOM
    transactionElements.forEach(el => container.appendChild(el));
    
    // به‌روزرسانی آمار
    this.calculateAndShowStats();
  }

  // متد برای فیلتر کردن تراکنش‌ها
  filterTransactions() {
    const searchTitle = document.getElementById('searchTitle')?.value || '';
    const filterType = document.getElementById('filterType')?.value || '';
    const fromDate = document.getElementById('fromDate')?.value || '';
    const toDate = document.getElementById('toDate')?.value || '';

    let filtered = this.transactions.getTransactionsByUser(this.currentUser.id);

    // استفاده از زنجیره متدها
    if (searchTitle) {
      filtered = this.transactions.searchByTitle(searchTitle)
        .filter(t => t.user_id === this.currentUser.id);
    }
    
    if (filterType) {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    if (fromDate || toDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        
        if (from && to) {
          return transactionDate >= from && transactionDate <= to;
        } else if (from) {
          return transactionDate >= from;
        } else if (to) {
          return transactionDate <= to;
        }
        return true;
      });
    }

    this.showTransactions(filtered);
  }

  // متد برای ویرایش تراکنش
  editTransaction(id) {
    const transaction = this.transactions.find(t => t.id === id);
    if (!transaction) return;

    this.editMode = true;
    this.editId = id;

    // پر کردن فرم
    const formElements = ['title', 'amount', 'type', 'category', 'date'];
    formElements.forEach(field => {
      const element = document.getElementById(field);
      if (element) {
        element.value = transaction[field];
      }
    });

    // تغییر UI
    this.updateUIForEditMode();
    
    // اسکرول نرم
    document.querySelector('.form-section')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  // متد برای به‌روزرسانی UI در حالت ویرایش
  updateUIForEditMode() {
    const formEl = document.getElementById('transactionForm');
    const formTitleEl = document.querySelector('.form-section h2');
    const submitBtnEl = document.querySelector('#transactionForm button[type="submit"]');

    if (formEl) formEl.classList.add('editing');
    if (formTitleEl) formTitleEl.textContent = 'در حال ویرایش تراکنش';
    if (submitBtnEl) submitBtnEl.textContent = 'ذخیره تغییرات';

    // اضافه کردن دکمه لغو
    if (!document.getElementById('cancelEditBtn')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'cancelEditBtn';
      cancelBtn.className = 'cancel-btn';
      cancelBtn.textContent = 'لغو ویرایش';
      cancelBtn.addEventListener('click', () => this.exitEditMode());
      
      if (submitBtnEl) {
        submitBtnEl.insertAdjacentElement('afterend', cancelBtn);
      }
    }
  }

  // متد برای خروج از حالت ویرایش
  exitEditMode() {
    this.editMode = false;
    this.editId = null;
    
    const formEl = document.getElementById('transactionForm');
    const formTitleEl = document.querySelector('.form-section h2');
    const submitBtnEl = document.querySelector('#transactionForm button[type="submit"]');

    if (formEl) formEl.classList.remove('editing');
    if (formTitleEl) formTitleEl.textContent = 'افزودن تراکنش جدید';
    if (submitBtnEl) submitBtnEl.textContent = 'ثبت تراکنش';

    // حذف دکمه لغو
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.remove();

    // پاک کردن پیام
    const resEl = document.getElementById('res');
    if (resEl) resEl.textContent = '';
  }

  // متد برای حذف تراکنش
  deleteTransaction(id) {
    if (!this.settings.showConfirmations || confirm("آیا مطمئنید؟")) {
      if (this.transactions.removeTransaction(id)) {
        this.saveToLocalStorage();
        this.showTransactions();
        this.calculateAndShowStats();
      }
    }
  }

  // متد برای ذخیره در LocalStorage
  saveToLocalStorage() {
    try {
      const transactionsData = this.transactions.map(t => ({
        id: t.id,
        user_id: t.user_id,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date
      }));
      
      localStorage.setItem('allTransactions', JSON.stringify(transactionsData));
      
      if (this.debugMode) {
        console.log('💾 داده‌ها در LocalStorage ذخیره شدند');
      }
    } catch (error) {
      console.error('❌ خطا در ذخیره‌سازی:', error);
    }
  }

  // متد برای محاسبه و نمایش آمار
  calculateAndShowStats() {
    const userTransactions = this.transactions.getTransactionsByUser(this.currentUser.id);
    const stats = userTransactions.calculateStats();

    // به‌روزرسانی UI
    const elements = {
      'totalIncome': stats.income,
      'totalExpense': stats.expense,
      'balance': stats.balance
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  // متد برای اضافه کردن تراکنش جدید
  addNewTransaction(formData) {
    const newTransaction = new Transaction(
      Date.now(),
      this.currentUser.id,
      formData.title,
      parseFloat(formData.amount),
      formData.type,
      formData.category,
      formData.date
    );

    if (this.transactions.addTransaction(newTransaction)) {
      this.saveToLocalStorage();
      this.showTransactions();
      this.calculateAndShowStats();
      return true;
    }
    return false;
  }

  // متد برای به‌روزرسانی تراکنش
  updateExistingTransaction(formData) {
    const updates = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date
    };

    if (this.transactions.updateTransaction(this.editId, updates)) {
      this.saveToLocalStorage();
      this.showTransactions();
      this.calculateAndShowStats();
      this.exitEditMode();
      return true;
    }
    return false;
  }

  // متد برای مدیریت فرم
  handleFormSubmit(formData) {
    if (this.editMode) {
      return this.updateExistingTransaction(formData);
    } else {
      return this.addNewTransaction(formData);
    }
  }

  // متد برای راه‌اندازی
  async initialize() {
    const success = await this.loadData();
    if (success) {
      this.setupEventListeners();
      this.showTransactions();
      this.calculateAndShowStats();
    }
  }

  // متد برای تنظیم event listeners
  setupEventListeners() {
    // فرم تراکنش
    const form = document.getElementById('transactionForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
          title: document.getElementById('title').value,
          amount: document.getElementById('amount').value,
          type: document.getElementById('type').value,
          category: document.getElementById('category').value,
          date: document.getElementById('date').value
        };

        if (this.handleFormSubmit(formData)) {
          form.reset();
          const resEl = document.getElementById('res');
          if (resEl) {
            resEl.textContent = this.editMode ? 'تراکنش ویرایش شد.' : 'تراکنش اضافه شد.';
          }
        }
      });
    }

    // فیلترها
    const filterElements = ['searchTitle', 'filterType', 'fromDate', 'toDate'];
    filterElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        const eventType = id === 'searchTitle' ? 'input' : 'change';
        element.addEventListener(eventType, () => this.filterTransactions());
      }
    });
  }
}

// ایجاد نمونه از کلاس اصلی
const financialManager = new FinancialManager();

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener('DOMContentLoaded', () => {
  financialManager.initialize();
});

// متدهای global برای backward compatibility
function showTransactions() {
  financialManager.showTransactions();
}

function deleteTransaction(id) {
  financialManager.deleteTransaction(id);
}

function editTransaction(id) {
  financialManager.editTransaction(id);
}

function filterTransactions() {
  financialManager.filterTransactions();
}

function calculateStats() {
  financialManager.calculateAndShowStats();
}












// const user = JSON.parse(localStorage.getItem('loggedInUser'));
// if (!user) {
//   alert("ابتدا وارد حساب شوید");
//   window.location.href = "Login.html";
// }


// let allTransactions = []; 
// let userTransactions = []; 

// fetch('/Backend/transactions.json')
//   .then(res => res.json())
//   .then(data => {
//     allTransactions = data;
//     userTransactions = allTransactions.filter(t => t.user_id === user.id);
//     showTransactions();
//     calculateStats();
//   });


// document.getElementById('transactionForm').addEventListener('submit', e => {
//   e.preventDefault();

//   const newTransaction = {
//     id: Date.now(),
//     user_id: user.id,
//     title: document.getElementById('title').value,
//     amount: parseFloat(document.getElementById('amount').value),
//     type: document.getElementById('type').value,
//     category: document.getElementById('category').value,
//     date: document.getElementById('date').value
//   };

//   allTransactions.push(newTransaction);
//   userTransactions.push(newTransaction);

//   showTransactions();
//   calculateStats();

//   document.getElementById('transactionForm').reset();

//   localStorage.setItem('allTransactions', JSON.stringify(allTransactions));
// });



// function showTransactions() {
//   const container = document.getElementById("transactionsContainer");
//   container.innerHTML = "";

//   userTransactions.forEach(t => {
//     const div = document.createElement("div");
//     div.classList.add("transaction-item");

//     if (t.amount >= 0) {
//       div.classList.add("positive");
//     } else {
//       div.classList.add("negative");
//     }

//     div.innerHTML = `
//       <strong>${t.title}</strong> - ${t.amount} تومان - ${t.type}
//       <br><small>${t.date}</small>
//       <button onclick="deleteTransaction(${t.id})">❌ حذف</button>
//     `;

//     container.appendChild(div);
//   });
// }





// // function deleteTransaction(id) {
// //   console.log(id)
// //   if (!confirm("آیا مطمئنید؟")) return;

// //   allTransactions = allTransactions.filter(t => t.id !== id);
// //   userTransactions = userTransactions.filter(t => t.id !== id);

// //   const rEx = new RegExp('^\\s*\\d+\\.?', 'gm');
// //   let updatedUserTra = JSON.parse(user.json.replace(rEx, ''))
// //     .filter(t => t.id !== id); 

// //   user.json = JSON.stringify(updatedUserTra);

// //   localStorage.setItem('allTransactions', JSON.stringify(allTransactions));
// //   localStorage.setItem('userTransactions', JSON.stringify(userTransactions));

// //   showTransactions();
// //   calculateStats();
// // }



// function deleteTransaction(id) {
//   if (!confirm("آیا مطمئنید؟")) return;

//   allTransactions = allTransactions.filter(t => t.id !== id);
//   userTransactions = userTransactions.filter(t => t.id !== id);

//   let transactionsData = JSON.parse(localStorage.getItem('transactions')) || [];

//   transactionsData = transactionsData.filter(t => t.id !== id);

//   localStorage.setItem('transactions', JSON.stringify(transactionsData));
//   localStorage.setItem('allTransactions', JSON.stringify(allTransactions));
//   localStorage.setItem('userTransactions', JSON.stringify(userTransactions));

//   showTransactions();
//   calculateStats();
// }




// function calculateStats() {
//   let totalIncome = 0;
//   let totalExpense = 0;

//   userTransactions.forEach(t => {
//     if (["درآمد", "واریز", "فروش"].includes(t.type)) {
//       totalIncome += t.amount;
//     } else {
//       totalExpense += t.amount;
//     }
//   });

//   document.getElementById('totalIncome').textContent = totalIncome;
//   document.getElementById('totalExpense').textContent = totalExpense;
//   document.getElementById('balance').textContent = totalIncome - totalExpense;
// }




