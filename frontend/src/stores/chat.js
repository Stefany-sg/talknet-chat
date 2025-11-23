// client/src/stores/chat.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from 'socket.io-client';

export const useChatStore = defineStore('chat', () => {
  // 1. ESTADO: Aquí se guardará la lista de mensajes
  const messages = ref([]);
  
  // US-04: Estado para usuarios conectados
  const usuariosOnline = ref([]);     // Lista de usuarios conectados
  const totalOnline = ref(0);         // Contador de usuarios en vivo
  const socket = ref(null);           // Conexión WebSocket
  const conectado = ref(false);       // Estado de conexión
  const usuario = ref(null);          // Usuario actual (temporal)

  //
  // US-04: Iniciar conexión WebSocket y listeners de presencia
  const iniciarSocket = () => {
    // Conectar al backend
    socket.value = io('http://localhost:3001');

    // Cuando conecte
    socket.value.on('connect', () => {
      console.log('[US-04]  Socket conectado:', socket.value.id);
      conectado.value = true;

      // Registrar usuario en el servidor
      const nombreUsuario = `Usuario_${socket.value.id?.substring(0, 6)}`;
      usuario.value = { id: socket.value.id, nombre: nombreUsuario };

      socket.value.emit('registrar_usuario', {
        id: socket.value.id,
        nombre: nombreUsuario
      });

      // Pedir lista de usuarios online
      socket.value.emit('pedir_usuarios_online');
    });

    socket.value.on('disconnect', () => {
      console.log('[US-04]  Socket desconectado');
      conectado.value = false;
    });

    // US-04: Escuchar 'user_joined' (alguien se unió)
    // Criterio: Mensaje en gris/itálica "Usuario_123 se ha unido"
    socket.value.on('user_joined', (notificacion) => {
      console.log('[US-04] ', notificacion.mensaje);
      
      // Agregar al array messages con tipo: 'sistema'
      // NOTA: NO se guarda en BD, solo se muestra en pantalla
      messages.value.push({
        id: `sistema-${Date.now()}`,
        tipo: 'sistema',
        evento: 'user_joined',
        mensaje: notificacion.mensaje,
        timestamp: notificacion.timestamp
      });
    });

    
    // US-04: Escuchar 'user_left' (alguien salió)
    // Criterio: Mensaje en gris/itálica "Juan Perez se ha desconectado"
    socket.value.on('user_left', (notificacion) => {
      console.log('[US-04] ', notificacion.mensaje);
      
      messages.value.push({
        id: `sistema-${Date.now()}`,
        tipo: 'sistema',
        evento: 'user_left',
        mensaje: notificacion.mensaje,
        timestamp: notificacion.timestamp
      });
    });

    // US-04: Escuchar actualización de usuarios online
    // Criterio: Contador de usuarios conectados en vivo
    socket.value.on('usuarios_online', (data) => {
      console.log('[US-04]  Usuarios online:', data.total);
      usuariosOnline.value = data.usuarios;
      totalOnline.value = data.total;
    });
  };

  // 2. ACCIÓN (US-03): Ir al servidor a buscar los mensajes
  const fetchMessages = async () => {
    try {
      // Conectamos con tu backend en el puerto 3001
      const response = await fetch('http://localhost:3001/api/messages');
      
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();
      
      // Guardamos los datos en la variable 'messages'
      // Agregamos tipo: 'mensaje' para diferenciar de sistema
      messages.value = data.map(m => ({ ...m, tipo: 'mensaje' }));
      console.log("Historial cargado:", data.length, "mensajes");
      
    } catch (error) {
      console.error(" Error cargando el chat:", error);
    }
  };

  return { 
    // Estado original
    messages, 
    fetchMessages,
    
    // US-04: Estado de presencia
    usuariosOnline,
    totalOnline,
    socket,
    conectado,
    usuario,
    iniciarSocket
  };
});