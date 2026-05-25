document.getElementById("registerForm").onsubmit = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  const alertEl = document.getElementById("alert");

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alertEl.textContent = "Passwords do not match";
    alertEl.className = "alert alert-error";
    alertEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Creating account...";
  alertEl.style.display = "none";

  try {
    await api.auth.register({ name, email, password, confirmPassword });

    alertEl.textContent =
      "Account created successfully! Redirecting to login...";
    alertEl.className = "alert alert-success";
    alertEl.style.display = "block";

    setTimeout(() => (window.location.href = "login.html"), 1500);
  } catch (err) {
    alertEl.textContent = err.message || "Something went wrong";
    alertEl.className = "alert alert-error";
    alertEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
};
