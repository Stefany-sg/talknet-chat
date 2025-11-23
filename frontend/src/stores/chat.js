import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'
import { supabase } from '../supabase'

export const useChatStore = defineStore('chat', () => {
  // --- ESTADO ---
  const messages = ref([])
  const usuario = ref(null)
  const socket = ref(null)
  const conectado = ref(false)

  // --- ACCIÓN PRINCIPAL: INICIAR ---
  // Esta función orquesta todo al cargar la página
  const iniciar = async () => {
    // 1. Auth: Ver quién soy
    const { data } = await supabase.auth.getSession()
    if (data.session) usuario.value = data.session.user

    supabase.auth.onAuthStateChange((_, session) => {
      usuario.value = session ? session.user : null
    })

    // 2. US-03: Cargar Historial (Lo que ya te funciona)
    await fetchMessages()

    // 3. US-02: Conectar Tiempo Real (Lo que te falta)
    conectarSocket()
  }

  // --- US-03: FETCH REST ---
  const fetchMessages = async () => {
    try {
      // Conectamos al puerto 3001 donde vive tu backend
      const response = await fetch('http://localhost:3001/api/messages')
      if (!response.ok) throw new Error('Error al conectar API')
      
      const data = await response.json()
      messages.value = data // Llenamos el array con el historial antiguo
      console.log("✅ Historial cargado:", data.length)
    } catch (error) {
      console.error("❌ Error fetch:", error)
    }
  }

  // --- US-02: SOCKETS (TIEMPO REAL) ---
  const conectarSocket = () => {
    if (socket.value) return // Si ya existe, no reconectar

    socket.value = io('http://localhost:3001')

    socket.value.on('connect', () => {
      conectado.value = true
      console.log("🟢 Socket Conectado (Listo para US-02)")
    })

    // CRÍTICO: Escuchar cuando alguien (o yo mismo) envía un mensaje nuevo
    socket.value.on('nuevo_mensaje', (msg) => {
      messages.value.push(msg) // ¡Esto hace que aparezca al instante!
    })
  }

  // --- US-02: ENVIAR ---
  const enviarMensaje = (texto) => {
    if (socket.value && texto) {
      const payload = {
        contenido: texto,
        usuarioId: usuario.value?.id || 'anonimo',
        email: usuario.value?.email || 'Anonimo'
      }
      // Emitimos al backend para que lo guarde y retransmita
      socket.value.emit('enviar_mensaje', payload)
    }
  }

  // --- AUTH ---
  const loginGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return {
    messages,
    usuario,
    conectado,
    iniciar,
    fetchMessages,
    enviarMensaje,
    loginGoogle,
    logout
  }
})