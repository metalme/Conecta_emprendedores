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

    limits: {
        fileSize: 5 * 1024 * 1024
    },

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

// Servir archivos estáticos
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
// OBTENER TODOS LOS EMPRENDEDORES
// ================================

app.get('/api/emprendedores', (req, res) => {

    const sql = 'SELECT * FROM emprendedores';

    conexion.query(sql, (err, results) => {

        if (err) {
            console.error("Error al consultar:", err);

            return res.status(500).json({
                error: 'Error al obtener datos'
            });
        }

        res.json(results);
    });
});


// ================================
// OBTENER EMPRENDEDOR POR ID
// ================================

app.get('/api/emprendedores/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT *
        FROM emprendedores
        WHERE id_emprendedor = ?
    `;

    conexion.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({
                mensaje: 'No encontrado'
            });
        }
    });
});


// ================================
// REGISTRAR EMPRENDEDOR
// ================================

app.post('/api/emprendedores', (req, res) => {

    const { documento, correo } = req.body;
    const data = req.body;

    // VALIDAR DOCUMENTO
    const sqlCheckDoc = `
        SELECT id_emprendedor
        FROM emprendedores
        WHERE documento = ?
    `;

    conexion.query(sqlCheckDoc, [documento], (errDoc, resDoc) => {

        if (errDoc) {
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }

        if (resDoc.length > 0) {
            return res.status(400).json({
                error: 'duplicado_documento',
                mensaje: 'El número de documento ya está registrado.'
            });
        }

        // VALIDAR CORREO
        const sqlCheckCorreo = `
            SELECT id_emprendedor
            FROM emprendedores
            WHERE correo = ?
        `;

        conexion.query(sqlCheckCorreo, [correo], (errCorreo, resCorreo) => {

            if (errCorreo) {
                return res.status(500).json({
                    error: 'Error interno del servidor'
                });
            }

            if (resCorreo.length > 0) {
                return res.status(400).json({
                    error: 'duplicado_correo',
                    mensaje: 'El correo electrónico ya está registrado.'
                });
            }

            // INSERTAR
            const sqlInsert = 'INSERT INTO emprendedores SET ?';

            conexion.query(sqlInsert, data, (errInsert, result) => {

                if (errInsert) {

                    console.error(errInsert);

                    return res.status(500).json({
                        error: 'Error al insertar usuario'
                    });
                }

                res.status(201).json({
                    mensaje: '¡Usuario registrado!',
                    id: result.insertId
                });
            });
        });
    });
});


// ================================
// ACTUALIZAR EMPRENDEDOR
// ================================

app.put('/api/emprendedores/:id', (req, res) => {

    const { id } = req.params;
    const { nombre, telefono } = req.body;

    const sql = `
        UPDATE emprendedores
        SET nombre = ?, telefono = ?
        WHERE id_emprendedor = ?
    `;

    conexion.query(sql, [nombre, telefono, id], (err) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            mensaje: 'Actualizado correctamente'
        });
    });
});


// ================================
// CAMBIAR CONTRASEÑA
// ================================

app.put('/api/perfil/password/:id', (req, res) => {

    const { id } = req.params;
    const { password } = req.body;

    const sql = `
        UPDATE emprendedores
        SET password = ?
        WHERE id_emprendedor = ?
    `;

    conexion.query(sql, [password, id], (err) => {

        if (err) {

            console.error("Error al cambiar contraseña:", err);

            return res.status(500).json({
                error: 'Error en la base de datos'
            });
        }

        res.json({
            mensaje: 'Contraseña actualizada correctamente'
        });
    });
});


// ================================
// ELIMINAR EMPRENDEDOR
// ================================

app.delete('/api/emprendedores/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM emprendedores
        WHERE id_emprendedor = ?
    `;

    conexion.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            mensaje: 'Eliminado correctamente'
        });
    });
});


// ================================
// LOGIN
// ================================

app.post('/api/login', (req, res) => {

    const { correo, password } = req.body;

    const sql = `
        SELECT id_emprendedor, nombre
        FROM emprendedores
        WHERE correo = ? AND password = ?
    `;

    conexion.query(sql, [correo, password], (err, results) => {

        if (err) {

            console.error("Error en MySQL:", err);

            return res.status(500).json({
                error: 'Error en el servidor'
            });
        }

        if (results.length > 0) {

            res.json({
                mensaje: '¡Inicio de sesión exitoso!',
                id_emprendedor: results[0].id_emprendedor,
                nombre: results[0].nombre
            });

        } else {

            res.status(401).json({
                error: 'Correo o contraseña incorrectos'
            });
        }
    });
});


// ================================
// OBTENER PERFIL
// ================================

app.get('/api/perfil/:id', (req, res) => {

    const id = req.params.id;

    const query = `
        SELECT nombre, correo, telefono, foto_perfil, descripcion
        FROM emprendedores
        WHERE id_emprendedor = ?
    `;

    conexion.query(query, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: "Error al obtener datos"
            });
        }

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({
                error: "Usuario no encontrado"
            });
        }
    });
});


// ================================
// SUBIR FOTO PERFIL
// ================================

app.put('/api/perfil/foto/:id', upload.single('foto'), (req, res) => {

    const idEmprendedor = req.params.id;

    if (!req.file) {

        return res.status(400).json({
            error: 'No se subió imagen'
        });
    }

    const fotoURL = req.file.path;

    const sql = `
        UPDATE emprendedores
        SET foto_perfil = ?
        WHERE id_emprendedor = ?
    `;

    conexion.query(sql, [fotoURL, idEmprendedor], (err) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                error: 'Error al guardar foto'
            });
        }

        res.json({
            mensaje: 'Foto subida correctamente',
            foto: fotoURL
        });
    });
});


// ================================
// ACTUALIZAR DESCRIPCIÓN
// ================================

app.put('/api/perfil/descripcion/:id', (req, res) => {

    const { id } = req.params;
    const { descripcion } = req.body;

    const sql = `
        UPDATE emprendedores
        SET descripcion = ?
        WHERE id_emprendedor = ?
    `;

    conexion.query(sql, [descripcion, id], (err) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: 'Error al guardar descripción'
            });
        }

        res.json({
            mensaje: 'Descripción actualizada'
        });
    });
});


// ================================
// MENSAJES actualizado el 17/05/2026 para incluir validación de chat permitido y carga de historial de mensajes
// ================================

// NUEVO: Validar si el chat está permitido (Evita el error 404 en la lista de chats)
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

// NUEVO: Obtener el historial de mensajes (Evita el error al cargar la conversación)
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



// ENVIAR MENSAJE
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

        if (err) {
            return res.status(500).json({
                error: 'Error'
            });
        }

        if (result.length === 0) {
            return res.status(403).json({
                error: 'No pueden chatear aún'
            });
        }

        const sql = `
            INSERT INTO mensajes (emisor_id, receptor_id, mensaje)
            VALUES (?, ?, ?)
        `;

        

        conexion.query(sql, [emisor_id, receptor_id, mensaje], (err) => {

            if (err) {
                return res.status(500).json({
                    error: 'Error al enviar mensaje'
                });
            }

            res.json({
                mensaje: 'Mensaje enviado'
            });
        });
    });
});



// ================================
// RUTAS DE NOTIFICACIONES Y SOLICITUDES (ACTUALIZADO)
// ================================

// NUEVO: Enviar una solicitud de amistad/conexión y generar notificación automáticamente
app.post('/api/solicitudes', (req, res) => {
    const { emisor_id, receptor_id } = req.body;

    // 1. Verificar si ya existe una solicitud previa entre ambos
    const checkSql = `
        SELECT * FROM solicitudes 
        WHERE (emisor_id = ? AND receptor_id = ?) 
           OR (emisor_id = ? AND receptor_id = ?)
    `;

    conexion.query(checkSql, [emisor_id, receptor_id, receptor_id, emisor_id], (errCheck, resCheck) => {
        if (errCheck) return res.status(500).json({ error: errCheck.message });
        
        if (resCheck.length > 0) {
            return res.status(400).json({ error: 'Ya existe una solicitud o conexión entre ustedes.' });
        }

        // 2. Insertar en la tabla solicitudes
        const insertSolicitud = 'INSERT INTO solicitudes (emisor_id, receptor_id, estado) VALUES (?, ?, "pendiente")';
        
        conexion.query(insertSolicitud, [emisor_id, receptor_id], (errIns, resultIns) => {
            if (errIns) return res.status(500).json({ error: errIns.message });

            const idSolicitud = resultIns.insertId;

            // 3. Crear una notificación para el receptor
            const insertNotif = `
                INSERT INTO notificaciones (id_usuario, tipo, icono, mensaje, leida) 
                VALUES (?, 'solicitud', 'fa-user-plus', ?, 0)
            `;
            // Obtenemos el nombre del emisor para el mensaje de la notificación
            conexion.query('SELECT nombre FROM emprendedores WHERE id_emprendedor = ?', [emisor_id], (errUser, resUser) => {
                const nombreEmisor = resUser.length > 0 ? resUser[0].nombre : 'Un emprendedor';
                const mensajeNotif = `${nombreEmisor} te ha enviado una solicitud de conexión.`;

                conexion.query(insertNotif, [receptor_id, mensajeNotif], (errNot) => {
                    if (errNot) console.error("Error al crear notificación:", errNot);
                    
                    res.status(201).json({ 
                        mensaje: 'Solicitud enviada correctamente', 
                        id_solicitud: idSolicitud 
                    });
                });
            });
        });
    });
});

// MODIFICADO: Obtener solicitudes pendientes de un usuario específico (Para la tarjeta "Solicitudes de amistad")
app.get('/api/solicitudes/pendientes/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.id AS id_solicitud, s.emisor_id, e.nombre, e.foto_perfil
        FROM solicitudes s
        JOIN emprendedores e ON s.emisor_id = e.id_emprendedor
        WHERE s.receptor_id = ? AND s.estado = 'pendiente'
    `;
    conexion.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error en solicitudes pendientes:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// MODIFICADO: Responder a la solicitud (Aceptar / Rechazar)
app.put('/api/solicitudes/:id', (req, res) => {
    const { id } = req.params; // ID de la solicitud
    const { accion } = req.body; // 'aceptar' o 'rechazar'

    const estado = accion === 'aceptar' ? 'aceptado' : 'rechazado';

    const sql = 'UPDATE solicitudes SET estado = ? WHERE id = ?'; // <-- Cambiado id_solicitud por id
    conexion.query(sql, [estado, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: `Solicitud respondida: ${estado}` });
    });
});


// ================================
// COMPLEMENTOS DE NOTIFICACIONES REQUERIDOS POR EL FRONTEND
// ================================

// Obtener todas las notificaciones de un usuario para la vista del componente
app.get('/api/notificaciones/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id_notificacion, tipo, icono, mensaje, fecha, leida FROM notificaciones WHERE id_usuario = ? ORDER BY fecha DESC';
    conexion.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Marcar una notificación individual como leída
app.put('/api/notificaciones/leida/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ?';
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Notificación leída correctamente' });
    });
});

// Conteo rápido de notificaciones sin leer para la burbuja roja de la campana
app.get('/api/conteo-notificaciones/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT COUNT(*) AS pendientes FROM notificaciones WHERE id_usuario = ? AND leida = 0';
    conexion.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ pendientes: results[0].pendientes });
    });
});


// ================================
// SERVIDOR
// ================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en el puerto ${PORT}`);
});