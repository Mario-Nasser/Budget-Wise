// =========================================
// 1. MOBILE MENU TOGGLE
// =========================================
// const menuToggle = document.getElementById("menuToggle");
// const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  const spans = menuToggle.querySelectorAll("span");
  if (navLinks.classList.contains("active")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
  } else {
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  }
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    const spans = menuToggle.querySelectorAll("span");
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  });
});

// =========================================
// 2. FUN MOUSE TRAIL PARTICLES
// =========================================
const particles = ["💰", "", "📈", "", "✨", "", "🪙", "📊", "🌱", "💡"];
const trailContainer = document.getElementById("cursorTrail");
let lastX = 0,
  lastY = 0,
  particleCount = 0;
const maxParticles = 30;

document.addEventListener("mousemove", (e) => {
  const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);
  if (distance > 40) {
    lastX = e.clientX;
    lastY = e.clientY;
    createParticle(e.clientX, e.clientY);
  }
});

document.addEventListener("click", (e) => {
  createRipple(e.clientX, e.clientY);
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createParticle(
        e.clientX + (Math.random() - 0.5) * 60,
        e.clientY + (Math.random() - 0.5) * 60,
      );
    }, i * 100);
  }
});

function createParticle(x, y) {
  if (particleCount >= maxParticles) {
    const oldest = trailContainer.querySelector(".trail-particle");
    if (oldest) oldest.remove();
  } else {
    particleCount++;
  }

  const particle = document.createElement("div");
  particle.className = "trail-particle";
  particle.textContent =
    particles[Math.floor(Math.random() * particles.length)];

  const size = 16 + Math.random() * 12;
  particle.style.fontSize = `${size}px`;
  particle.style.left = `${x + (Math.random() - 0.5) * 20}px`;
  particle.style.top = `${y + (Math.random() - 0.5) * 20}px`;

  trailContainer.appendChild(particle);

  setTimeout(() => {
    particle.remove();
    particleCount--;
  }, 3000);
}

function createRipple(x, y) {
  const ripple = document.createElement("div");
  ripple.className = "click-ripple";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  trailContainer.appendChild(ripple);
  setTimeout(() => ripple.remove(), 1500);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    trailContainer.innerHTML = "";
    particleCount = 0;
  }
});
