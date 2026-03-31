document.addEventListener("DOMContentLoaded", () => {

 // --- 0. PONER NOMBRE EN EL SIDEBAR ---
    const sidebarTitulo = document.querySelector(".sidebar h2");
    const nombreUsuario = localStorage.getItem("usuarioNombre");

    if (sidebarTitulo && nombreUsuario) {
        // Ponemos la primera letra en mayúscula
        const nombreFormateado = nombreUsuario.charAt(0).toUpperCase() + nombreUsuario.slice(1);

        // Cambiamos el texto por el nombre formateado
        sidebarTitulo.innerText = nombreFormateado;

        // Le aplicamos el color verde de tu marca
        sidebarTitulo.style.color = "#22c55e";
    }

    // --- 1. LÓGICA DE LOGIN ---
    const loginForm = document.getElementById("login_formulario");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const datos = Object.fromEntries(formData.entries());

            try {
                const respuesta = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    // 1. Guardamos el nombre en la memoria del navegador
                    localStorage.setItem("usuarioNombre", resultado.nombre);
                    alert("¡Bienvenido a Conecta Emprendedores!");
                    window.location.href = "main.html";
                } else {
                    alert("Error: " + (resultado.mensaje || resultado.error));
                }
            } catch (error) {
                console.error("Error de conexión:", error);
                alert("No se pudo conectar con el servidor.");
            }
        }); // Cierre del loginForm
    }

    // --- 2. LÓGICA DEL MENÚ (SIDEBAR) ---
    window.toggleMenu = function() {
        const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.toggle("active");
        }
    };

    // --- 3. CERRAR SESIÓN ---
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioNombre");
            window.location.href = "../pages/login.html";
        });
    }
});