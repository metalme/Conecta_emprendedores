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
        SELECT nombre, correo, telefono, foto_perfil
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
// MENSAJES
// ================================

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
// SERVIDOR
// ================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en el puerto ${PORT}`);
});