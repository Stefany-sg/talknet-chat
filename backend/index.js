// server/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configuración de Redis (Opcional para el futuro, no rompe nada si falla)
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Puerto 3001 para no chocar con Vue
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

//  US-04: Mapa para rastrear usuarios conectados (en memoria, NO en BD)

const usuariosConectados = new Map();

async function startServer() {
  
  // --- 1. Configuración de Redis (Resiliente: Si falla, usa memoria) ---
  let adapter = null;
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      
      // Evitamos que errores de conexión tumben el servidor
      pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
      subClient.on('error', (err) => console.error('Redis Sub Error:', err));
      
      await Promise.all([pubClient.connect(), subClient.connect()]);
      adapter = createAdapter(pubClient, subClient);
      console.log("Conectado a Redis (Upstash)");
    } catch (error) {
      console.log("No se pudo conectar a Redis. Usando memoria local (Modo Seguro).");
    }
  }

  // --- 2. Configurar Socket.io ---
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // Permite conexiones desde cualquier lugar (Vue)
    adapter: adapter
  });

  //  AQUÍ ESTÁ TU USER STORY 03 (Parte HTTP)
  //  [Back] Crear ruta REST GET /api/messages
  app.get('/api/messages', async (req, res) => {
    try {
      const historial = await prisma.mensaje.findMany({
        take: 50,                  // Criterio: Cargar últimos 50
        orderBy: { fecha: 'asc' }  // Criterio: Ordenados por fecha
      });
      res.json(historial);
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      res.status(500).json({ error: "Error al cargar mensajes" });
    }
  });

  app.get('/', (req, res) => {
    res.send('<h1>Servidor TalkNet Activo </h1><p>Ve a /api/messages para ver el historial.</p>');
  });

  //  AQUÍ ESTÁ TU USER STORY 03 (Parte Socket)
  //  [Back] Modificar evento para guardar con prisma.message.create()

  io.on('connection', (socket) => {
    // US-04: Asignar nombre temporal al conectarse
    socket.data.nombreUsuario = `Usuario_${socket.id.substring(0, 6)}`;
    console.log(`Cliente conectado: ${socket.id}`);

    //  US-04: REGISTRO DE USUARIO (cuando el frontend envía sus datos)
    //  [Back] Detectar evento 'registrar_usuario' y emitir 'user_joined'
    
    socket.on('registrar_usuario', (datosUsuario) => {
      // Guardar nombre del usuario en la sesión del socket
      const nombreAnterior = socket.data.nombreUsuario;
      socket.data.nombreUsuario = datosUsuario.nombre || 
                                   datosUsuario.email?.split('@')[0] || 
                                   nombreAnterior;

      // Guardar en el mapa de usuarios conectados (NO en BD)
      usuariosConectados.set(socket.id, {
        socketId: socket.id,
        id: datosUsuario.id || socket.id,
        nombre: socket.data.nombreUsuario,
        email: datosUsuario.email || null,
        conectadoEn: new Date().toISOString()
      });

      console.log(`${socket.data.nombreUsuario} se ha unido`);
      console.log(`Total online: ${usuariosConectados.size}`);

      // Emitir 'user_joined' a TODOS los clientes
      // Criterio: Mensaje tipo sistema "Usuario_123 se ha unido"
      io.emit('user_joined', {
        tipo: 'sistema',
        evento: 'user_joined',
        mensaje: `${socket.data.nombreUsuario} se ha unido`,
        usuario: usuariosConectados.get(socket.id),
        timestamp: new Date().toISOString()
      });

      // Emitir lista actualizada de usuarios online (para el contador)
      io.emit('usuarios_online', {
        usuarios: Array.from(usuariosConectados.values()),
        total: usuariosConectados.size
      });
    });

    //  US-04: SOLICITAR USUARIOS ONLINE
    //  [Back] Enviar lista de usuarios conectados al cliente que lo pida
    socket.on('pedir_usuarios_online', () => {
      socket.emit('usuarios_online', {
        usuarios: Array.from(usuariosConectados.values()),
        total: usuariosConectados.size
      });
    });

    //  US-02 & US-03: ENVÍO DE MENSAJES
    socket.on('enviar_mensaje', async (datos) => {
      // datos = { contenido: "Hola", usuarioId: "Juan", email: "juan@test.com" }
      try {
        // 1. GUARDAR EN BASE DE DATOS (Persistencia)
        const nuevoMensaje = await prisma.mensaje.create({
          data: {
            contenido: datos.contenido,
            usuarioId: datos.usuarioId || 'Anonimo', // Tu schema usa String, así que esto funciona directo
            email: datos.email || null
          }
        });

        // 2. RETRANSMITIR EL MENSAJE GUARDADO (Con ID y Fecha reales)
        io.emit('nuevo_mensaje', nuevoMensaje);
        
      } catch (e) {
        console.error("Error guardando mensaje en BD:", e);
        // Opcional: Avisar al que envió que hubo un error
        socket.emit('error_envio', { mensaje: "No se pudo guardar tu mensaje" });
      }
    });
    //  US-04: DESCONEXIÓN
    //  [Back] Detectar evento 'disconnect' y emitir 'user_left'
    socket.on('disconnect', () => {
      const nombreDesconectado = socket.data.nombreUsuario;
      console.log(`[US-04] ${nombreDesconectado} se ha desconectado`);

      // Eliminar del mapa de usuarios conectados
      usuariosConectados.delete(socket.id);

      console.log(`[US-04] Total online: ${usuariosConectados.size}`);

      // Emitir 'user_left' a TODOS los clientes
      // Criterio: Mensaje tipo sistema "Juan Perez se ha desconectado"
      io.emit('user_left', {
        tipo: 'sistema',
        evento: 'user_left',
        mensaje: `${nombreDesconectado} se ha desconectado`,
        timestamp: new Date().toISOString()
      });

      // Emitir lista actualizada de usuarios online
      io.emit('usuarios_online', {
        usuarios: Array.from(usuariosConectados.values()),
        total: usuariosConectados.size
      });
    });
  });

  httpServer.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

startServer();