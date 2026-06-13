if (!localStorage.getItem("token")) window.location.href = "login.html";

// global variable to store goals
let allGoals = [];
const listEl = document.getElementById("goalsList");

async function loadInProgressGoals() {
  // highlight active filter
  highlightActiveFilter("inProgress");

  // fetch goals and filter in-progress ones
  try {
    // filtering is done on client side to avoid multiple API calls when switching filters
    const inProgressGoals = allGoals.filter((goal) => !goal.isAchieved);
    // display goals based on filter
    displayGoals(inProgressGoals, false);

  } catch (err) {
    listEl.innerHTML =
      '<p class="error">Error loading goals.</p>';
  }
}

async function loadCompletedGoals() {
  // highlight active filter
  highlightActiveFilter("completed");

  // fetch goals and filter completed ones
  try {
    const completedGoals = allGoals.filter((goal) => goal.isAchieved);
    displayGoals(completedGoals, true);
    
  } catch (err) {
    listEl.innerHTML =
      '<p style="color: var(--error);">Error loading goals.</p>';
  }
}

// highlight active filter button
function highlightActiveFilter(activeFilter) {
  const activeBtn = document.getElementById("inProgress");
  const completedBtn = document.getElementById("completed");
  activeBtn.className = activeFilter === "inProgress"? "btn btn-primary":"btn";
  completedBtn.className = activeFilter === "completed"? "btn btn-primary":"btn";
}

// display goals based on filter
function displayGoals(goals, isAchieved) {
  listEl.innerHTML = "";
    if (goals.length === 0) {
      listEl.innerHTML =
        `<p style="color: var(--text-muted);"> ${isAchieved ? "No completed goals yet. Keep working towards your goals!" : "No in-progress goals. Create one to get started!"}</p>`;
      return;
    }

    goals.forEach((goal) => {
      const progress = goal.progress || 0;
      const card = document.createElement("div");
      card.className = "glass-card goal-card";
      card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="goalInfo">
                <div class= "goalIcon">
                  <i class="fa-solid fa-${goal.goalIcon}"></i>
                </div>
                <div>
                  <h3>${goal.goalName}</h3>
                  <p style="color: var(--text-muted); font-size: 0.875rem;">
                    <i class="fa-regular fa-calendar"></i> Deadline: ${new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span style="font-size: 0.75rem; background: ${isAchieved ? "var(--success)" : "var(--primary)"}; padding: 2px 8px; border-radius: 12px; color: white;">
                ${isAchieved ? "Completed" : "In Progress"}
              </span>
            </div>
            <div class="goalDetails" style="${isAchieved? `flex-direction: row;`:""}">
              <div class="goalProgress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="stats">
                  <span>$${goal.currentAmount} / $${goal.targetAmount}</span>
                  <span>${progress.toFixed(1)}%</span>
                </div>
                
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: start;">
                ${isAchieved ? "" : `<input type="number" id="update-${goal.goalId}" placeholder="Add amount" style="padding: 0.5rem; margin-bottom: 0; flex: 1;">`}
                ${isAchieved ? "" : `<button onclick="updateGoal('${goal.goalId}')" class="btn btn-primary" style="padding: 0.5rem 1rem;">Update</button>`}
                <button onclick="deleteGoal('${goal.goalId}')" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid var(--error); padding: 0.5rem 0.75rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                
              </div>
            </div>
          `;
      listEl.appendChild(card);
    });
}

// fetch all goals (used for filters)
async function loadGoals() {
  try {
    allGoals = await api.goals.getAll();

  } catch (err) {
    allGoals = [];
    listEl.innerHTML =
      '<p style="color: var(--error);">Error loading goals.</p>';
  }
}

// form validation
const nameError = document.getElementById("nameError");
const targetError = document.getElementById("targetError");
const deadlineError = document.getElementById("deadlineError");

// handle form submission
document.getElementById("goalForm").onsubmit = async (e) => {
  e.preventDefault();
  // delete previous errors
  nameError.textContent = "";
  targetError.textContent = "";
  deadlineError.textContent = "";
  // validate inputs
  const name = document.getElementById("name").value.trim();
  const target = document.getElementById("target").value.trim();
  const deadline = document.getElementById("deadline").value;
  let hasError = false;

  if (!name) {
    nameError.textContent = "Goal name is required.";
    hasError = true;
  }

  if (!target) {
    targetError.textContent = "Target amount is required.";
    hasError = true;
  }else if(Number(target) <= 0){
    targetError.textContent = "Target amount must be posative number";
    hasError = true;
  }

  if (!deadline) {
    deadlineError.textContent = "Please select a deadline.";
    hasError = true;
  }

  if (hasError) return;

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
    await loadGoals();
    loadInProgressGoals();
    setTimeout(() => (alertEl.style.display = "none"), 3000);
  } catch (err) {
    alertEl.textContent = err.error || "Error creating goal";
    alertEl.className = "alert alert-error";
    alertEl.style.display = "block";
  }
};

// update goal progress
async function updateGoal(id) {
  const input = document.getElementById(`update-${id}`);
  const amount = Number(input.value);
  if (!amount || amount <= 0) return;

  try {
    await api.goals.updateProgress(id, amount);
    await loadGoals();
    loadInProgressGoals();
  } catch (err) {
    alert(err.error || "Error updating goal");
  }
}

// delete goal
async function deleteGoal(id) {
  if (!confirm("Are you sure you want to delete this goal?")) return;
  try {
    await api.goals.delete(id);
    await loadGoals();
    // reload current filter after deletion
    if (document.getElementById("inProgress").style.scale == 1.1) {
      loadInProgressGoals();
    } else {
      loadCompletedGoals();
    }
  } catch (err) {
    alert(err.message || "Error deleting goal");
  }
}

async function init() {
  await loadGoals();
  loadInProgressGoals();
}

init();