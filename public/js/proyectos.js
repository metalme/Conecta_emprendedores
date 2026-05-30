document.addEventListener("DOMContentLoaded", () => {
    const nombreUsuario = localStorage.getItem("usuarioNombre");
    const sidebarTitulo = document.querySelector(".sidebar h2");
    const nombreSidebar = document.querySelector(".usuarioNombre");

    if (nombreUsuario) {
        const nombreFormateado = nombreUsuario.charAt(0).toUpperCase() + nombreUsuario.slice(1);

        if (sidebarTitulo) {
            sidebarTitulo.innerText = nombreFormateado;
            sidebarTitulo.style.color = "#22c55e";
        }

        if (nombreSidebar) {
            nombreSidebar.innerText = nombreFormateado;
        }
    }

    const buscador = document.getElementById("buscadorProyectos");
    const botonesFiltro = document.querySelectorAll(".filter-btn");
    const tarjetas = document.querySelectorAll(".project-card");
    let filtroActivo = "todos";

    function aplicarFiltros() {
        const texto = buscador ? buscador.value.trim().toLowerCase() : "";

        tarjetas.forEach((tarjeta) => {
            const coincideEstado =
                filtroActivo === "todos" || tarjeta.dataset.status === filtroActivo;
            const coincideTexto =
                !texto || tarjeta.dataset.search.includes(texto);

            tarjeta.hidden = !(coincideEstado && coincideTexto);
        });
    }

    botonesFiltro.forEach((boton) => {
        boton.addEventListener("click", () => {
            botonesFiltro.forEach((item) => item.classList.remove("active"));
            boton.classList.add("active");
            filtroActivo = boton.dataset.filter;
            aplicarFiltros();
        });
    });

    if (buscador) {
        buscador.addEventListener("input", aplicarFiltros);
    }
});

function logout() {
    localStorage.removeItem("usuarioNombre");
    localStorage.removeItem("id_emprendedor");
    localStorage.removeItem("nombre_usuario");
    window.location.href = "/pages/login.html";
}
