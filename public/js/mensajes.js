// ==========================================
// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
// ==========================================
const miId = localStorage.getItem("id_emprendedor");
let receptorId = null;

console.log("Mi ID configurado:", miId);

// Referencias del DOM
const chatHeader = document.querySelector(".chat-header h4");
const chatMessages = document.getElementById("chatMessages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Redirección de seguridad si no hay sesión iniciada
if (!miId) {
    console.warn("No se detectó ID de usuario. Redirigiendo...");
    window.location.href = "login.html";
}


// ==========================================
// 2. FUNCIONES DE CARGA Y RENDERIZADO
// ==========================================

/**
 * Obtiene la lista completa de emprendedores y filtra aquellos que 
 * tienen una conexión de amistad/negocio aceptada.
 */
async function cargarChats() {
    try {
        const res = await fetch('/api/emprendedores');
        const usuarios = await res.json();

        const chatList = document.querySelector(".chat-list");
        chatList.innerHTML = "<h3>Chats</h3>";

        // Iteración síncrona controlada para resolver las peticiones fetch de permisos una a una
        for (const user of usuarios) {
            
            // Saltarse a uno mismo en la lista
            if (String(user.id_emprendedor) === String(miId)) continue;

            // Validación de conexión aceptada en el servidor
            const resPermiso = await fetch(`/api/chat-permitido/${miId}/${user.id_emprendedor}`);
            const dataPermiso = await resPermiso.json();

            if (dataPermiso.permitido) {
                const div = document.createElement("div");
                div.classList.add("chat-item");
                div.setAttribute("data-id", user.id_emprendedor);

                div.innerHTML = `
                    <div class="chat-item-content">
                        <img src="https://via.placeholder.com/40" class="chat-avatar">
                        <div class="chat-info">
                            <span class="chat-name">${user.nombre}</span>
                            <span class="chat-preview">Haz clic para chatear</span>
                        </div>
                        <button class="btn-perfil-mini" onclick="event.stopPropagation(); window.location.href='/pages/perfil.html?id=${user.id_emprendedor}'">
                            <i class="fa-solid fa-user"></i>
                        </button>
                    </div>
                `;

                // Evento para seleccionar la conversación
                div.addEventListener("click", () => {
                    document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
                    div.classList.add("active");
                    
                    receptorId = user.id_emprendedor;
                    chatHeader.textContent = user.nombre;
                    renderMensajes();
                });

                chatList.appendChild(div);
            }
        }

    } catch (error) {
        console.error("Error cargando chats:", error);
    }
}

/**
 * Trae el historial de mensajes de la base de datos y lo dibuja en pantalla
 */
async function renderMensajes() {
    if (!receptorId || !miId) return;

    try {
        const res = await fetch(`/api/mensajes/${miId}/${receptorId}`);
        const data = await res.json();

        chatMessages.innerHTML = "";

        data.forEach(msg => {
            const div = document.createElement("div");
            const esMio = String(msg.emisor_id) === String(miId);
            div.classList.add("message", esMio ? "sent" : "received");

            // CONECTADO: Usamos tu función inteligente de fechas para que diga "Hoy", "Ayer", etc.
            const fechaAmigable = formatearFechaAmigable(msg.fecha);

            div.innerHTML = `
                <div class="msg-text">${msg.mensaje}</div>
                <span class="msg-time" style="font-size: 0.7rem; opacity: 0.7; display: block; text-align: right; margin-top: 4px;">
                    ${fechaAmigable}
                </span>
            `;

            chatMessages.appendChild(div);
        });

        // Autoscroll hacia el último mensaje enviado o recibido
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error("Error cargando mensajes:", error);
    }
}

/**
 * Envía un mensaje de texto al receptor seleccionado
 */
async function enviarMensaje() {
    const texto = input.value.trim();

    if (!texto || !receptorId || !miId) return;

    try {
        await fetch('/api/mensajes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emisor_id: miId,
                receptor_id: receptorId,
                mensaje: texto
            })
        });

        input.value = "";
        await renderMensajes(); // Render inmediato local

    } catch (error) {
        console.error("Error enviando mensaje:", error);
    }
}


// ==========================================
// 3. UTILIDADES / FORMATEADORES
// ==========================================

/**
 * Transforma marcas de tiempo ISO en textos limpios como "Hoy 14:30" o "Ayer 09:15"
 */
function formatearFechaAmigable(fechaIso) {
    const fechaMensaje = new Date(fechaIso);
    const ahora = new Date();
    
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    
    const fechaComparar = new Date(fechaMensaje.getFullYear(), fechaMensaje.getMonth(), fechaMensaje.getDate());
    const hora = fechaMensaje.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (fechaComparar.getTime() === hoy.getTime()) {
        return `Hoy ${hora}`;
    } else if (fechaComparar.getTime() === ayer.getTime()) {
        return `Ayer ${hora}`;
    } else {
        const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return `${fechaMensaje.toLocaleDateString(undefined, opcionesFecha)} ${hora}`;
    }
}

/**
 * Consulta el total de notificaciones sin leer para pintar el número rojo del menú
 */
function actualizarContadorDesdeMensajes() {
    if (!miId) return;
    fetch(`/api/conteo-notificaciones/${miId}`)
        .then(res => res.json())
        .then(data => {
            const contador = document.getElementById("contador");
            if (contador) {
                contador.textContent = data.pendientes;
                contador.style.display = data.pendientes > 0 ? "inline-block" : "none";
            }
        })
        .catch(err => console.error("Error al actualizar contador desde mensajes:", err));
}


// ==========================================
// 4. EVENTOS GLOBALES E INTERVALOS
// ==========================================

// Inicializar elementos al cargar el documento HTML
document.addEventListener("DOMContentLoaded", async () => {
    await cargarChats();
    actualizarContadorDesdeMensajes();
});

// Eventos de teclado y click para enviar mensajes
if (sendBtn) {
    sendBtn.addEventListener("click", enviarMensaje);
}

if (input) {
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") enviarMensaje();
    });
}

// Polling de Mensajes: Actualiza el chat abierto cada 3 segundos
setInterval(() => {
    if (receptorId) {
        renderMensajes();
    }
}, 3000);

// Polling de Notificaciones: Revisa si hay nuevas solicitudes globales cada 10 segundos
setInterval(actualizarContadorDesdeMensajes, 10000);