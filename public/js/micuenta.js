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
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
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

