document.addEventListener("DOMContentLoaded", async () => {
    normalizarMarcaSidebar();
    pintarSidebarDesdeLocalStorage();

    await cargarPerfilSidebar();

    document.querySelectorAll(".btn-logout, .salir, .logout")
        .forEach((boton) => {
            boton.addEventListener("click", cerrarSesion);
        });
});

function normalizarMarcaSidebar() {
    document.querySelectorAll(".logo-area, .logo")
        .forEach((contenedor) => {
            const textoMarca = contenedor.querySelector("p, span");

            if (textoMarca) {
                textoMarca.innerHTML = "Conecta<br>Emprendedores";
            }
        });
}

function pintarSidebarDesdeLocalStorage() {
    const nombreUsuario = localStorage.getItem("usuarioNombre") || localStorage.getItem("nombre_usuario");

    if (nombreUsuario) {
        pintarNombreSidebar(nombreUsuario);
    }
}

async function cargarPerfilSidebar() {
    const idEmprendedor = localStorage.getItem("id_emprendedor");

    if (!idEmprendedor) return;

    try {
        const response = await fetch(`/api/perfil/${idEmprendedor}`);
        if (!response.ok) return;

        const perfil = await response.json();

        if (perfil.nombre) {
            localStorage.setItem("usuarioNombre", perfil.nombre);
            localStorage.setItem("nombre_usuario", perfil.nombre);
            pintarNombreSidebar(perfil.nombre);
        }

        if (perfil.foto_perfil) {
            pintarFotoSidebar(perfil.foto_perfil);
        }
    } catch (error) {
        console.error("Error al cargar perfil del sidebar:", error);
    }
}

function pintarNombreSidebar(nombre) {
    const nombreFormateado = nombre.charAt(0).toUpperCase() + nombre.slice(1);

    document.querySelectorAll(".usuarioNombre, .user-name, .user-profile-sidebar p, .perfil h3")
        .forEach((elemento) => {
            elemento.textContent = nombreFormateado;
        });
}

function pintarFotoSidebar(fotoUrl) {
    document.querySelectorAll(".user-profile-sidebar img, .user-avatar")
        .forEach((imagen) => {
            if (imagen.tagName === "IMG") {
                imagen.src = fotoUrl;
            }
        });

    document.querySelectorAll(".foto")
        .forEach((contenedorFoto) => {
            contenedorFoto.style.backgroundImage = `url("${fotoUrl}")`;
            contenedorFoto.style.backgroundSize = "cover";
            contenedorFoto.style.backgroundPosition = "center";
        });
}

function cerrarSesion() {
    localStorage.removeItem("usuarioNombre");
    localStorage.removeItem("nombre_usuario");
    localStorage.removeItem("id_emprendedor");
    window.location.href = "/pages/login.html";
}

window.logout = cerrarSesion;
