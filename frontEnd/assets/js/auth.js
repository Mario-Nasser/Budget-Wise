const API = 'http://localhost:3000/auth';

// ===== Helpers =====
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}
function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}
function setAlert(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert ' + type;
  el.style.display = 'block';
}
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Loading...' : btn.dataset.label;
}

// ===== Password Strength =====
const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#2e7d32'];

function updateStrengthBar(password) {
  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[a-z]/.test(password))         score++;
  if (/\d/.test(password))            score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  if (!fill || !text) return;

  fill.style.width    = (score * 20) + '%';
  fill.style.background = strengthColors[score];
  text.textContent    = password ? strengthLabels[score] : '';
  text.style.color    = strengthColors[score];
}

// ===== REGISTER =====
async function register() {
  clearAllErrors();
  const name            = document.getElementById('name').value.trim();
  const email           = document.getElementById('email').value.trim();
  const password        = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  let hasError = false;

  if (!name || name.length < 2) {
    showFieldError('nameErr', 'Name must be at least 2 characters');
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('emailErr', 'Enter a valid email address');
    hasError = true;
  }
  if (!password || password.length < 8) {
    showFieldError('passwordErr', 'Password must be at least 8 characters');
    hasError = true;
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    showFieldError('passwordErr', 'Must contain uppercase, lowercase, and a number');
    hasError = true;
  }
  if (password !== confirmPassword) {
    showFieldError('confirmErr', 'Passwords do not match');
    hasError = true;
  }
  if (hasError) return;

  setLoading('registerBtn', true);
  try {
    const res  = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      setAlert('registerAlert', 'Account created successfully! Redirecting...', 'success');
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      setAlert('registerAlert', data.message || 'Something went wrong', 'error');
    }
  } catch {
    setAlert('registerAlert', 'Could not connect to server', 'error');
  } finally {
    setLoading('registerBtn', false);
  }
}

// ===== LOGIN =====
async function login() {
  clearAllErrors();
  const email      = document.getElementById('email').value.trim();
  const password   = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe')?.checked || false;

  let hasError = false;
  if (!email)    { showFieldError('emailErr',    'Email is required');    hasError = true; }
  if (!password) { showFieldError('passwordErr', 'Password is required'); hasError = true; }
  if (hasError) return;

  setLoading('loginBtn', true);
  try {
    const res  = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAlert('loginAlert', 'Login successful! Redirecting...', 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else if (res.status === 429) {
      setAlert('loginAlert', data.message, 'error');
    } else {
      setAlert('loginAlert', data.message || 'Invalid email or password', 'error');
    }
  } catch {
    setAlert('loginAlert', 'Could not connect to server', 'error');
  } finally {
    setLoading('loginBtn', false);
  }
}