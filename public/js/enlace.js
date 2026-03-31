const formulario = document.getElementById('registro_formulario');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formulario);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/api/emprendedores', {
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