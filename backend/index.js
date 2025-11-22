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
      console.log(" Conectado a Redis (Upstash)");
    } catch (error) {
      console.log(" No se pudo conectar a Redis. Usando memoria local (Modo Seguro).");
    }
  }

  // --- 2. Configurar Socket.io ---
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // Permite conexiones desde cualquier lugar (Vue)
    adapter: adapter
  });

  // ==================================================================
  //  AQUÍ ESTÁ TU USER STORY 03 (Parte HTTP)
  //  [Back] Crear ruta REST GET /api/messages
  // ==================================================================
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

  // ==================================================================
  //  AQUÍ ESTÁ TU USER STORY 03 (Parte Socket)
  //  [Back] Modificar evento para guardar con prisma.message.create()
  // ==================================================================
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

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

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  httpServer.listen(port, () => {
    console.log(` Servidor corriendo en http://localhost:${port}`);
  });
}

startServer();