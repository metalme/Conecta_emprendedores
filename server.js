const express = require('express');
const mysql = require("mysql2");
const cors = require('cors');
const path = require('path');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// ================================
// CLOUDINARY
// ================================
cloudinary.config({
    cloud_name: 'dq5yzzlf5',
    api_key: '753224185718589',
    api_secret: 'qkAFahLXu7rKIdlPQp-9Y_mL-cU'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fotos_perfil',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            {
                width: 500,
                height: 500,
                crop: 'fill',
                gravity: 'face'
            }
        ]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

// ================================
// CONFIGURACIONES
// ================================
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'Inicio.html'));
});

// ================================
// CONEXIÓN MYSQL
// ================================
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

// ================================
// RUTAS DE EMPRENDEDORES
// ================================

// NUEVO: Obtener emprendedores cruzando datos de solicitudes para la exploración interactiva
app.get('/api/emprendedores/explorar/:miId', (req, res) => {
    const { miId } = req.params;
    const sql = `
        SELECT e.id_emprendedor, e.nombre, e.foto_perfil, e.descripcion,
               s.estado AS estado_solicitud, s.emisor_id
        FROM emprendedores e
        LEFT JOIN solicitudes s ON (
            (s.emisor_id = ? AND s.receptor_id = e.id_emprendedor) OR 
            (s.emisor_id = e.id_emprendedor AND s.receptor_id = ?)
        )
        WHERE e.id_emprendedor != ?
    `;
    conexion.query(sql, [miId, miId, miId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener todos de forma plana (Ruta por defecto antigua)
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

app.get('/api/emprendedores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM emprendedores WHERE id_emprendedor = ?';
    conexion.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ mensaje: 'No encontrado' });
        }
    });
});

app.post('/api/emprendedores', (req, res) => {
    const { documento, correo } = req.body;
    const data = req.body;

    const sqlCheckDoc = 'SELECT id_emprendedor FROM emprendedores WHERE documento = ?';
    conexion.query(sqlCheckDoc, [documento], (errDoc, resDoc) => {
        if (errDoc) return res.status(500).json({ error: 'Error interno del servidor' });
        if (resDoc.length > 0) {
            return res.status(400).json({ error: 'duplicado_documento', mensaje: 'El número de documento ya está registrado.' });
        }

        const sqlCheckCorreo = 'SELECT id_emprendedor FROM emprendedores WHERE correo = ?';
        conexion.query(sqlCheckCorreo, [correo], (errCorreo, resCorreo) => {
            if (errCorreo) return res.status(500).json({ error: 'Error interno del servidor' });
            if (resCorreo.length > 0) {
                return res.status(400).json({ error: 'duplicado_correo', mensaje: 'El correo electrónico ya está registrado.' });
            }

            const sqlInsert = 'INSERT INTO emprendedores SET ?';
            conexion.query(sqlInsert, data, (errInsert, result) => {
                if (errInsert) {
                    console.error(errInsert);
                    return res.status(500).json({ error: 'Error al insertar usuario' });
                }
                res.status(201).json({ mensaje: '¡Usuario registrado!', id: result.insertId });
            });
        });
    });
});

app.put('/api/emprendedores/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono } = req.body;
    const sql = 'UPDATE emprendedores SET nombre = ?, telefono = ? WHERE id_emprendedor = ?';
    conexion.query(sql, [nombre, telefono, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Actualizado correctamente' });
    });
});

app.delete('/api/emprendedores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM emprendedores WHERE id_emprendedor = ?';
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Eliminado correctamente' });
    });
});

// ================================
// LOGIN Y PERFIL
// ================================
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;
    const sql = 'SELECT id_emprendedor, nombre FROM emprendedores WHERE correo = ? AND password = ?';
    conexion.query(sql, [correo, password], (err, results) => {
        if (err) {
            console.error("Error en MySQL:", err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.length > 0) {
            res.json({
                mensaje: '¡Inicio de sesión exitoso!',
                id_emprendedor: results[0].id_emprendedor,
                nombre: results[0].nombre
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    });
});

app.get('/api/perfil/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT nombre, correo, telefono, foto_perfil, descripcion FROM emprendedores WHERE id_emprendedor = ?';
    conexion.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al obtener datos" });
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    });
});

app.put('/api/perfil/foto/:id', upload.single('foto'), (req, res) => {
    const idEmprendedor = req.params.id;
    if (!req.file) return res.status(400).json({ error: 'No se subió imagen' });

    const fotoURL = req.file.path;
    const sql = 'UPDATE emprendedores SET foto_perfil = ? WHERE id_emprendedor = ?';
    conexion.query(sql, [fotoURL, idEmprendedor], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al guardar foto' });
        }
        res.json({ mensaje: 'Foto subida correctamente', foto: fotoURL });
    });
});

app.put('/api/perfil/descripcion/:id', (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;
    const sql = 'UPDATE emprendedores SET descripcion = ? WHERE id_emprendedor = ?';
    conexion.query(sql, [descripcion, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al guardar descripción' });
        }
        res.json({ mensaje: 'Descripción actualizada' });
    });
});

app.put('/api/perfil/password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const sql = 'UPDATE emprendedores SET password = ? WHERE id_emprendedor = ?';
    conexion.query(sql, [password, id], (err) => {
        if (err) {
            console.error("Error al cambiar contraseña:", err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    });
});

// ================================
// MENSAJES / CHAT
// ================================
app.get('/api/chat-permitido/:miId/:otroId', (req, res) => {
    const { miId, otroId } = req.params;
    const sql = `
        SELECT * FROM solicitudes 
        WHERE ((emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?))
        AND estado = 'aceptado'
    `;
    conexion.query(sql, [miId, otroId, otroId, miId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ permitido: result.length > 0 });
    });
});

app.get('/api/mensajes/:emisor_id/:receptor_id', (req, res) => {
    const { emisor_id, receptor_id } = req.params;
    const sql = `
        SELECT emisor_id, receptor_id, mensaje, fecha 
        FROM mensajes 
        WHERE (emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?)
        ORDER BY fecha ASC
    `;
    conexion.query(sql, [emisor_id, receptor_id, receptor_id, emisor_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/mensajes', (req, res) => {
    const { emisor_id, receptor_id, mensaje } = req.body;
    const validar = `
        SELECT * FROM solicitudes
        WHERE ((emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?))
        AND estado = 'aceptado'
    `;
    conexion.query(validar, [emisor_id, receptor_id, receptor_id, emisor_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error' });
        if (result.length === 0) return res.status(403).json({ error: 'No pueden chatear aún' });

        const sql = 'INSERT INTO mensajes (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)';
        conexion.query(sql, [emisor_id, receptor_id, mensaje], (err) => {
            if (err) return res.status(500).json({ error: 'Error al enviar mensaje' });
            res.json({ mensaje: 'Mensaje enviado' });
        });
    });
});

// ================================
// SOLICITUDES Y NOTIFICACIONES
// ================================

// Enviar una solicitud de amistad/conexión
app.post('/api/solicitudes', (req, res) => {
    const { emisor_id, receptor_id } = req.body;

    const checkSql = `
        SELECT * FROM solicitudes 
        WHERE (emisor_id = ? AND receptor_id = ?) 
           OR (emisor_id = ? AND receptor_id = ?)
    `;
    conexion.query(checkSql, [emisor_id, receptor_id, receptor_id, emisor_id], (errCheck, resCheck) => {
        if (errCheck) return res.status(500).json({ error: errCheck.message });
        if (resCheck.length > 0) return res.status(400).json({ error: 'Ya existe una solicitud o conexión.' });

        const insertSolicitud = 'INSERT INTO solicitudes (emisor_id, receptor_id, estado) VALUES (?, ?, "pendiente")';
        conexion.query(insertSolicitud, [emisor_id, receptor_id], (errIns, resultIns) => {
            if (errIns) return res.status(500).json({ error: errIns.message });

            const idSolicitud = resultIns.insertId;

            // Generar la notificación para el receptor
            const insertNotif = "INSERT INTO notificaciones (id_usuario, tipo, icono, mensaje, leida) VALUES (?, 'solicitud', 'fa-user-plus', ?, 0)";
            conexion.query('SELECT nombre FROM emprendedores WHERE id_emprendedor = ?', [emisor_id], (errUser, resUser) => {
                const nombreEmisor = resUser.length > 0 ? resUser[0].nombre : 'Un emprendedor';
                const mensajeNotif = `${nombreEmisor} te ha enviado una solicitud de conexión.`;

                conexion.query(insertNotif, [receptor_id, mensajeNotif], (errNot) => {
                    if (errNot) console.error("Error al crear notificación:", errNot);
                    res.status(201).json({ mensaje: 'Solicitud enviada correctamente', id_solicitud: idSolicitud });
                });
            });
        });
    });
});

// Obtener solicitudes pendientes recibidas por un usuario
app.get('/api/solicitudes/pendientes/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.id_solicitud, s.emisor_id, e.nombre, e.foto_perfil 
        FROM solicitudes s
        JOIN emprendedores e ON s.emisor_id = e.id_emprendedor
        WHERE s.receptor_id = ? AND s.estado = 'pendiente'
    `;
    conexion.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Responder a una solicitud (Aceptar / Rechazar)
app.put('/api/solicitudes/:id', (req, res) => {
    const { id } = req.params; 
    const { accion } = req.body; 
    const estado = accion === 'aceptar' ? 'aceptado' : 'rechazado';

    const sql = 'UPDATE solicitudes SET estado = ? WHERE id_solicitud = ?';
    conexion.query(sql, [estado, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: `Solicitud respondida: ${estado}` });
    });
});

// Obtener todas las notificaciones de un usuario
app.get('/api/notificaciones/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id_notificacion, tipo, icono, mensaje, fecha, leida FROM notificaciones WHERE id_usuario = ? ORDER BY fecha DESC';
    conexion.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Marcar notificación como leída
app.put('/api/notificaciones/leida/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ?';
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Notificación leída' });
    });
});

// Conteo de notificaciones no leídas para el menú
app.get('/api/conteo-notificaciones/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT COUNT(*) AS total FROM notificaciones WHERE id_usuario = ? AND leida = 0';
    conexion.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ pendientes: results[0].total });
    });
});

// ================================
// SERVILLETE / INICIO SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en el puerto ${PORT}`);
});