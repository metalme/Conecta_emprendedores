/**
 * GESTIÓN DE PERFIL - CONECTA EMPRENDEDORES
 * Este script maneja la sincronización entre el DOM y las tablas 
 * 'emprendedores' y 'perfil_emprendedores'.
 */

// Variable global para mantener los datos de diseño en memoria
let datosDiseno = {};

document.addEventListener('DOMContentLoaded', async () => {
    const idEmprendedor = localStorage.getItem('id_emprendedor');

    // 1. Verificación de Seguridad
    if (!idEmprendedor) {
        console.warn("Acceso denegado: No hay ID de emprendedor.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Carga Inicial de Datos
    await inicializarPerfil(idEmprendedor);
});

/**
 * Orquestador de carga de datos
 */
async function inicializarPerfil(id) {
    try {
        // Ejecutamos ambas cargas en paralelo para mayor velocidad
        const [resBasica, resDiseno] = await Promise.all([
            fetch(`/api/perfil/${id}`),
            fetch(`/api/perfil/diseno/${id}`)
        ]);

        if (resBasica.ok) {
            const basica = await resBasica.json();
            llenarFormularioCuenta(basica);
        }

        if (resDiseno.ok) {
            datosDiseno = await resDiseno.json();
            renderizarDiseno(datosDiseno);
        } else {
            console.info("El usuario aún no tiene un registro en perfil_emprendedores.");
            // Aquí podrías poner valores por defecto si la tabla está vacía
        }

    } catch (error) {
        console.error("Error crítico al inicializar perfil:", error);
    }
}

/**
 * Llena los campos del formulario de configuración de cuenta
 */
function llenarFormularioCuenta(datos) {
    if(document.getElementById('nombre')) document.getElementById('nombre').value = datos.nombre || "";
    if(document.getElementById('correo')) document.getElementById('correo').value = datos.correo || "";
    if(document.getElementById('telefono')) document.getElementById('telefono').value = datos.telefono || "";
    
    // Actualizar elementos visuales de la interfaz
    if(document.getElementById('display-nombre')) {
        document.getElementById('display-nombre').innerText = datos.nombre || "Emprendedor";
    }
}

/**
 * Inyecta los datos de la tabla 'perfil_emprendedores' en el HTML
 */
function renderizarDiseno(datos) {
    // Hero
    const hTitulo = document.getElementById('db-hero_titulo');
    const hSub = document.getElementById('db-hero_subtitulo');
    const hImg = document.getElementById('db-hero_imagen');

    if(hTitulo) hTitulo.innerText = datos.hero_titulo || "¡Bienvenido a mi perfil!";
    if(hSub) hSub.innerText = datos.hero_subtitulo || "Haz clic en editar para contar tu historia.";
    if(hImg) hImg.src = datos.hero_imagen || "../img/default-profile.png";

    // Estadísticas
    const containerStats = document.getElementById('container-stats');
    if (containerStats) {
        containerStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid fa-briefcase"></i></div>
                <h4 class="editable" id="db-stat1_valor">${datos.stat1_valor || '0'}</h4>
                <p class="editable" id="db-stat1_texto">${datos.stat1_texto || 'Proyectos'}</p>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid fa-award"></i></div>
                <h4 class="editable" id="db-stat2_valor">${datos.stat2_valor || '0'}</h4>
                <p class="editable" id="db-stat2_texto">${datos.stat2_texto || 'Logros'}</p>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
                <h4 class="editable" id="db-stat3_valor">${datos.stat3_valor || '0'}</h4>
                <p class="editable" id="db-stat3_texto">${datos.stat3_texto || 'Años Exp.'}</p>
            </div>
        `;
    }
}

/**
 * Toggle de edición para las secciones visuales
 */
function gestionarEdicion(sectionId) {
    const seccion = document.getElementById(sectionId);
    const boton = seccion.querySelector('.btn-edit-content');
    const estaEditando = seccion.classList.contains('editable-active');

    if (!estaEditando) {
        // ACTIVAR EDICIÓN
        seccion.classList.add('editable-active');
        seccion.querySelectorAll('.editable').forEach(el => el.contentEditable = true);
        boton.innerHTML = '<i class="fa-solid fa-save"></i> <span>Guardar Cambios</span>';
        boton.style.background = "#10b981"; // Verde éxito
        boton.style.color = "white";
    } else {
        // DESACTIVAR Y GUARDAR
        seccion.classList.remove('editable-active');
        seccion.querySelectorAll('.editable').forEach(el => el.contentEditable = false);
        boton.innerHTML = '<i class="fa-solid fa-pen"></i> <span>Editar Sección</span>';
        boton.style.background = ""; 
        boton.style.color = "";

        // Llamar a la función que hace el PUT a la base de datos
        guardarPerfilDB();
    }
}

/**
 * Envía los datos de diseño a la tabla 'perfil_emprendedores'
 */
async function guardarPerfilDB() {
    const id = localStorage.getItem('id_emprendedor');
    
    // Capturamos el texto directamente del DOM
    const payload = {
        hero_titulo: document.getElementById('db-hero_titulo').innerText,
        hero_subtitulo: document.getElementById('db-hero_subtitulo').innerText,
        hero_imagen: document.getElementById('db-hero_imagen').src,
        stat1_valor: document.getElementById('db-stat1_valor').innerText,
        stat1_texto: document.getElementById('db-stat1_texto').innerText,
        stat2_valor: document.getElementById('db-stat2_valor').innerText,
        stat2_texto: document.getElementById('db-stat2_texto').innerText,
        stat3_valor: document.getElementById('db-stat3_valor').innerText,
        stat3_texto: document.getElementById('db-stat3_texto').innerText
    };

    try {
        const response = await fetch(`/api/perfil/diseno/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            mostrarNotificacion("¡Diseño actualizado correctamente! ✨");
        } else {
            throw new Error("Error en la respuesta del servidor");
        }
    } catch (error) {
        console.error("Error al guardar diseño:", error);
        alert("No se pudo guardar el diseño. Revisa la consola.");
    }
}

/**
 * Manejo del formulario de Datos de Acceso (Tabla emprendedores)
 */
const formCuenta = document.getElementById('form-mi-cuenta');
if (formCuenta) {
    formCuenta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = localStorage.getItem('id_emprendedor');
        const nombre = document.getElementById('nombre').value;
        const telefono = document.getElementById('telefono').value;

        try {
            const response = await fetch(`/api/emprendedores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, telefono })
            });

            if (response.ok) {
                alert("Datos de cuenta actualizados.");
                document.getElementById('display-nombre').innerText = nombre;
            }
        } catch (error) {
            console.error("Error al actualizar cuenta:", error);
        }
    });
}

/**
 * Gestión de Seguridad (Contraseña)
 */
async function cambiarPassword() {
    const id = localStorage.getItem('id_emprendedor');
    const nuevaPassword = document.getElementById('password').value;

    if (nuevaPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    try {
        const response = await fetch(`/api/perfil/password/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: nuevaPassword })
        });

        if (response.ok) {
            alert("Seguridad actualizada. 🛡️");
            document.getElementById('password').value = "";
        }
    } catch (error) {
        console.error("Error de password:", error);
    }
}

/**
 * Previsualización de Imágenes
 */
function previewImagen(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('db-hero_imagen').src = e.target.result;
            // Opcional: Podrías guardar la imagen automáticamente aquí
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Utilidades
 */
function logout() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

function mostrarNotificacion(msj) {
    // Puedes implementar un toast o un simple console/alert
    console.log(msj);
    // Ejemplo rápido:
    const toast = document.createElement('div');
    toast.innerText = msj;
    toast.style = "position:fixed; bottom:20px; right:20px; background:#10b981; color:white; padding:10px 20px; border-radius:5px; z-index:999";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}