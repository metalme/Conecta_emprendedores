let miId = parseInt(localStorage.getItem("id_emprendedor"));

if (!miId) {
  alert("Sesión no válida");
  window.location.href = "/pages/login.html";
}
console.log("ID actual:", miId);

/* ================================
   RELACIÓN ENTRE USUARIOS
================================ */
async function obtenerRelacion(userId) {
  try {
    // 1. Verificar si pueden chatear
    const chatRes = await fetch(`/api/chat-permitido/${miId}/${userId}`);
    const chatData = await chatRes.json();

    if (chatData.permitido) {
      return { estado: "aceptado" };
    }

    // 2. Solicitudes que YO recibo
    const res = await fetch(`/api/solicitudes/${miId}`);
    const solicitudes = await res.json();

    const pendienteRecibida = solicitudes.find(s => s.emisor_id == userId);

    if (pendienteRecibida) {
      return { estado: "pendiente_recibida" };
    }

    // 3. Solicitudes que EL OTRO usuario recibe (las que yo envié)
    const res2 = await fetch(`/api/solicitudes/${userId}`);
    const solicitudesDelOtro = await res2.json();

    const enviada = solicitudesDelOtro.find(s => s.emisor_id == miId);

    if (enviada) {
      return { estado: "pendiente_enviada" };
    }

    return null;

  } catch (error) {
    console.error("Error relación:", error);
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
      else if (relacion.estado === "pendiente_recibida") {
        boton = `<button disabled>Pendiente</button>`;
      }
      else if (relacion.estado === "pendiente_enviada") {
        boton = `<button disabled>Enviado</button>`;
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

      // 👉 BOTÓN AGREGAR
      if (!relacion) {
        div.querySelector(".btn-agregar").addEventListener("click", async (e) => {

          const btn = e.target;

          btn.disabled = true;
          btn.innerText = "Enviando...";

          try {
            await fetch('/api/solicitudes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                emisor_id: miId,
                receptor_id: user.id_emprendedor
              })
            });

            btn.innerText = "Enviado";

          } catch (error) {
            console.error("Error enviando solicitud:", error);
            btn.disabled = false;
            btn.innerText = "Agregar";
          }

        });
      }

      // 👉 BOTÓN CHAT (CORRECTAMENTE UBICADO)
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
   CARGAR SOLICITUDES
================================ */
async function cargarSolicitudes() {
  try {
    const res = await fetch(`/api/solicitudes/${miId}`);
    const solicitudes = await res.json();

    console.log("Solicitudes:", solicitudes);

    const contenedor = document.getElementById("listaSolicitudes");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    solicitudes.forEach(s => {
      const div = document.createElement("div");
      div.classList.add("project-item");

      div.innerHTML = `
        <span class="project-name">${s.nombre}</span>
        <button class="aceptar">Aceptar</button>
        <button class="rechazar">Rechazar</button>
      `;

      // ACEPTAR
      div.querySelector(".aceptar").addEventListener("click", async () => {
        await fetch(`/api/solicitudes/${s.id}`, { method: "PUT" });
        alert("Aceptado");
        cargarSolicitudes();
        cargarEmprendedores();
      });

      // RECHAZAR
      div.querySelector(".rechazar").addEventListener("click", async () => {
        await fetch(`/api/solicitudes/rechazar/${s.id}`, { method: "PUT" });
        alert("Rechazado");
        cargarSolicitudes();
      });

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("Error solicitudes:", error);
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
  cargarSolicitudes();

});