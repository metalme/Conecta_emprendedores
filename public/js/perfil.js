document.addEventListener('DOMContentLoaded', async () => {
    const id = localStorage.getItem('id_emprendedor');
    if (!id) { window.location.href = 'login.html'; return; }

    cargarDatosBasicos(id);
    cargarDisenoPerfil(id);
});

// --- CARGA DE DATOS ---

async function cargarDatosBasicos(id) {
    try {
        const res = await fetch(`/api/perfil/${id}`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('telefono').value = data.telefono || '';
            document.getElementById('display-nombre').innerText = data.nombre || 'Emprendedor';
        }
    } catch (err) { console.error("Error básico:", err); }
}

async function cargarDisenoPerfil(id) {
    try {
        const res = await fetch(`/api/perfil/diseno/${id}`);
        if (res.ok) {
            const data = await res.json();
            // Inyectar en Hero
            document.getElementById('db-hero_titulo').innerText = data.hero_titulo || "Mi Título";
            document.getElementById('db-hero_subtitulo').innerText = data.hero_subtitulo || "Mi descripción...";
            document.getElementById('db-hero_imagen').src = data.hero_imagen || "https://via.placeholder.com/250";
            
            // Inyectar Stats
            renderStats(data);
        }
    } catch (err) { console.error("Error diseño:", err); }
}

function renderStats(data) {
    const container = document.getElementById('container-stats');
    container.innerHTML = `
        <div class="stat-card">
            <h4 class="editable" id="db-stat1_valor">${data.stat1_valor || '0'}</h4>
            <p class="editable" id="db-stat1_texto">${data.stat1_texto || 'Proyectos'}</p>
        </div>
        <div class="stat-card">
            <h4 class="editable" id="db-stat2_valor">${data.stat2_valor || '0'}</h4>
            <p class="editable" id="db-stat2_texto">${data.stat2_texto || 'Logros'}</p>
        </div>
        <div class="stat-card">
            <h4 class="editable" id="db-stat3_valor">${data.stat3_valor || '0'}</h4>
            <p class="editable" id="db-stat3_texto">${data.stat3_texto || 'Años'}</p>
        </div>
    `;
}

// --- GESTIÓN DE EDICIÓN ---

function gestionarEdicion(sectionId) {
    const section = document.getElementById(sectionId);
    const btn = section.querySelector('.btn-edit-content');
    const isEditing = section.classList.contains('editable-active');

    if (!isEditing) {
        section.classList.add('editable-active');
        section.querySelectorAll('.editable').forEach(el => el.contentEditable = true);
        btn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar';
    } else {
        section.classList.remove('editable-active');
        section.querySelectorAll('.editable').forEach(el => el.contentEditable = false);
        btn.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';
        guardarDisenoEnDB(); // Aquí es donde guardamos en perfil_emprendedores
    }
}

async function guardarDisenoEnDB() {
    const id = localStorage.getItem('id_emprendedor');
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

    const res = await fetch(`/api/perfil/diseno/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) alert("¡Diseño de perfil guardado!");
}

// --- DATOS DE CUENTA (TABLA PRINCIPAL) ---

document.getElementById('form-mi-cuenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = localStorage.getItem('id_emprendedor');
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;

    const res = await fetch(`/api/emprendedores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono })
    });

    if (res.ok) alert("Datos de cuenta actualizados");
});

// --- UTILIDADES ---

function previewImagen(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => document.getElementById('db-hero_imagen').src = e.target.result;
        reader.readAsDataURL(input.files[0]);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}