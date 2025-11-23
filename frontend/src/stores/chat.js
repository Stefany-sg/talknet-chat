import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'
import { supabase } from '../supabase'
import router from '@/router'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  // --- ESTADO ---
  const messages = ref([])
  const socket = ref(null)
  const conectado = ref(false)
  // HU-4
  const usersOnlineCount = ref(0) 
  const usersOnlineList = ref([])

  // 💡 COMPUTADO: Leer el usuario directamente del UserStore
    const userStore = useUserStore()
    const usuario = ref(userStore.usuario) // ⬅️ Usamos el usuario del userStore

  // --- ACCIÓN PRINCIPAL: INICIAR ---
  // Esta función orquesta todo al cargar la página
  const iniciar = async () => {
        // 1. Auth: Ya está cargado en el userStore, solo leemos.
        // Ya no necesitamos llamar a supabase.auth.getSession() ni onAuthStateChange aquí.
        // 2. US-03: Cargar Historial
        await fetchMessages()
        // 3. US-02/04: Conectar Tiempo Real y Autenticar
        conectarSocket(userStore.usuario) // Le pasamos la info del usuario desde el userStore
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
    const userData = userStore.usuario
    if (socket.value && texto && userData) {
      const payload = {
        contenido: texto,
        usuarioId: userData.id || 'anonimo',
        email: userData.email || 'Anonimo'
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
    await userStore.logout() // ⬅ Llamar al logout del userStore (limpia Supabase y localstorage)
    router.push({ name: 'login' }) 
  }

  return {
    messages,
    usuario: userStore.usuario,
    conectado,
    iniciar,
    usersOnlineCount,
    usersOnlineList,
    fetchMessages,
    enviarMensaje,
    loginGoogle,
    logout
  }
})