let miId = 1; // ⚠️ luego usar localStorage
let filtroBusqueda = "";

/* ================================
   RELACIÓN ENTRE USUARIOS
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

/* ================================
   CARGAR EMPRENDEDORES
================================ */
async function cargarEmprendedores() {
  try {
    const res = await fetch('/api/emprendedores');
    let usuarios = await res.json();

    // 🔍 FILTRO
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

  } catch (error) {
    console.error("Error cargando emprendedores:", error);
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