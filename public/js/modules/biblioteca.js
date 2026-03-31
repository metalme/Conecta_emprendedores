
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
