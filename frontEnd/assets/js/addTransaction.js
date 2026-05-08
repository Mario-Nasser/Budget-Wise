// api.js
const API_URL = "/api/transactions";

function getToken() {
  return localStorage.getItem("token");
}

async function api(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
let categories = [];

/* ======================
   TOKEN
====================== */
function saveToken() {
  const token = document.getElementById("token").value.trim();

  if (!token) return alert("Token required");

  localStorage.setItem("token", token);
  alert("Token saved");
  fetchCategories();
  fetchTransactions();
}

/* ======================
   CATEGORIES
====================== */
async function fetchCategories() {
  try {
    const result = await api("/categories");
    categories = result.data || [];
    populateCategories();
  } catch (err) {
    console.error("Categories error:", err);
  }
}

function populateCategories() {
  const select = document.getElementById("trans-category");
  const type = document.getElementById("trans-type").value.toLowerCase();

  let html = `<option value="">Select Category</option>`;

  categories
    .filter(c => c.type === type)
    .forEach(c => {
      html += `<option value="${c._id}">${c.name}</option>`;
    });

  select.innerHTML = html;
}

/* ======================
   TRANSACTIONS
====================== */
async function fetchTransactions() {
  try {
    const result = await api("");

    const display = document.getElementById("display-area");
    display.innerHTML = "";

    const transactions = result.data?.transactions || [];

    transactions.forEach(t => {
      const div = document.createElement("div");
      div.className = t.type;

      div.innerHTML = `
        <strong>${t.type}</strong> - $${t.amount}
        ${t.category ? `[${t.category.name}]` : ""}
        <br/>
        ${t.description || ""}
      `;

      display.appendChild(div);
    });
  } catch (err) {
    console.error("Transactions error:", err);
  }
}

/* ======================
   ADD TRANSACTION
====================== */
document.getElementById("transaction-form").onsubmit = async (e) => {
  e.preventDefault();

  const type = document.getElementById("trans-type").value;

  const body = {
    amount: document.getElementById("trans-amount").value,
    type,
    description: document.getElementById("trans-desc").value,
    categoryId: document.getElementById("trans-category").value,
    source: document.getElementById("trans-source").value,
    date: new Date(),
  };

  try {
    await api("", {
      method: "POST",
      body: JSON.stringify(body),
    });

    alert("Transaction added");
    fetchTransactions();
    e.target.reset();
  } catch (err) {
    alert(err.message || "Error");
  }
};

/* ======================
   ADD CATEGORY
====================== */
document.getElementById("category-form").onsubmit = async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById("cat-name").value,
    type: document.getElementById("cat-type").value,
  };

  try {
    await api("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });

    alert("Category created");
    fetchCategories();
    e.target.reset();
  } catch (err) {
    alert(err.message || "Error");
  }
};

/* ======================
   INIT
====================== */
if (localStorage.getItem("token")) {
  fetchCategories();
  fetchTransactions();
}