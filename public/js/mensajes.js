// Simulación de mensajes para la interfaz de chat
const miId = localStorage.getItem("id_emprendedor");
console.log("Mi ID:", miId);




// Datos simulados (como si vinieran de backend)
const chats = {
    "Carlos Inversionista": [
        { tipo: "received", texto: "Hola, vi tu proyecto 👀" },
        { tipo: "sent", texto: "¡Genial! ¿Qué te pareció?" }
    ],
    "Laura Emprendedora": [
        { tipo: "received", texto: "Te envié el pitch 📄" },
        { tipo: "sent", texto: "Perfecto, ya lo reviso" }
    ]
};

const chatItems = document.querySelectorAll(".chat-item");
const chatHeader = document.querySelector(".chat-header h4");
const chatMessages = document.getElementById("chatMessages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let chatActual = "Carlos Inversionista";

/* --- CAMBIAR DE CHAT --- */
chatItems.forEach(item => {
    item.addEventListener("click", () => {

        // quitar active a todos
        chatItems.forEach(i => i.classList.remove("active"));

        // activar el seleccionado
        item.classList.add("active");

        // obtener nombre
        const nombre = item.querySelector(".chat-name").textContent;
        chatActual = nombre;
        receptorId = item.getAttribute("data-id");
        console.log("Receptor ID:", receptorId);

        // cambiar header
        chatHeader.textContent = nombre;

        // cargar mensajes
        renderMensajes();
    });
});

// Variable para almacenar el ID del receptor
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

            div.textContent = msg.mensaje;

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

// Cargar mensajes del primer chat al iniciar
document.addEventListener("DOMContentLoaded", () => {
    const firstChat = document.querySelector(".chat-item");
    if (firstChat) firstChat.click();
});

sendBtn.addEventListener("click", enviarMensaje);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensaje();
});