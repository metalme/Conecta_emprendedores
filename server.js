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

// --- CONEXIÓN A LA BASE DE DATOS actualizada 31 marzo 2026---
const conexion = mysql.createConnection({
    host: process.env.MYSQLHOST || "localhost",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "Stiven",
    database: process.env.MYSQLDATABASE || "conecta_emprendedores",
    port: process.env.MYSQLPORT || 3306
});

conexion.connect(function(error){
    if(error){
        console.error('Error detallado:', error.message);
        return;
    }
    console.log('✅ Conexión exitosa a la base de datos');
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

// --- AHORA (Listo para la nube) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en el puerto ${PORT}`);
});