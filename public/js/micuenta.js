// --- CARGAR DATOS AL INICIAR ---
document.addEventListener('DOMContentLoaded', async () => {
    const idEmprendedor = localStorage.getItem('id_emprendedor');

    if (!idEmprendedor) {
        alert("Sesión no válida. Por favor, inicia sesión de nuevo.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`/api/perfil/${idEmprendedor}`);
        


        if (response.ok) {
            const datos = await response.json();
            if(document.getElementById('nombre')) document.getElementById('nombre').value = datos.nombre;
            if(document.getElementById('correo')) document.getElementById('correo').value = datos.correo;
            if(document.getElementById('telefono')) document.getElementById('telefono').value = datos.telefono;

// ===============================
// CARGAR INFORMACIÓN EXTRA
// ===============================

if (datos.experiencia_titulo) {
    document.getElementById('titulo-enfoque').innerText =
        datos.experiencia_titulo;
}

if (datos.experiencia_subtitulo) {
    document.getElementById('subtitulo1').innerText =
        datos.experiencia_subtitulo;
}

if (datos.enfoque_colaborativo) {
    document.getElementById('texto1').innerText =
        datos.enfoque_colaborativo;
}

if (datos.enfoque_iterativo) {
    document.getElementById('texto2').innerText =
        datos.enfoque_iterativo;
}

if (datos.estadistica_1_titulo) {
    document.getElementById('stat1-titulo').innerText =
        datos.estadistica_1_titulo;
}

if (datos.estadistica_1_texto) {
    document.getElementById('stat1-texto').innerText =
        datos.estadistica_1_texto;
}

if (datos.estadistica_2_titulo) {
    document.getElementById('stat2-titulo').innerText =
        datos.estadistica_2_titulo;
}

if (datos.estadistica_2_texto) {
    document.getElementById('stat2-texto').innerText =
        datos.estadistica_2_texto;
}

if (datos.estadistica_3_titulo) {
    document.getElementById('stat3-titulo').innerText =
        datos.estadistica_3_titulo;
}

if (datos.estadistica_3_texto) {
    document.getElementById('stat3-texto').innerText =
        datos.estadistica_3_texto;
}

// ===============================
// CARGAR DESCRIPCIÓN HERO
// ===============================

const heroDescripcion = document.getElementById('hero-descripcion');

if (heroDescripcion) {

    // Si existe en BD usamos esa
    if (datos.descripcion) {

        heroDescripcion.innerText = datos.descripcion;

    } else {

        // Si no existe en BD usamos localStorage
        const descripcionGuardada =
            localStorage.getItem('hero_descripcion');

        if (descripcionGuardada) {

            heroDescripcion.innerText =
                descripcionGuardada;
        }
    }
}


       
       // === NUEVA LÓGICA PARA EL SALUDO HERO ===
            const heroNombre = document.getElementById('hero-nombre-usuario');
            if (heroNombre && datos.nombre) {
                // Separamos el nombre por espacios para mostrar solo el primer nombre (opcional)
                const primerNombre = datos.nombre.split(' ')[0]; 
                // Formateamos la primera letra en mayúscula
                heroNombre.innerText = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1);
            }
       
if (datos.foto_perfil) {
        const imgHero = document.getElementById('user-profile-img'); // Usa el ID del HTML
        const imgSidebar = document.querySelector('.user-profile-sidebar img'); // Busca la imagen del sidebar
        
        if (imgHero) imgHero.src = datos.foto_perfil;
        if (imgSidebar) imgSidebar.src = datos.foto_perfil;
            }
    }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
});

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

    const heroNombreJS = document.getElementById('hero-nombre-usuario');
if (heroNombreJS && nombreUsuario) {
    const primerNombre = nombreUsuario.split(' ')[0];
    heroNombreJS.innerText = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1);
}

// --- ACTUALIZAR DATOS AL ENVIAR FORMULARIO ---
const formulario = document.getElementById('form-mi-cuenta');

if (formulario) {
    formulario.addEventListener('submit', async (e) => {

        e.preventDefault();

        const id = localStorage.getItem('id_emprendedor');
        const nombre = document.getElementById('nombre').value;
        const telefono = document.getElementById('telefono').value;

        try {

            const response = await fetch('/api/emprendedores/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, telefono })
            });

            if (response.ok) {
                alert("¡Datos actualizados correctamente! ✨");
            } else {
                alert("Hubo un error al actualizar");
            }

        } catch (error) {

            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor");

        }
    });
}

// --- FUNCIÓN PARA CERRAR SESIÓN ---
const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion'); // O usa el ID que tenga tu botón

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        // 1. Borramos los datos guardados
        localStorage.removeItem('id_emprendedor');
        localStorage.removeItem('nombre_usuario'); // Si guardaste el nombre también
        
        // 2. Opcional: Limpiar todo el storage por seguridad
        localStorage.clear();

        // 3. Redirigir al login
        alert("Has cerrado sesión correctamente.");
        window.location.href = 'login.html'; 
    });
}
// --- FUNCIÓN PARA CERRAR SESIÓN ---
function logout() {
    // 1. Confirmación opcional para el usuario
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        
        // 2. Limpiamos los datos del almacenamiento local
        localStorage.removeItem('id_emprendedor');
        
        // 3. (Opcional) Limpiamos todo para no dejar rastro
        localStorage.clear();

        // 4. Redirigimos al usuario al login
        window.location.href = 'login.html'; 
    }
}

// --- ACTUALIZAR CONTRASEÑA (Seguridad) ---
async function cambiarPassword() {
    // 1. Obtenemos el ID del usuario que inició sesión
    const id = localStorage.getItem('id_emprendedor');
    
    // 2. Capturamos lo que escribió en el cuadro de contraseña
    // (Asegúrate de que en tu HTML el input tenga id="password")
    const nuevaPassword = document.getElementById('password').value;

    // 3. Validamos que la contraseña sea segura (mínimo 6 caracteres)
    if (nuevaPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    try {
        // 4. Enviamos la nueva clave a la ruta que acabas de crear en tu server.js
        const response = await fetch(`/api/perfil/password/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: nuevaPassword })
        });

        if (response.ok) {
            alert("¡Contraseña actualizada con éxito! 🛡️");
            document.getElementById('password').value = ""; // Limpiamos el cuadro para que no se quede ahí escrita
        } else {
            alert("Hubo un error al actualizar la contraseña");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}






// --- 📸 ESCUCHAR Y SUBIR NUEVA FOTO DE PERFIL ---
const inputFoto = document.getElementById('input-foto-perfil');

if (inputFoto) {
    inputFoto.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const idEmprendedor = localStorage.getItem('id_emprendedor');
        const formData = new FormData();
        formData.append('foto', file);

        try {
            const response = await fetch(`/api/perfil/foto/${idEmprendedor}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                const resultado = await response.json();
                alert(resultado.mensaje);

                // === ACTUALIZACIÓN INMEDIATA USANDO TUS SELECTORES ===
                const imgHero = document.getElementById('user-profile-img');
                const imgSidebar = document.querySelector('.user-profile-sidebar img');
                
                if (imgHero) imgHero.src = resultado.foto;
                if (imgSidebar) imgSidebar.src = resultado.foto;
            } else {
                alert("Error al subir la imagen en el servidor.");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}

// ===============================
// EDITAR DESCRIPCIÓN HERO
// ===============================

async function editarDescripcion() {

    const descripcionElemento =
        document.getElementById('hero-descripcion');

    const descripcionActual =
        descripcionElemento.innerText;

    const nuevaDescripcion = prompt(
        "Escribe tu nueva descripción profesional:",
        descripcionActual
    );

    if (!nuevaDescripcion ||
        nuevaDescripcion.trim() === "") {
        return;
    }

    try {

        const id =
            localStorage.getItem('id_emprendedor');

        const response = await fetch(
            `/api/perfil/descripcion/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    descripcion: nuevaDescripcion
                })
            }
        );

        if (response.ok) {

            descripcionElemento.innerText =
                nuevaDescripcion;

            alert("Descripción actualizada ✨");

        } else {

            alert("Error al guardar descripción");

        }

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar al servidor");
    }
}

// ===============================
// EDITAR INFORMACIÓN EXTRA
// ===============================

async function editarInfoExtra() {

    const id = localStorage.getItem('id_emprendedor');

    const titulo_enfoque = prompt(
        "Título principal:",
        document.getElementById('titulo-enfoque').innerText
    );

    if (titulo_enfoque === null) return;

    const subtitulo1 = prompt(
        "Primer subtítulo:",
        document.getElementById('subtitulo1').innerText
    );

    const texto1 = prompt(
        "Primer texto:",
        document.getElementById('texto1').innerText
    );

    const subtitulo2 = prompt(
        "Segundo subtítulo:",
        document.getElementById('subtitulo2').innerText
    );

    const texto2 = prompt(
        "Segundo texto:",
        document.getElementById('texto2').innerText
    );

    const stat1_titulo = prompt(
        "Stat 1 título:",
        document.getElementById('stat1-titulo').innerText
    );

    const stat1_texto = prompt(
        "Stat 1 texto:",
        document.getElementById('stat1-texto').innerText
    );

    const stat2_titulo = prompt(
        "Stat 2 título:",
        document.getElementById('stat2-titulo').innerText
    );

    const stat2_texto = prompt(
        "Stat 2 texto:",
        document.getElementById('stat2-texto').innerText
    );

    const stat3_titulo = prompt(
        "Stat 3 título:",
        document.getElementById('stat3-titulo').innerText
    );

    const stat3_texto = prompt(
        "Stat 3 texto:",
        document.getElementById('stat3-texto').innerText
    );

    try {

        const response = await fetch(`/api/info-extra/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titulo_enfoque,
                subtitulo1,
                texto1,
                subtitulo2,
                texto2,
                stat1_titulo,
                stat1_texto,
                stat2_titulo,
                stat2_texto,
                stat3_titulo,
                stat3_texto
            })
        });

        if (response.ok) {

            document.getElementById('titulo-enfoque').innerText =
                titulo_enfoque;

            document.getElementById('subtitulo1').innerText =
                subtitulo1;

            document.getElementById('texto1').innerText =
                texto1;

            document.getElementById('subtitulo2').innerText =
                subtitulo2;

            document.getElementById('texto2').innerText =
                texto2;

            document.getElementById('stat1-titulo').innerText =
                stat1_titulo;

            document.getElementById('stat1-texto').innerText =
                stat1_texto;

            document.getElementById('stat2-titulo').innerText =
                stat2_titulo;

            document.getElementById('stat2-texto').innerText =
                stat2_texto;

            document.getElementById('stat3-titulo').innerText =
                stat3_titulo;

            document.getElementById('stat3-texto').innerText =
                stat3_texto;

            alert("Información actualizada ✨");

        } else {

            alert("Error al guardar");

        }

    } catch (error) {

        console.error(error);
        alert("Error de conexión");

    }
}