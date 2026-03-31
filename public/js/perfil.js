// --- CARGAR DATOS AL INICIAR ---
document.addEventListener('DOMContentLoaded', async () => {
    const idEmprendedor = localStorage.getItem('id_emprendedor');

    if (!idEmprendedor) {
        alert("Sesión no válida. Por favor, inicia sesión de nuevo.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/perfil/${idEmprendedor}`);
        
        if (response.ok) {
            const datos = await response.json();
            if(document.getElementById('nombre')) document.getElementById('nombre').value = datos.nombre;
            if(document.getElementById('correo')) document.getElementById('correo').value = datos.correo;
            if(document.getElementById('telefono')) document.getElementById('telefono').value = datos.telefono;
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
});

// --- ACTUALIZAR DATOS AL ENVIAR FORMULARIO ---
const formulario = document.getElementById('form-mi-cuenta');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = localStorage.getItem('id_emprendedor');
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;

    try {
        // La URL ahora coincide con tu server.js: /api/emprendedores/:id
        const response = await fetch('http://localhost:3000/api/emprendedores/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, telefono })
        });

        // La comprobación DEBE estar dentro del bloque try
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
        const response = await fetch(`http://localhost:3000/api/perfil/password/${id}`, {
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
