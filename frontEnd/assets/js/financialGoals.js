const API = "/goals";

// CREATE
async function createGoal() {
  const name = document.getElementById("goal-name").value;
  const target = document.getElementById("goal-target").value;
  const deadline = document.getElementById("goal-deadline").value;

  // Simple validation
  if (!name || !target || !deadline) {
    alert("Please fill in all fields");
    return;
  }

  const data = {
    goalName: name,
    targetAmount: Number(target),
    deadline: deadline,
  };

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Error creating goal");
    return;
  }

  const result = await res.json();
  alert("Goal created! ID: " + result.goalId);

  getAllGoals();
}

// GET ALL
async function getAllGoals() {
  const res = await fetch(API, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    // alert(err.error || "Error loading goals");
    return;
  }

  const goals = await res.json();
  displayGoals(goals);
}

// DISPLAY
function displayGoals(goals) {
  const container = document.getElementById("goals");
  container.innerHTML = "";

  if (goals.length === 0) {
      container.innerHTML = "<p>No goals set yet.</p>";
      return;
  }

  goals.forEach((goal) => {
    container.innerHTML += `
      <div class="goal-card" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
        <h3>${goal.goalName}</h3>
        <p>Target: $${goal.targetAmount}</p>
        <p>Current: $${goal.currentAmount}</p>
        <p>Progress: ${(goal.progress || 0).toFixed(2)}%</p>
        <p>Status: ${goal.isAchieved ? "✅ Achieved" : "⏳ In Progress"}</p>
        <p>Deadline: ${new Date(goal.deadline).toDateString()}</p>

        <input type="number" placeholder="Add amount" id="amount-${goal.goalId}" style="width: 100px;">
        <button onclick="updateProgress('${goal.goalId}')">Add Funds</button>
      </div>
    `;
  });
}

// UPDATE
async function updateProgress(goalId) {
  const amount = Number(document.getElementById(`amount-${goalId}`).value);

  const res = await fetch(`${API}/${goalId}/progress`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ amount }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error updating progress");
    return;
  }

  getAllGoals();
}