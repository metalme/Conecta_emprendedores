const express = require('express');
const mysql = require("mysql2");
const cors = require('cors');
const path = require('path');



const app = express();



// --- CONFIGURACIONES ---
app.use(express.json());
app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'Inicio.html'));
});


// --- CONEXIÓN A LA BASE DE DATOS actualizada 31 marzo 2026 ---

const conexion = mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST || 'b2epbzrhyannkkocholb-mysql.services.clever-cloud.com',
    user: process.env.MYSQL_ADDON_USER || 'ulxfpjzmwec7l5pc',
    password: process.env.MYSQL_ADDON_PASSWORD || 'Iu9NhmYYOgNWTUaF5vI9',
    database: process.env.MYSQL_ADDON_DB || 'b2epbzrhyannkkocholb',
    port: process.env.MYSQL_ADDON_PORT || 3306
});

conexion.connect(function(error){
    if(error){
        console.error('Error detallado:', error.message);
        return;
    }
    console.log('✅ Conexión exitosa a la base de datos en Clever Cloud');
});

// --- RUTAS API ---

// 1. Obtener todos los emprendedores (Para cargar la tabla)
app.get('/api/emprendedores', (req, res) => {
    const sql = 'SELECT * FROM emprendedores';
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error("Error al consultar:", err);
            return res.status(500).json({ error: 'Error al obtener datos' });
        }
        res.json(results);
    });
});

// 2. Obtener UN emprendedor por ID (Para la función consultarPorId)
app.get('/api/emprendedores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM emprendedores WHERE id_emprendedor = ?';
    conexion.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) res.json(result[0]);
        else res.status(404).json({ mensaje: 'No encontrado' });
    });
});

// 3. Registrar nuevo (POST)
app.post('/api/emprendedores', (req, res) => {
    const data = req.body;
    const sql = 'INSERT INTO emprendedores SET ?';
    conexion.query(sql, data, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al insertar' });
        }
        res.status(201).json({ mensaje: '¡Usuario registrado!', id: result.insertId });
    });
});

// 4. Actualizar emprendedor (PUT - Para la función actualizarRegistro)
app.put('/api/emprendedores/:id', (req, res) => {

    const { id } = req.params;
    const { nombre, telefono } = req.body; //<-- Solo actualizamos nombre y teléfono, pero puedes agregar más campos si quieres -->
    const sql = 'UPDATE emprendedores SET  nombre = ?, telefono = ? where id_emprendedor = ?';
    conexion.query(sql, [nombre, telefono, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Actualizado correctamente' });
    });
});

// Actualizar contraseña (Seguridad)
app.put('/api/perfil/password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body; // Recibimos la nueva clave
    const sql = 'UPDATE emprendedores SET password = ? WHERE id_emprendedor = ?';

    conexion.query(sql, [password, id], (err) => {
        if (err) {
            console.error("Error al cambiar contraseña:", err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    });
});


// 5. Eliminar emprendedor (DELETE - Para la función eliminar)
app.delete('/api/emprendedores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM emprendedores WHERE id_emprendedor = ?';
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Eliminado correctamente' });
    });
});




// RUTA PARA INICIAR SESIÓN (LOGIN)

// RUTA PARA INICIAR SESIÓN (LOGIN) 2.0 - Ahora también devuelve el ID del usuario para que el frontend sepa QUIÉN es el usuario que inició sesión
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;

    // CAMBIO 1: Seleccionamos también el id_emprendedor (o como se llame tu PK)
    const sql = 'SELECT id_emprendedor, nombre FROM emprendedores WHERE correo = ? AND password = ?';

    conexion.query(sql, [correo, password], (err, results) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            // CAMBIO 2: Enviamos el ID al frontend para que sepa QUIÉN es el usuario
            res.json({
                mensaje: '¡Inicio de sesión exitoso!',
                id_emprendedor: results[0].id_emprendedor, // <-- Aquí está el ID del usuario
                nombre: results[0].nombre // <-- También enviamos el nombre para mostrarlo en "Mi Cuenta"
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    });
});



// RUTA PARA OBTENER DATOS DEL PERFIL
app.get('/api/perfil/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT nombre, correo, telefono FROM emprendedores WHERE id_emprendedor = ?';

    conexion.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al obtener datos" });
        }
        if (result.length > 0) {
            res.json(result[0]); // Enviamos los datos del usuario encontrado
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    });
});

// --- MENSAJES ---
// RUTA PARA ENVIAR MENSAJE ENTRE USUARIOS (SOLO SI TIENEN UNA SOLICITUD ACEPTADA ENTRE ELLOS)
app.post('/api/mensajes', (req, res) => {
    const { emisor_id, receptor_id, mensaje } = req.body;

    const validar = `
    SELECT * FROM solicitudes 
    WHERE (
        (emisor_id = ? AND receptor_id = ?) OR
        (emisor_id = ? AND receptor_id = ?)
    )
    AND estado = 'aceptado'
    `;

    conexion.query(validar, [emisor_id, receptor_id, receptor_id, emisor_id], (err, result) => {

        if (err) return res.status(500).json({ error: 'Error' });

        if (result.length === 0) {
            return res.status(403).json({ error: 'No pueden chatear aún' });
        }

        // SI ESTÁ PERMITIDO → GUARDA MENSAJE
        const sql = 'INSERT INTO mensajes (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)';

        conexion.query(sql, [emisor_id, receptor_id, mensaje], (err) => {
            if (err) return res.status(500).json({ error: 'Error al enviar mensaje' });

            res.json({ mensaje: 'Mensaje enviado' });
        });

    });
});

// OBTENER MENSAJES ENTRE DOS USUARIOS
app.get('/api/mensajes/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;

    const sql = `
        SELECT * FROM mensajes 
        WHERE (emisor_id = ? AND receptor_id = ?)
        OR (emisor_id = ? AND receptor_id = ?)
        ORDER BY fecha ASC
    `;

    conexion.query(sql, [user1, user2, user2, user1], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener mensajes' });
        }

        res.json(results);
    });
});

app.post('/api/solicitudes', (req, res) => {
    const { emisor_id, receptor_id } = req.body;

    // ❌ evitar auto solicitud
    if (emisor_id == receptor_id) {
        return res.status(400).json({ error: 'No puedes enviarte solicitud a ti mismo' });
    }

    const sql = `
    INSERT INTO solicitudes (emisor_id, receptor_id)
    SELECT ?, ?
    WHERE NOT EXISTS (
        SELECT 1 FROM solicitudes 
        WHERE (
            (emisor_id = ? AND receptor_id = ?) OR
            (emisor_id = ? AND receptor_id = ?)
        )
    )
    `;

    conexion.query(
        sql,
        [emisor_id, receptor_id, emisor_id, receptor_id, receptor_id, emisor_id],
        (err, result) => {

            if (err) return res.status(500).json({ error: 'Error' });

            if (result.affectedRows === 0) {
                return res.json({ mensaje: 'Ya existe una solicitud o relación' });
            }

            res.json({ mensaje: 'Solicitud enviada' });
        }
    );
});


// OBTENER SOLICITUDES PENDIENTES PARA UN USUARIO
app.get('/api/solicitudes/:id', (req, res) => {
    const id = req.params.id;

    const sql = `
    SELECT s.*, e.nombre 
    FROM solicitudes s
    JOIN emprendedores e ON s.emisor_id = e.id_emprendedor
    WHERE s.receptor_id = ? AND s.estado = 'pendiente'
    `;

    conexion.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error' });

        res.json(results);
    });
});


// ACEPTAR SOLICITUD
app.put('/api/solicitudes/:id', (req, res) => {
    const id = req.params.id;

    const sql = `UPDATE solicitudes SET estado = 'aceptado' WHERE id = ?`;

    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error' });

        res.json({ mensaje: 'Aceptado' });
    });
});

// RECHAZAR SOLICITUD
app.put('/api/solicitudes/rechazar/:id', (req, res) => {
    const id = req.params.id;

    const sql = `UPDATE solicitudes SET estado = 'rechazado' WHERE id = ?`;

    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error' });

        res.json({ mensaje: 'Solicitud rechazada' });
    });
});


// VERIFICAR SI DOS USUARIOS PUEDEN CHATEAR (SOLO SI TIENEN UNA SOLICITUD ACEPTADA ENTRE ELLOS)
app.get('/api/chat-permitido/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;

    const sql = `
    SELECT * FROM solicitudes 
    WHERE (
        (emisor_id = ? AND receptor_id = ?) OR
        (emisor_id = ? AND receptor_id = ?)
    )
    AND estado = 'aceptado'
    `;



    conexion.query(sql, [user1, user2, user2, user1], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error' });

        res.json({ permitido: result.length > 0 });
    });
});



// GUARDAR O ACTUALIZAR PERFIL
app.post('/api/perfil', (req, res) => {
    const {
        id_emprendedor,
        hero_titulo,
        hero_subtitulo,
        hero_imagen,
        stat1_texto,
        stat1_valor,
        stat2_texto,
        stat2_valor,
        stat3_texto,
        stat3_valor,
        proyectos_json
    } = req.body;

    const sql = `
    INSERT INTO perfil_emprendedores
    (id_emprendedor, hero_titulo, hero_subtitulo, hero_imagen,
    stat1_texto, stat1_valor,
    stat2_texto, stat2_valor,
    stat3_texto, stat3_valor,
    proyectos_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        hero_titulo = VALUES(hero_titulo),
        hero_subtitulo = VALUES(hero_subtitulo),
        hero_imagen = VALUES(hero_imagen),
        stat1_texto = VALUES(stat1_texto),
        stat1_valor = VALUES(stat1_valor),
        stat2_texto = VALUES(stat2_texto),
        stat2_valor = VALUES(stat2_valor),
        stat3_texto = VALUES(stat3_texto),
        stat3_valor = VALUES(stat3_valor),
        proyectos_json = VALUES(proyectos_json)
    `;

    conexion.query(sql, [
        id_emprendedor,
        hero_titulo,
        hero_subtitulo,
        hero_imagen,
        stat1_texto,
        stat1_valor,
        stat2_texto,
        stat2_valor,
        stat3_texto,
        stat3_valor,
        proyectos_json
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al guardar perfil' });
        }

        res.json({ mensaje: 'Perfil guardado correctamente' });
    });
});




// RUTA PARA OBTENER DATOS DEL PERFIL

app.get('/api/perfil-completo/:id', (req, res) => {
    const id = req.params.id;

    const sql = `
    SELECT e.nombre, e.correo, e.telefono,
           p.*
    FROM emprendedores e
    LEFT JOIN perfil_emprendedores p
    ON e.id_emprendedor = p.id_emprendedor
    WHERE e.id_emprendedor = ?
    `;

    conexion.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error' });

        res.json(result[0]);
    });
});












// --- AHORA (Listo para la nube) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en el puerto ${PORT}`);
});





