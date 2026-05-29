const lista = document.getElementById("listaNotificaciones");
const tabs = document.querySelectorAll(".tab");

const idUsuario = localStorage.getItem("id_emprendedor");

let notificaciones = [];


// ======================================
// VALIDAR SESIÓN
// ======================================

if (!idUsuario) {
    window.location.href = "login.html";
}


// ======================================
// CARGAR NOTIFICACIONES
// ======================================

function cargarNotificaciones() {

    fetch(`/api/notificaciones/${idUsuario}`)

        .then(res => res.json())

        .then(data => {

            notificaciones = data;

            const tabActiva =
                document.querySelector(".tab.active");

            renderizar(
                tabActiva
                    ? tabActiva.dataset.tab
                    : "todas"
            );

            actualizarContadorMenu();
        })

        .catch(err => {

            console.error(
                "Error al obtener notificaciones:",
                err
            );
        });
}


// ======================================
// RENDERIZAR
// ======================================

function renderizar(filtro = "todas") {

    lista.innerHTML = "";

    const filtradas = notificaciones.filter(n => {

        if (filtro === "todas") {
            return true;
        }

        return n.tipo === filtro;
    });


    if (filtradas.length === 0) {

        lista.innerHTML = `
            <p class="vacio">
                No tienes notificaciones en esta categoría.
            </p>
        `;

        return;
    }


    filtradas.forEach(n => {

        const div = document.createElement("div");

        div.className = `
            notificacion
            ${!n.leida ? "no-leida" : ""}
        `;


        // ======================================
        // ICONOS AUTOMÁTICOS
        // ======================================

        let icono = "fa-bell";

        if (n.tipo === "solicitud") {
            icono = "fa-user-plus";
        }

        if (n.tipo === "mensajes") {
            icono = "fa-envelope";
        }

        if (n.tipo === "noticias") {
            icono = "fa-newspaper";
        }


        // ======================================
        // BOTONES
        // ======================================

        let botones = "";

        const idTransaccion = n.referencia_id;


        if (n.tipo === "solicitud") {

            botones = `
                <button
                    class="btn aceptar"
                    data-id="${idTransaccion}"
                >
                    Aceptar
                </button>

                <button
                    class="btn rechazar"
                    data-id="${idTransaccion}"
                >
                    Rechazar
                </button>
            `;

        } else {

            botones = `
                <button
                    class="btn leer"
                    data-id="${n.id}"
                    ${n.leida ? 'style="display:none;"' : ''}
                >
                    Marcar leída
                </button>
            `;
        }


        // ======================================
        // HTML
        // ======================================

        div.innerHTML = `

            <div class="info">

                <div class="icono">
                    <i class="fa-solid ${icono}"></i>
                </div>

                <div class="textos">

                    <span class="tipo">
                        ${n.tipo.toUpperCase()}
                    </span>

                    <span class="mensaje">
                        ${n.contenido}
                    </span>

                    <span class="fecha">
                        ${n.fecha}
                    </span>

                </div>

            </div>

            <div class="botones">
                ${botones}
            </div>
        `;


        // ======================================
        // MARCAR LEÍDA
        // ======================================

        const btnLeer = div.querySelector(".leer");

        if (btnLeer) {

            btnLeer.addEventListener("click", () => {

                fetch(
                    `/api/notificaciones/leida/${n.id}`,
                    {
                        method: "PUT"
                    }
                )

                .then(() => {
                    cargarNotificaciones();
                });
            });
        }


        // ======================================
        // ACEPTAR SOLICITUD
        // ======================================

        const btnAceptar =
            div.querySelector(".aceptar");

        if (btnAceptar) {

            btnAceptar.addEventListener("click", () => {

                fetch(
                    `/api/solicitudes/${idTransaccion}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                            "application/json"
                        },

                        body: JSON.stringify({
                            accion: "aceptar"
                        })
                    }
                )

                .then(() => {

                    fetch(
                        `/api/notificaciones/leida/${n.id}`,
                        {
                            method: "PUT"
                        }
                    )

                    .then(() => {
                        cargarNotificaciones();
                    });
                });
            });
        }


        // ======================================
        // RECHAZAR SOLICITUD
        // ======================================

        const btnRechazar =
            div.querySelector(".rechazar");

        if (btnRechazar) {

            btnRechazar.addEventListener("click", () => {

                fetch(
                    `/api/solicitudes/${idTransaccion}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                            "application/json"
                        },

                        body: JSON.stringify({
                            accion: "rechazar"
                        })
                    }
                )

                .then(() => {

                    fetch(
                        `/api/notificaciones/leida/${n.id}`,
                        {
                            method: "PUT"
                        }
                    )

                    .then(() => {
                        cargarNotificaciones();
                    });
                });
            });
        }


        lista.appendChild(div);

    });
}


// ======================================
// CONTADOR ROJO
// ======================================

function actualizarContadorMenu() {

    fetch(
        `/api/conteo-notificaciones/${idUsuario}`
    )

    .then(res => res.json())

    .then(data => {

        const contador =
            document.getElementById("contador");

        if (contador) {

            contador.textContent =
                data.pendientes;

            contador.style.display =
                data.pendientes > 0
                    ? "inline-block"
                    : "none";
        }
    })

    .catch(err => {

        console.error(
            "Error actualizando contador:",
            err
        );
    });
}


// ======================================
// TABS
// ======================================

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => {
            t.classList.remove("active");
        });

        tab.classList.add("active");

        renderizar(tab.dataset.tab);
    });
});


// ======================================
// INICIAR
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        cargarNotificaciones();
    }
);