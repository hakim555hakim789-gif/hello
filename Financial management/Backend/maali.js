

const user = JSON.parse(localStorage.getItem('loggedInUser'));
if (!user) {
  alert("ابتدا وارد حساب شوید");
  window.location.href = "Login.html";
}

let allTransactions = [];
let userTransactions = [];

if (localStorage.getItem('allTransactions')) {
  allTransactions = JSON.parse(localStorage.getItem('allTransactions'));
  userTransactions = allTransactions.filter(t => t.user_id === user.id);
  showTransactions();
  calculateStats();
} else {
  fetch('../Backend/transactions.json')
    .then(res => res.json())
    .then(data => {
      localStorage.setItem('allTransactions', JSON.stringify(data));
      allTransactions = data;
      userTransactions = allTransactions.filter(t => t.user_id === user.id);
      showTransactions();
      calculateStats();
    });
}

document.getElementById('transactionForm').addEventListener('submit', e => {
  e.preventDefault();

  const newTransaction = {
    id: Date.now(),
    user_id: user.id,
    title: document.getElementById('title').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  allTransactions.push(newTransaction);
  userTransactions.push(newTransaction);

  localStorage.setItem('allTransactions', JSON.stringify(allTransactions));

  showTransactions();
  calculateStats();

  document.getElementById('transactionForm').reset();
});

function showTransactions() {
  const container = document.getElementById("transactionsContainer");
  container.innerHTML = "";

  userTransactions.forEach(t => {
    const div = document.createElement("div");
    div.classList.add("transaction-item");

    if (t.amount >= 0) {
      div.style.backgroundColor = "#3cc15bff"; 
    } else {
      div.style.backgroundColor = "#d25660ff"; 
    }

    div.innerHTML = `
      <strong>${t.title}</strong> - ${t.amount} تومان - ${t.type}
      <br><small>${t.date}</small>
      <button onclick="deleteTransaction(${t.id})">❌ حذف</button>
    `;

    container.appendChild(div);
  });
}

function deleteTransaction(id) {
  if (!confirm("آیا مطمئنید؟")) return;

  allTransactions = allTransactions.filter(t => t.id !== id);
  userTransactions = userTransactions.filter(t => t.id !== id);

  localStorage.setItem('allTransactions', JSON.stringify(allTransactions));

  showTransactions();
  calculateStats();
}

function calculateStats() {
  let totalIncome = 0;
  let totalExpense = 0;

  userTransactions.forEach(t => {
    if (["درآمد", "واریز", "فروش"].includes(t.type)) {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  });

  document.getElementById('totalIncome').textContent = totalIncome;
  document.getElementById('totalExpense').textContent = totalExpense;
  document.getElementById('balance').textContent = totalIncome - totalExpense;
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




