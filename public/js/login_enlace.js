const formulario = document.getElementById('login_formulario');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formulario);
    const data = Object.fromEntries(formData);

    // VALIDACIÓN
    if (data.password.length < 6) {
        alert("La contraseña debe tener mínimo 6 caracteres");
        return;
    }
    if (!data.correo.includes("@")) {
        alert("Ingrese un correo válido");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json(); // Se abre el paquete de datos AQUÍ

        if (response.ok) {
            // 1. Verificamos en consola antes que nada
            console.log("¡ÉXITO! Datos recibidos:", result);

            // 2. Guardamos en LocalStorage
            if (result.id_emprendedor) {
                localStorage.setItem('id_emprendedor', result.id_emprendedor);
                console.log("ID guardado:", result.id_emprendedor);
            } else {
                console.error("El servidor no envió el id_emprendedor");
            }

            localStorage.setItem('nombre_usuario', result.nombre);
            localStorage.setItem('usuarioNombre', result.nombre);

            // 3. Mostramos mensaje y redirigimos
            alert(result.mensaje);
            window.location.href = 'main.html';

        } else {
            alert("Error: " + (result.error || "Credenciales incorrectas"));
        }

    } catch (error) {
        console.error("Error al conectar:", error);
        alert("No se pudo conectar con el servidor.");
    }
});