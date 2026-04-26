async function cargarChats() {
    try {
        const res = await fetch('/api/emprendedores');
        const usuarios = await res.json();

        const chatList = document.querySelector(".chat-list");
        chatList.innerHTML = "<h3>Chats</h3>";

        // CAMBIO: Usamos for...of para poder usar await dentro del bucle
        for (const user of usuarios) {
            
            if (String(user.id_emprendedor) === String(miId)) continue;

            // NUEVA VALIDACIÓN: Solo si el chat está permitido (amistad aceptada)
            const resPermiso = await fetch(`/api/chat-permitido/${miId}/${user.id_emprendedor}`);
            const dataPermiso = await resPermiso.json();

            if (dataPermiso.permitido) {
                const div = document.createElement("div");
                div.classList.add("chat-item");
                div.setAttribute("data-id", user.id_emprendedor);

                div.innerHTML = `
                    <img src="https://via.placeholder.com/40" class="chat-avatar">
                    <div>
                        <span class="chat-name">${user.nombre}</span>
                        <span class="chat-preview">Haz clic para chatear</span>
                    </div>
                `;

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



// Simulación de mensajes para la interfaz de chat
const miId = localStorage.getItem("id_emprendedor");
console.log("Mi ID:", miId);
let receptorId = null;

const chatHeader = document.querySelector(".chat-header h4");
const chatMessages = document.getElementById("chatMessages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Función para formatear la fecha de manera amigable
function formatearFechaAmigable(fechaIso) {
    const fechaMensaje = new Date(fechaIso);
    const ahora = new Date();
    
    // Quitamos horas para comparar solo los días
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

            // CAMBIO: Formatear la fecha y hora
            const fechaObj = new Date(msg.fecha);
            const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // CAMBIO: Usar innerHTML para meter el texto y la hora
            div.innerHTML = `
                <div class="msg-text">${msg.mensaje}</div>
                <span class="msg-time" style="font-size: 0.7rem; opacity: 0.7; display: block; text-align: right; margin-top: 4px;">
                    ${hora}
                </span>
            `;

            chatMessages.appendChild(div);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error("Error cargando mensajes:", error);
    }
}


// Enviar mensaje

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

        await renderMensajes();

    } catch (error) {
        console.error("Error enviando mensaje:", error);
    }
}

// Cargar chats al iniciar
document.addEventListener("DOMContentLoaded", async () => {
    await cargarChats();
});

// 🔥 ACTUALIZA MENSAJES AUTOMÁTICAMENTE
setInterval(() => {
    if (receptorId) {
        renderMensajes();
    }
}, 3000);

if (sendBtn) {
    sendBtn.addEventListener("click", enviarMensaje);
}

if (input) {
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") enviarMensaje();
    });
}