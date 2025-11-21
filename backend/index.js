require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

// Configuración de Redis (Upstash)
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

async function startServer() {
  
  // 1. Intentar conectar a Redis (si está configurado en .env)
  let adapter = null;
  if (process.env.REDIS_URL) {
      try {
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        adapter = createAdapter(pubClient, subClient);
        console.log("✅ Conectado a Redis (Upstash)");
      } catch (error) {
        console.log("⚠️ Sin Redis, usando memoria local.");
      }
  }

  // 2. Configurar Socket.io
  const io = new Server(server, {
    cors: { origin: "*" },
    adapter: adapter
  });

  io.on('connection', (socket) => {
    console.log('⚡ Cliente conectado:', socket.id);

    // A) Enviar Historial (Usando tabla 'Mensaje')
    socket.on('pedir_historial', async () => {
      try {
        const historial = await prisma.mensaje.findMany({
          take: 50,
          orderBy: { fecha: 'asc' }
        });
        socket.emit('historial_recibido', historial);
      } catch (e) {
        console.error("Error DB:", e);
      }
    });

    // B) Recibir nuevo mensaje
    socket.on('enviar_mensaje', async (datos) => {
      try {
        const nuevoMensaje = await prisma.mensaje.create({
          data: {
            contenido: datos.contenido,
            usuarioId: datos.usuarioId || 'anonimo',
            email:     datos.email || 'Desconocido'
          }
        });
        io.emit('nuevo_mensaje', nuevoMensaje);
      } catch (e) {
        console.error("Error guardando:", e);
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
  });
}

startServer();