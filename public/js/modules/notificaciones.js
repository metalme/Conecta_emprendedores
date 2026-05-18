const lista = document.getElementById("listaNotificaciones");
const tabs = document.querySelectorAll(".tab");
const idUsuario = localStorage.getItem('id_emprendedor'); 

let notificaciones = [];

// Redirigir al login si el usuario no ha iniciado sesión
if (!idUsuario) {
    window.location.href = "login.html";
}

// 1. CARGAR DATOS DESDE EL SERVIDOR
function cargarNotificaciones() {
    fetch(`/api/notificaciones/${idUsuario}`)
        .then(res => res.json())
        .then(data => {
            notificaciones = data;
            const tabActiva = document.querySelector(".tab.active");
            renderizar(tabActiva ? tabActiva.dataset.tab : "todas");
            actualizarContadorMenu();
        })
        .catch(err => console.error("Error al obtener notificaciones:", err));
}

// 2. PINTAR LAS NOTIFICACIONES EN EL HTML
function renderizar(filtro = "todas") {
    lista.innerHTML = "";

    let filtradas = notificaciones.filter(n => {
        if (filtro === "todas") return true;
        return n.type === filtro || n.tipo === filtro; 
    });

    if (filtradas.length === 0) {
        lista.innerHTML = `<p class="vacio">No tienes notificaciones en esta categoría.</p>`;
        return;
    }

    filtradas.forEach(n => {
        const div = document.createElement("div");
        div.className = `notificacion ${!n.leida ? "no-leida" : ""}`;

        let botones = "";
        
        // CORRECCIÓN CLAVE: Si la base de datos vincula la solicitud usa ese ID, si no, usa el de la notificación
        const idTransaccion = n.id_solicitud_vinculada || n.id_notificacion;

        if (n.tipo === "amistad" || n.tipo === "solicitud") {
            botones = `
                <button class="btn aceptar" data-id="${idTransaccion}">Aceptar</button>
                <button class="btn rechazar" data-id="${idTransaccion}">Rechazar</button>
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
                    .then(() => cargarNotificaciones());
            });
        }

        // EVENTO: Aceptar Solicitud
        const btnAceptar = div.querySelector(".aceptar");
        if (btnAceptar) {
            btnAceptar.addEventListener("click", () => {
                fetch(`/api/solicitudes/${idTransaccion}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'aceptar' })
                })
                .then(() => {
                    // Automáticamente la marca como leída para que desaparezca del contador
                    fetch(`/api/notificaciones/leida/${n.id_notificacion}`, { method: 'PUT' })
                        .then(() => cargarNotificaciones());
                });
            });
        }

        // EVENTO: Rechazar Solicitud
        const btnRechazar = div.querySelector(".rechazar");
        if (btnRechazar) {
            btnRechazar.addEventListener("click", () => {
                fetch(`/api/solicitudes/${idTransaccion}`, {
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

// 3. ACTUALIZAR EL CONTADOR ROJO DEL SIDEBAR (Aquí se cortaba tu código anterior)
function actualizarContadorMenu() {
    fetch(`/api/conteo-notificaciones/${idUsuario}`)
        .then(res => res.json())
        .then(data => {
            const contador = document.getElementById("contador");
            if (contador) {
                contador.textContent = data.pendientes;
                // Si no hay notificaciones, esconde el círculo rojo
                contador.style.display = data.pendientes > 0 ? "inline-block" : "none";
            }
        })
        .catch(err => console.error("Error al actualizar el contador:", err));
}

// 4. INTERRUPTORES DE LAS PESTAÑAS (Tabs)
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        renderizar(tab.dataset.tab);
    });
});

// Inicializar la carga cuando la página esté lista
document.addEventListener("DOMContentLoaded", () => {
    cargarNotificaciones();
});