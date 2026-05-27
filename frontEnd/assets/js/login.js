document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  const alertEl = document.getElementById("alert");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  btn.disabled = true;
  btn.textContent = "Signing in...";
  alertEl.style.display = "none";

  try {
    const data = await api.auth.login({ email, password, rememberMe });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alertEl.textContent = "Login successful! Redirecting...";
    alertEl.className = "alert alert-success";
    alertEl.style.display = "block";

    setTimeout(() => (window.location.href = "financialGoals.html"), 1000);
  } catch (err) {
    alertEl.textContent = err.message || "Invalid email or password";
    alertEl.className = "alert alert-error";
    alertEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
};
