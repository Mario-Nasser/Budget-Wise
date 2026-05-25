if (!localStorage.getItem("token")) window.location.href = "login.html";

let allCategories = [];

async function loadCategories() {
  try {
    const res = await api.transactions.categories.getAll();
    allCategories = res.data || [];
    updateCategories();
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

function updateCategories() {
  const type = document.getElementById("type").value.toLowerCase();
  const select = document.getElementById("category");
  const filtered = allCategories.filter((c) => c.type === type);

  select.innerHTML = '<option value="">Select Category</option>';
  filtered.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c._id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

async function loadHistory() {
  const listEl = document.getElementById("historyList");
  try {
    const res = await api.transactions.getAll();
    const txs = res.data?.transactions || [];
    listEl.innerHTML = "";

    if (txs.length === 0) {
      listEl.innerHTML =
        '<p style="color: var(--text-muted);">No transactions found.</p>';
      return;
    }

    txs.forEach((t) => {
      const item = document.createElement("div");
      item.className = `transaction-item ${t.type}`;
      item.innerHTML = `
            <div>
              <div style="font-weight: 600;">$${t.amount.toFixed(2)}</div>
              <div style="font-size: 0.8125rem; color: var(--text-muted);">${t.description || "No description"}</div>
            </div>
            <div style="text-align: right;">
              <div class="category-badge">${t.category?.name || "Uncategorized"}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${new Date(t.date).toLocaleDateString()}</div>
            </div>
          `;
      listEl.appendChild(item);
    });
  } catch (err) {
    listEl.innerHTML =
      '<p style="color: var(--error);">Error loading history.</p>';
  }
}

document.getElementById("categoryForm").onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api.transactions.categories.create({
      name: document.getElementById("catName").value,
      type: document.getElementById("catType").value,
      limit: document.getElementById("catLimit").value,
    });
    e.target.reset();
    await loadCategories();
    alert("Category created!");
  } catch (err) {
    alert(err.message || "Error creating category");
  }
};

document.getElementById("transactionForm").onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    amount: Number(document.getElementById("amount").value),
    type: document.getElementById("type").value,
    categoryId: document.getElementById("category").value,
    description: document.getElementById("desc").value,
    date: new Date(),
  };

  try {
    const res = await api.transactions.create(data);
    if (res.warning) alert(res.warning);
    else alert("Transaction added!");
    e.target.reset();
    loadHistory();
  } catch (err) {
    alert(err.message || "Error adding transaction");
  }
};

async function handleClearAll() {
  if (
    !confirm(
      "Are you sure you want to clear all your transactions and custom categories? This cannot be undone.",
    )
  )
    return;

  try {
    await api.transactions.clearAll();
    alert("All data cleared successfully!");
    await loadCategories();
    await loadHistory();
  } catch (err) {
    alert(err.message || "Error clearing data");
  }
}

loadCategories();
loadHistory();
