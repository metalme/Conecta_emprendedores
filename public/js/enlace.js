const formulario = document.getElementById('registro_formulario');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formulario);
    const data = Object.fromEntries(formData);

// Detectar la URL base automáticamente
// Si estás en Clever Cloud, usará la URL de la app. Si estás en local, usará localhost.

const API_URL = window.location.origin + '/api/emprendedores';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.mensaje);
            formulario.reset();
        } else {
            alert("Hubo un error: " + result.error);
        }
    } catch (error) {
        console.error("No se pudo conectar con el servidor:", error);
    }
});