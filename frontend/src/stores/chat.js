import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'
import { useUserStore } from './user' // <--- 1. IMPORTAMOS AL EXPERTO EN USUARIOS

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore() // Instancia del store de usuario

  // --- ESTADO ---
  const messages = ref([])
  const socket = ref(null)
  const conectado = ref(false)
  const connectedUsers = ref(0) 

  // --- ACCIÓN PRINCIPAL: INICIAR ---
  const iniciar = async () => {
    // YA NO cargamos usuario aquí. Confiamos en que userStore ya lo hizo.
    
    // 1. Cargar Historial
    await fetchMessages()

    // 2. Conectar Socket
    conectarSocket()
  }

  // --- FETCH REST ---
  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messages')
      if (!response.ok) throw new Error('Error al conectar API')
      const data = await response.json()
      messages.value = data
      console.log("✅ Historial cargado:", data.length)
    } catch (error) {
      console.error("❌ Error fetch:", error)
    }
  }

  // --- SOCKETS (TIEMPO REAL) ---
  const conectarSocket = () => {
    if (socket.value) return 

    socket.value = io('http://localhost:3001')

    socket.value.on('connect', () => {
      conectado.value = true
      console.log("🟢 Socket Conectado")

      // --- FIX US-04: ¡PRESENTARSE AL SERVIDOR! ---
      // AHORA USAMOS LOS DATOS REALES DE userStore (Invitado o Google)
      const usuarioReal = userStore.usuario

      const datosUsuario = {
        id: usuarioReal?.id || 'anonimo',
        email: usuarioReal?.email || 'Invitado',
        nombre: usuarioReal?.nombre || 'Invitado' // Ahora sí toma el nombre del invitado
      }
      
      socket.value.emit('registrar_usuario', datosUsuario)
    })

    // Escuchar mensajes normales
    socket.value.on('nuevo_mensaje', (msg) => {
      messages.value.push(msg)
    })

    // --- FIX US-04: ESCUCHAR EVENTOS DE SISTEMA ---
    const manejarEventoSistema = (evento) => {
      messages.value.push({
         id: Date.now(),
         contenido: evento.mensaje,
         usuarioId: 'Sistema',
         fecha: evento.timestamp,
         tipo: 'sistema'
      })
    }

    socket.value.on('user_joined', manejarEventoSistema)
    socket.value.on('user_left', manejarEventoSistema)

    // Actualizar contador
    socket.value.on('usuarios_online', (data) => {
      connectedUsers.value = data.total
    })
  }

  const enviarMensaje = (texto) => {
    if (socket.value && texto) {
      const usuarioReal = userStore.usuario // Sacamos la info del userStore

      const payload = {
        contenido: texto,
        usuarioId: usuarioReal?.id || 'anonimo',
        email: usuarioReal?.email || 'Anonimo'
      }
      socket.value.emit('enviar_mensaje', payload)
    }
  }

  // NOTA: Borramos loginGoogle y logout de aquí.
  // Esas funciones pertenecen exclusivamente a user.js

  return {
    messages,
    // usuario, <--- YA NO LO EXPORTAMOS (está en userStore)
    conectado,
    connectedUsers,
    iniciar,
    fetchMessages,
    enviarMensaje
    // login/logout <--- YA NO EXISTEN AQUÍ
  }
})