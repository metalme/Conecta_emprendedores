/* ================================
   SCROLL REVEAL
================================ */
ScrollReveal().reveal('[data-sr]', {
  distance: '40px',
  duration: 900,
  easing: 'ease-out',
  interval: 150,
  origin: 'bottom'
});

/* ================================
   PARALLAX EFECTO
================================ */
document.addEventListener("scroll", () => {
  const elements = document.querySelectorAll("[data-speed]");
  const scroll = window.pageYOffset;

  elements.forEach(el => {
      const speed = el.getAttribute("data-speed");
      el.style.transform = `translateY(${scroll * speed}px)`;
  });
});

/* ================================
   PARTÍCULAS SUAVES (VERDES)
================================ */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speed = Math.random() * 0.4 + 0.2;
  }
  update() {
    this.y -= this.speed;
    if (this.y < 0) this.y = canvas.height;
  }
  draw() {
    ctx.fillStyle = "rgba(0, 255, 130, 0.45)"; 
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}
animate();
/* ---- FIN DEL CÓDIGO ---- */