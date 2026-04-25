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
        const resRecibidas = await fetch(`/api/solicitudes/${miId}`);
        const recibidas = await resRecibidas.json();
        if (recibidas.find(s => s.emisor_id == userId)) return { estado: "pendiente_recibida" };

        // 3. Solicitudes que YO envié (el otro las recibió)
        const resEnviadas = await fetch(`/api/solicitudes/${userId}`);
        const enviadas = await resEnviadas.json();
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

            div.innerHTML = `<span class="project-name">${user.nombre}</span>${botonHTML}`;
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
   CARGAR SOLICITUDES RECIBIDAS (LADO DERECHO)
================================ */
async function cargarSolicitudes() {
    try {
        const res = await fetch(`/api/solicitudes/${miId}`);
        const solicitudes = await res.json();

        const contenedor = document.getElementById("listaSolicitudes");
        if (!contenedor) return;
        contenedor.innerHTML = "";

        solicitudes.forEach(s => {
            const div = document.createElement("div");
            div.classList.add("project-item");
            div.innerHTML = `
                <span class="project-name">${s.nombre}</span>
                <div class="actions-gap">
                    <button class="aceptar btn-primary-small">Aceptar</button>
                    <button class="rechazar btn-secondary-small">Rechazar</button>
                </div>
            `;

            div.querySelector(".aceptar").onclick = async () => {
                await fetch(`/api/solicitudes/${s.id}`, { method: "PUT" });
                cargarSolicitudes();
                cargarEmprendedores();
            };

            div.querySelector(".rechazar").onclick = async () => {
                await fetch(`/api/solicitudes/rechazar/${s.id}`, { method: "PUT" });
                cargarSolicitudes();
            };

            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error solicitudes:", error);
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