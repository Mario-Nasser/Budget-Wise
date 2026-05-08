const API_GOALS = '/goals';

// CREATE
async function createGoal() {
  const data = {
    goalName: document.getElementById('name').value,
    targetAmount: Number(document.getElementById('target').value),
    deadline: document.getElementById('deadline').value
  };

  const res = await fetch(API_GOALS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
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
  const res = await fetch(API_GOALS);
  const goals = await res.json();
  displayGoals(goals);
}

// DISPLAY
function displayGoals(goals) {
  const container = document.getElementById('goals');
  container.innerHTML = '';

  goals.forEach(goal => {
    container.innerHTML += `
      <div style="border:1px solid #ccc; margin:10px; padding:15px; border-radius: 8px; background: #fff;">
        <h3>${goal.goalName}</h3>
        <p>Target: ${goal.targetAmount}</p>
        <p>Current: ${goal.currentAmount}</p>
        <p>Progress: ${(goal.progress || 0).toFixed(2)}%</p>
        <p>Status: ${goal.isAchieved ? "✅ Done" : "⏳ In Progress"}</p>
        <p>Deadline: ${new Date(goal.deadline).toDateString()}</p>

        <input type="number" placeholder="Add amount" id="amount-${goal.goalId}" style="width: 100px; padding: 5px;">
        <button onclick="updateProgress('${goal.goalId}')" style="padding: 5px 10px; cursor: pointer;">Update</button>
      </div>
    `;
  });
}

// UPDATE
async function updateProgress(goalId) {
  const amount = Number(document.getElementById(`amount-${goalId}`).value);

  const res = await fetch(`${API_GOALS}/${goalId}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Error updating progress");
    return;
  }

  getAllGoals();
}
