if (!localStorage.getItem("token")) window.location.href = "login.html";

let budgets = [];

function dateValue(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function setCurrentMonthDefaults() {
  const now = new Date();
  document.getElementById("startDate").value = dateValue(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  document.getElementById("endDate").value = dateValue(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  );
}

async function loadCategories() {
  const res = await api.transactions.categories.getAll();
  const categories = (res.data || []).filter((c) => c.type === "expense");
  const select = document.getElementById("category");
  select.innerHTML = '<option value="">Select Category</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category._id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

async function loadBudgets() {
  const list = document.getElementById("budgetList");
  const alerts = document.getElementById("budgetAlerts");
  try {
    const res = await api.budgets.getAll();
    budgets = res.data || [];
    list.innerHTML = "";
    alerts.innerHTML = "";

    const activeAlerts = budgets.filter((b) => b.status !== "On Track");
    activeAlerts.forEach((b) => {
      const alert = document.createElement("div");
      alert.className = "budget-alert";
      alert.textContent = `${b.status}: ${b.category?.name || "Category"} is at ${b.percentSpent.toFixed(1)}% of budget.`;
      alerts.appendChild(alert);
    });

    if (!budgets.length) {
      list.innerHTML =
        '<p style="color: var(--text-muted);">No budgets yet. Create one to start tracking category spending.</p>';
      return;
    }

    budgets.forEach((budget) => {
      const percent = Math.min(budget.percentSpent, 100);
      const level =
        budget.percentSpent >= 100
          ? "over"
          : budget.status === "Near Limit"
            ? "near"
            : "";
      const card = document.createElement("div");
      card.className = "glass-card budget-card";
      card.innerHTML = `
            <div style="display: flex; justify-content: space-between; gap: 1rem;">
              <div>
                <h3>${budget.category?.name || "Category"}</h3>
                <p style="color: var(--text-muted); font-size: 0.875rem;">
                  ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}
                </p>
              </div>
              <span style="font-size: 0.75rem; height: fit-content; background: ${budget.status === "Exceeded" ? "var(--error)" : budget.status === "Near Limit" ? "var(--warning)" : "var(--success)"}; padding: 2px 8px; border-radius: 12px; color: white;">
                ${budget.status}
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${level}" style="width: ${percent}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.875rem;">
              <span>Spent: $${budget.spent.toFixed(2)} / $${budget.amount.toFixed(2)}</span>
              <span>${budget.percentSpent.toFixed(1)}%</span>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
              <button onclick="editBudget('${budget.id}')" class="btn btn-primary" style="padding: 0.5rem 1rem;">Edit</button>
              <button onclick="deleteBudget('${budget.id}')" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #b91c1c; border: 1px solid #fecaca; padding: 0.5rem 1rem;">Delete</button>
            </div>
          `;
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML =
      '<p style="color: var(--error);">Error loading budgets.</p>';
  }
}

function showAlert(text, type) {
  const alert = document.getElementById("alert");
  alert.textContent = text;
  alert.className = `alert alert-${type}`;
  alert.style.display = "block";
  setTimeout(() => (alert.style.display = "none"), 3500);
}

function resetForm() {
  document.getElementById("budgetForm").reset();
  document.getElementById("budgetId").value = "";
  document.getElementById("formTitle").textContent = "Create Budget";
  setCurrentMonthDefaults();
}

function editBudget(id) {
  const budget = budgets.find((b) => b.id === id);
  if (!budget) return;
  document.getElementById("budgetId").value = budget.id;
  document.getElementById("formTitle").textContent = "Edit Budget";
  document.getElementById("category").value =
    budget.category?._id || budget.category;
  document.getElementById("amount").value = budget.amount;
  document.getElementById("startDate").value = dateValue(budget.startDate);
  document.getElementById("endDate").value = dateValue(budget.endDate);
  document.getElementById("alertThreshold").value = budget.alertThreshold;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteBudget(id) {
  if (!confirm("Delete this budget?")) return;
  try {
    await api.budgets.delete(id);
    await loadBudgets();
  } catch (err) {
    alert(err.message || "Error deleting budget");
  }
}

document.getElementById("budgetForm").onsubmit = async (event) => {
  event.preventDefault();
  const id = document.getElementById("budgetId").value;
  const data = {
    categoryId: document.getElementById("category").value,
    amount: Number(document.getElementById("amount").value),
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    alertThreshold: Number(document.getElementById("alertThreshold").value),
  };

  try {
    if (id) await api.budgets.update(id, data);
    else await api.budgets.create(data);
    showAlert(
      id ? "Budget updated successfully." : "Budget created successfully.",
      "success",
    );
    resetForm();
    await loadBudgets();
  } catch (err) {
    showAlert(err.message || "Error saving budget", "error");
  }
};

setCurrentMonthDefaults();
loadCategories();
loadBudgets();
