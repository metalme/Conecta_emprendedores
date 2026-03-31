document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('id_emprendedor');
    const form = document.getElementById('form-mi-cuenta');
    const msjDiv = document.getElementById('mensaje-respuesta');

    // 1. Verificación de Seguridad
    if (!usuarioId || usuarioId === "null") {
        alert("Sesión no válida. Redirigiendo...");
        window.location.href = 'login.html';
        return;
    }

    // 2. Cargar datos actuales desde el servidor
    fetch(`http://localhost:3000/api/emprendedores/${usuarioId}`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo obtener la información");
            return response.json();
        })
        .then(data => {
            // Llenamos los inputs con la info de la DB
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('correo').value = data.correo || '';
            document.getElementById('telefono').value = data.telefono || '';
            // La contraseña no se muestra por seguridad, se deja vacía para cambio
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje("Error al conectar con el perfil", false);
        });

    // 3. Escuchar el envío del formulario para ACTUALIZAR
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosActualizados = {
            nombre: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            password: document.getElementById('password').value // Si está vacío, el servidor debe manejarlo
        };

        try {
            const response = await fetch(`http://localhost:3000/api/emprendedores/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            const result = await response.json();

            if (response.ok) {
                mostrarMensaje("✅ " + result.mensaje, true);
                localStorage.setItem('nombre_usuario', datosActualizados.nombre);
            } else {
                mostrarMensaje("❌ " + result.error, false);
            }
        } catch (error) {
            mostrarMensaje("❌ Error de conexión con el servidor", false);
        }
    });

    // Función auxiliar para mostrar mensajes elegantes
    function mostrarMensaje(texto, esExito) {
        msjDiv.textContent = texto;
        msjDiv.style.color = esExito ? '#22c55e' : '#ef4444'; // Colores de tu Home
        msjDiv.style.marginTop = '15px';
        msjDiv.style.fontWeight = 'bold';
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => { msjDiv.textContent = ""; }, 3500);
    }
});