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

        // cambiar header
        chatHeader.textContent = nombre;

        // cargar mensajes
        renderMensajes();
    });
});

/* --- RENDER MENSAJES --- */
function renderMensajes() {
    chatMessages.innerHTML = "";

    chats[chatActual].forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message", msg.tipo);
        div.textContent = msg.texto;
        chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* --- ENVIAR MENSAJE --- */
function enviarMensaje() {
    const texto = input.value.trim();
    if (texto === "") return;

    const nuevoMensaje = { tipo: "sent", texto: texto };

    chats[chatActual].push(nuevoMensaje);

    renderMensajes();

    input.value = "";
}

sendBtn.addEventListener("click", enviarMensaje);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensaje();
});