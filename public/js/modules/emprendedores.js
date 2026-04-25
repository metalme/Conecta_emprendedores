let miId = 1; // ⚠️ luego reemplazar con usuario logueado
let filtroBusqueda = "";

/* ================================
   OBTENER RELACIÓN ENTRE USUARIOS
================================ */
async function obtenerRelacion(userId) {
  const res = await fetch(`/api/relacion/${miId}/${userId}`);
  return await res.json();
}

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
   PARALLAX
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
   PARTÍCULAS
================================ */
const canvas = document.getElementById("particles");

if (canvas) {
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
}

/* ================================
   CARGAR EMPRENDEDORES
================================ */
async function obtenerRelacion(userId) {
  try {
    const res = await fetch(`/api/chat-permitido/${miId}/${userId}`);
    const data = await res.json();

    if (data.permitido) {
      return { estado: "aceptado" };
    }

    return null;

  } catch (error) {
    console.error("Error obteniendo relación:", error);
    return null;
  }
}


  // 🔍 FILTRO DE BÚSQUEDA
  if (filtroBusqueda.trim() !== "") {
    usuarios = usuarios.filter(user =>
      user.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
    );
  }

  const contenedor = document.getElementById("listaEmprendedores");

if (!contenedor) return;

contenedor.innerHTML = "";

  for (const user of usuarios) {

    if (user.id_emprendedor == miId) continue;

    const relacion = await obtenerRelacion(user.id_emprendedor);

    let boton = "";

    if (!relacion) {
      boton = `<button class="btn-secondary-small btn-agregar">Agregar</button>`;
    } 
    else if (relacion.estado === "pendiente") {
      boton = `<button disabled>Pendiente</button>`;
    } 
    else if (relacion.estado === "aceptado") {
      boton = `<button class="btn-primary-small btn-chat">Chatear</button>`;
    }

    const div = document.createElement("div");
    div.classList.add("project-item");

    div.innerHTML = `
      <span class="project-name">${user.nombre}</span>
      ${boton}
    `;

    // 👉 AGREGAR
    if (!relacion) {
      div.querySelector(".btn-agregar").addEventListener("click", async () => {

        await fetch('/api/solicitudes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emisor_id: miId,
            receptor_id: user.id_emprendedor
          })
        });

        alert("Solicitud enviada");
        cargarEmprendedores();
      });
    }

    // 👉 CHAT
    if (relacion && relacion.estado === "aceptado") {
      div.querySelector(".btn-chat")?.addEventListener("click", () => {
        window.location.href = `/pages/mensajes.html?user=${user.id_emprendedor}`;
      });
    }

    contenedor.appendChild(div);
  }
}

/* ================================
   INICIO + BUSCADOR
================================ */
document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("buscadorEmprendedores");

  if (input) {
    input.addEventListener("input", (e) => {
      filtroBusqueda = e.target.value;
      cargarEmprendedores();
    });
  }

  cargarEmprendedores();
});