let miId = parseInt(localStorage.getItem("id_emprendedor"));
let filtroBusqueda = ""; // Definir variable global para el filtro

if (!miId) {
    alert("Sesión no válida");
    window.location.href = "/pages/login.html";
}

/* ================================
   RELACIÓN ENTRE USUARIOS
================================ */
async function obtenerRelacion(userId) {
    try {
        // 1. Verificar si son amigos (chat permitido)
        const chatRes = await fetch(`/api/chat-permitido/${miId}/${userId}`);
        const chatData = await chatRes.json();
        if (chatData.permitido) return { estado: "aceptado" };


// 2. Solicitudes que YO recibo (me enviaron a mí)
const resRecibidas = await fetch(`/api/solicitudes/pendientes/${miId}`); 
const recibidas = await resRecibidas.json();
if (recibidas.find(s => s.emisor_id == userId)) return { estado: "pendiente_recibida" };

// 3. Solicitudes que YO envié (el otro las recibió)
const resEnviadas = await fetch(`/api/solicitudes/pendientes/${userId}`); 
if (enviadas.find(s => s.emisor_id == miId)) return { estado: "pendiente_enviada" };
        
return null;
    } catch (error) {
        console.error("Error relación:", error);
        return null;
    }
}

/* ================================
   CARGAR EMPRENDEDORES (TODOS A LA VEZ)
================================ */
async function cargarEmprendedores() {
    try {
        const res = await fetch('/api/emprendedores');
        let usuarios = await res.json();

        // Filtro
        if (filtroBusqueda.trim() !== "") {
            usuarios = usuarios.filter(user =>
                user.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
            );
        }

        const contenedor = document.getElementById("listaEmprendedores");
        if (!contenedor) return;
        contenedor.innerHTML = ""; 

        // Promise.all para cargar todos los estados al tiempo
        const promesas = usuarios.map(async (user) => {
            if (user.id_emprendedor == miId) return null;

            const relacion = await obtenerRelacion(user.id_emprendedor);
            const div = document.createElement("div");
            div.classList.add("project-item");

            let botonHTML = "";
            if (!relacion) {
                botonHTML = `<button class="btn-secondary-small btn-agregar" data-id="${user.id_emprendedor}">Agregar</button>`;
            } else if (relacion.estado === "pendiente_recibida") {
                botonHTML = `<button disabled class="btn-pending">Por Aceptar</button>`;
            } else if (relacion.estado === "pendiente_enviada") {
                botonHTML = `<button disabled class="btn-sent">Enviado</button>`;
            } else if (relacion.estado === "aceptado") {
                botonHTML = `<button class="btn-primary-small btn-chat" data-id="${user.id_emprendedor}">Chatear</button>`;
            }

            div.innerHTML = `
            <span class="project-name">${user.nombre}</span>
            <div class="actions-gap" style="display: flex; gap: 8px;">
            <button class="btn-perfil btn-secondary-small" data-id="${user.id_emprendedor}">
            <i class="fa-solid fa-user"></i> Perfil
            </button>
            ${botonHTML}
            </div>
            `;
            return div;
        });

        const resultados = await Promise.all(promesas);
        resultados.forEach(div => {
            if (div) {
                contenedor.appendChild(div);
                
                // Evento Agregar
                div.querySelector(".btn-agregar")?.addEventListener("click", (e) => {
                    enviarSolicitud(e.target, e.target.dataset.id);
                });

                // Evento Chat
                div.querySelector(".btn-chat")?.addEventListener("click", (e) => {
                    window.location.href = `/pages/mensajes.html?user=${e.target.dataset.id}`;
                });

                // Evento Ver Perfil
                div.querySelector(".btn-perfil")?.addEventListener("click", (e) => {
                // Buscamos el ID del botón (o del padre si se hizo clic en el icono)
                const idPerfil = e.target.closest('.btn-perfil').dataset.id;
                window.location.href = `/pages/perfil.html?id=${idPerfil}`;
        });
            }
        });
    } catch (error) {
        console.error("Error cargando emprendedores:", error);
    }
}

/* ================================
   ENVIAR SOLICITUD (BLOQUEO DE BOTÓN)
================================ */
async function enviarSolicitud(boton, receptorId) {
    boton.disabled = true;
    boton.innerText = "Enviando...";

    try {
        await fetch('/api/solicitudes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emisor_id: miId, receptor_id: receptorId })
        });
        boton.innerText = "Enviado";
        // El botón queda disabled permanentemente hasta recargar
    } catch (error) {
        console.error("Error:", error);
        boton.disabled = false;
        boton.innerText = "Agregar";
    }
}

/* ================================
   CARGAR SOLICITUDES RECIBIDAS (LADO DERECHO) - CORREGIDO
================================ */
async function cargarSolicitudes() {
    try {
        // CORRECCIÓN 1: Se cambió a la ruta real del servidor para pendientes
        const res = await fetch(`/api/solicitudes/pendientes/${miId}`);
        const solicitudes = await res.json();

        const contenedor = document.getElementById("listaSolicitudes");
        if (!contenedor) return;
        contenedor.innerHTML = "";

        if (solicitudes.length === 0) {
            contenedor.innerHTML = `<p style="color: #888; font-size: 0.9rem; margin-top: 10px;">No tienes solicitudes pendientes.</p>`;
            return;
        }

        solicitudes.forEach(s => {
            const div = document.createElement("div");
            div.classList.add("project-item");
            
            // CORRECCIÓN 2: s.nombre es correcto por el JOIN, pero verificamos estructura
            div.innerHTML = `
                <span class="project-name">${s.nombre}</span>
                <div class="actions-gap" style="display: flex; gap: 8px;">
                    <button class="aceptar btn-primary-small">Aceptar</button>
                    <button class="rechazar btn-secondary-small">Rechazar</button>
                </div>
            `;

            // CORRECCIÓN 3: Ajuste para enviar el body esperado ('aceptar') usando id_solicitud
            div.querySelector(".aceptar").onclick = async () => {
                await fetch(`/api/solicitudes/${s.id_solicitud}`, { 
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "aceptar" })
                });
                cargarSolicitudes();
                cargarEmprendedores();
            };

            // CORRECCIÓN 4: Ajuste para enviar el body esperado ('rechazar') usando id_solicitud
            div.querySelector(".rechazar").onclick = async () => {
                await fetch(`/api/solicitudes/${s.id_solicitud}`, { 
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "rechazar" })
                });
                cargarSolicitudes();
                cargarEmprendedores();
            };

            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar solicitudes en el front:", error);
    }
}

/* ================================
   INICIO
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
    cargarSolicitudes();
});

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