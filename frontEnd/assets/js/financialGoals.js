if (!localStorage.getItem("token")) window.location.href = "login.html";

async function loadGoals() {
  const listEl = document.getElementById("goalsList");
  try {
    const goals = await api.goals.getAll();
    listEl.innerHTML = "";

    if (goals.length === 0) {
      listEl.innerHTML =
        '<p style="color: var(--text-muted);">No goals yet. Create one to get started!</p>';
      return;
    }

    goals.forEach((goal) => {
      const progress = goal.progress || 0;
      const card = document.createElement("div");
      card.className = "glass-card goal-card";
      card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h3>${goal.goalName}</h3>
              <span style="font-size: 0.75rem; background: ${goal.isAchieved ? "var(--success)" : "var(--primary)"}; padding: 2px 8px; border-radius: 12px; color: white;">
                ${goal.isAchieved ? "Completed" : "In Progress"}
              </span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">
              Deadline: ${new Date(goal.deadline).toLocaleDateString()}
            </p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <div class="stats">
              <span>$${goal.currentAmount} / $${goal.targetAmount}</span>
              <span>${progress.toFixed(1)}%</span>
            </div>
            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; align-items: center;">
              <input type="number" id="update-${goal.goalId}" placeholder="Add amount" style="padding: 0.5rem; margin-bottom: 0; flex: 1;">
              <button onclick="updateGoal('${goal.goalId}')" class="btn btn-primary" style="padding: 0.5rem 1rem;">Update</button>
              <button onclick="deleteGoal('${goal.goalId}')" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid var(--error); padding: 0.5rem 0.75rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          `;
      listEl.appendChild(card);
    });
  } catch (err) {
    listEl.innerHTML =
      '<p style="color: var(--error);">Error loading goals.</p>';
  }
}

document.getElementById("goalForm").onsubmit = async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById("alert");
  const data = {
    goalName: document.getElementById("name").value,
    targetAmount: Number(document.getElementById("target").value),
    deadline: document.getElementById("deadline").value,
  };

  try {
    await api.goals.create(data);
    alertEl.textContent = "Goal created successfully!";
    alertEl.className = "alert alert-success";
    alertEl.style.display = "block";
    e.target.reset();
    loadGoals();
    setTimeout(() => (alertEl.style.display = "none"), 3000);
  } catch (err) {
    alertEl.textContent = err.error || "Error creating goal";
    alertEl.className = "alert alert-error";
    alertEl.style.display = "block";
  }
};

async function updateGoal(id) {
  const input = document.getElementById(`update-${id}`);
  const amount = Number(input.value);
  if (!amount || amount <= 0) return;

  try {
    await api.goals.updateProgress(id, amount);
    loadGoals();
  } catch (err) {
    alert(err.error || "Error updating goal");
  }
}

async function deleteGoal(id) {
  if (!confirm("Are you sure you want to delete this goal?")) return;
  try {
    await api.goals.delete(id);
    loadGoals();
  } catch (err) {
    alert(err.message || "Error deleting goal");
  }
}

loadGoals();
