

const lista = document.getElementById("listaNotificaciones");
const tabs = document.querySelectorAll(".tab");
const idUsuario = localStorage.getItem('id_emprendedor'); // ID guardado en Login

// Variable global que guardará lo que venga del servidor
let notificaciones = [];

// Redirigir si no está logueado
if (!idUsuario) {
    window.location.href = "login.html";
}

// FUNCIÓN PRINCIPAL: Cargar datos desde el Servidor
function cargarNotificaciones() {
    fetch(`/api/notificaciones/${idUsuario}`)
        .then(res => res.json())
        .then(data => {
            notificaciones = data;
            renderizar(document.querySelector(".tab.active").dataset.tab);
            actualizarContadorMenu();
        })
        .catch(err => console.error("Error al obtener notificaciones:", err));
}

// FUNCIÓN: Pintar los elementos en el HTML
function renderizar(filtro = "todas") {
    lista.innerHTML = "";

    let filtradas = notificaciones.filter(n => {
        if (filtro === "todas") return true;
        return n.type === filtro || n.tipo === filtro; // Valida ambas nomenclaturas
    });

    if (filtradas.length === 0) {
        lista.innerHTML = `<p class="vacio">No tienes notificaciones en esta categoría.</p>`;
        return;
    }

    filtradas.forEach(n => {
        const div = document.createElement("div");
        div.className = `notificacion ${!n.leida ? "no-leida" : ""}`;

        let botones = "";
        // Identificar si requiere acciones de amistad/solicitud
        if (n.tipo === "amistad" || n.tipo === "solicitud") {
            botones = `
                <button class="btn aceptar" data-id="${n.id_notificacion}">Aceptar</button>
                <button class="btn rechazar" data-id="${n.id_notificacion}">Rechazar</button>
            `;
        } else {
            botones = `
                <button class="btn leer" data-id="${n.id_notificacion}" ${n.leida ? 'style="display:none;"' : ''}>
                    Marcar leída
                </button>
            `;
        }

        div.innerHTML = `
            <div class="info">
                <div class="icono">
                    <i class="fa-solid ${n.icono || 'fa-bell'}"></i>
                </div>
                <div class="textos">
                    <span class="tipo">${n.tipo.toUpperCase()}</span>
                    <span class="mensaje">${n.mensaje}</span>
                    <span class="fecha">${n.fecha}</span>
                </div>
            </div>
            <div class="botones">${botones}</div>
        `;

        // EVENTO: Marcar como Leída
        const btnLeer = div.querySelector(".leer");
        if (btnLeer) {
            btnLeer.addEventListener("click", () => {
                fetch(`/api/notificaciones/leida/${n.id_notificacion}`, { method: 'PUT' })
                    .then(() => cargarNotificaciones())
                    .catch(err => console.error(err));
            });
        }

        // EVENTO: Aceptar Solicitud
        const btnAceptar = div.querySelector(".aceptar");
        if (btnAceptar) {
            btnAceptar.addEventListener("click", () => {
                fetch(`/api/solicitudes/${n.id_notificacion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'aceptar' })
                })
                .then(() => {
                    // Marcar leída la notificación de paso
                    fetch(`/api/notificaciones/leida/${n.id_notificacion}`, { method: 'PUT' })
                        .then(() => cargarNotificaciones());
                });
            });
        }

        // EVENTO: Rechazar Solicitud
        const btnRechazar = div.querySelector(".rechazar");
        if (btnRechazar) {
            btnRechazar.addEventListener("click", () => {
                fetch(`/api/solicitudes/${n.id_notificacion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'rechazar' })
                })
                .then(() => {
                    fetch(`/api/notificaciones/leida/${n.id_notificacion}`, { method: 'PUT' })
                        .then(() => cargarNotificaciones());
                });
            });
        }

        lista.appendChild(div);
    });
}

// FUNCIÓN: Actualizar dinámicamente el contador del Sidebar
function actualizarContadorMenu() {
    fetch(`/api/conteo-notificaciones/${idUsuario}`)
        .then(res => res.json())
        .then(data => {
            const contador = document.getElementById("contador");
            if (contador) {
                contador.innerText = data.pendientes;
                contador.style.display = data.pendientes > 0 ? "inline-block" : "none";
            }
        });
}

// Control de las pestañas (Filtros)
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        renderizar(tab.dataset.tab);
    });
});

// Carga Inicial al entrar a la página
cargarNotificaciones();