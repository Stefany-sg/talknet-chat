import { defineStore } from 'pinia'
import { ref, watch } from 'vue' // <--- IMPORTANTE: watch para el vigilante
import { io } from 'socket.io-client'
import { useUserStore } from './user' // <--- IMPORTANTE: Usamos el store maestro

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore() // Instancia del store de usuario

  // --- ESTADO ---
  const messages = ref([])
  const socket = ref(null)
  const conectado = ref(false)
  const connectedUsers = ref(0) // Contador de usuarios (US-04)

  // --- ACCIÓN PRINCIPAL ---
  const iniciar = async () => {
    // 1. Cargar Historial
    await fetchMessages()
    // 2. Conectar Socket
    conectarSocket()
  }

  // --- API REST ---
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

  // --- SOCKETS ---
  const conectarSocket = () => {
    if (socket.value) return 

    socket.value = io('http://localhost:3001')

    socket.value.on('connect', () => {
      conectado.value = true
      console.log("🟢 Socket Conectado")
      
      // CRÍTICO: Presentarse al servidor
      identificarse()
    })

    socket.value.on('disconnect', () => {
      conectado.value = false
      console.log("🔴 Socket Desconectado")
    })

    // Mensajes normales
    socket.value.on('nuevo_mensaje', (msg) => {
      messages.value.push(msg)
    })

    // US-04: Mensajes de Sistema (Entrada/Salida)
    const agregarMensajeSistema = (evento) => {
      messages.value.push({
         id: Date.now(),
         contenido: evento.mensaje,
         usuarioId: 'Sistema',
         fecha: evento.timestamp,
         tipo: 'sistema'
      })
    }

    socket.value.on('user_joined', (evt) => {
        console.log("🔔 Entró:", evt)
        agregarMensajeSistema(evt)
    })
    
    socket.value.on('user_left', (evt) => {
        console.log("🚪 Salió:", evt)
        agregarMensajeSistema(evt)
    })

    // US-04: Contador
    socket.value.on('usuarios_online', (data) => {
      console.log("👥 Online:", data.total)
      connectedUsers.value = data.total
    })
  }

  // Función para decir "Hola, soy Juan"
  const identificarse = () => {
    if (!socket.value || !conectado.value) return

    const usuarioReal = userStore.usuario
    
    const datosUsuario = {
      id: usuarioReal?.id || 'anonimo',
      email: usuarioReal?.email || 'Invitado',
      nombre: usuarioReal?.nombre || 'Invitado'
    }
    
    // Enviamos el evento al backend para que nos registre en el mapa
    socket.value.emit('registrar_usuario', datosUsuario)
  }

  // Enviar mensaje
  const enviarMensaje = (texto) => {
    if (socket.value && texto) {
      const usuarioReal = userStore.usuario
      const payload = {
        contenido: texto,
        usuarioId: usuarioReal?.id || 'anonimo',
        email: usuarioReal?.email || 'Anonimo'
      }
      socket.value.emit('enviar_mensaje', payload)
    }
  }

  // VIGILANTE: Si el usuario carga tarde, nos presentamos de nuevo
  watch(() => userStore.usuario, () => {
    if (conectado.value) {
      identificarse()
    }
  })

  // NOTA: Login/Logout se manejan en user.js, aquí solo exportamos lo del chat
  return {
    messages,
    conectado,
    connectedUsers,
    iniciar,
    fetchMessages,
    enviarMensaje
  }
})