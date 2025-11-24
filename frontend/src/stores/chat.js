import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'
import { supabase } from '../supabase'

// Definimos el Store de Pinia llamado 'chat'
export const useChatStore = defineStore('chat', () => {
  
  // --- ESTADO (VARIABLES REACTIVAS) ---
  
  // Almacena todos los mensajes (historial + nuevos)
  const messages = ref([])
  
  // Almacena la información del usuario logueado (ID, email, etc.)
  const usuario = ref(null)
  
  // Almacena la instancia técnica de la conexión Socket.io
  const socket = ref(null)
  
  // Indica si la conexión con el servidor está activa
  const conectado = ref(false)

  // --- ACCIONES (FUNCIONES) ---

  // Función principal que inicializa todo el sistema al cargar la vista
  const iniciar = async () => {
    // 1. Autenticación: Verifica si existe una sesión activa en Supabase
    const { data } = await supabase.auth.getSession()
    if (data.session) usuario.value = data.session.user

    // Configura un escuchador para detectar si el usuario inicia o cierra sesión
    supabase.auth.onAuthStateChange((_, session) => {
      usuario.value = session ? session.user : null
    })

    // 2. Historial: Llama a la función que descarga los mensajes antiguos
    await fetchMessages()

    // 3. Tiempo Real: Llama a la función que conecta el socket
    conectarSocket()
  }

  // Función para obtener el historial de mensajes vía HTTP (REST API)
  const fetchMessages = async () => {
    try {
      // Realiza una petición GET al servidor en el puerto 3001
      const response = await fetch('http://localhost:3001/api/messages')
      
      // Verifica si la respuesta fue exitosa
      if (!response.ok) throw new Error('Error al conectar API')
      
      // Convierte la respuesta a JSON
      const data = await response.json()
      
      // Guarda los datos recibidos en la variable messages
      messages.value = data 
      console.log("Historial cargado:", data.length)
    } catch (error) {
      console.error("Error fetch:", error)
    }
  }

  // Función para establecer la conexión WebSocket en tiempo real
  const conectarSocket = () => {
    // Si ya existe una conexión, evita crear una nueva
    if (socket.value) return 

    // Conecta con el servidor Socket.io en el puerto 3001
    socket.value = io('http://localhost:3001')

    // Evento de conexión exitosa
    socket.value.on('connect', () => {
      conectado.value = true
      console.log("Socket Conectado")
    })

    // Evento crítico: Escucha cuando el servidor envía un mensaje nuevo
    socket.value.on('nuevo_mensaje', (msg) => {
      // Agrega el mensaje recibido al final del array messages
      // Esto actualiza la vista automáticamente
      messages.value.push(msg) 
    })
  }

  // Función para enviar un mensaje al servidor
  const enviarMensaje = (texto) => {
    // Verifica que haya conexión y que el texto no esté vacío
    if (socket.value && texto) {
      // Prepara el objeto con los datos del mensaje
      const payload = {
        contenido: texto,
        // Usa el ID real del usuario o 'anonimo' si no hay sesión
        usuarioId: usuario.value?.id || 'anonimo',
        email: usuario.value?.email || 'Anonimo'
      }
      // Emite el evento 'enviar_mensaje' al servidor
      socket.value.emit('enviar_mensaje', payload)
    }
  }

  // --- AUTENTICACIÓN ---

  // Inicia el proceso de login con Google
  const loginGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }
  
  // Cierra la sesión y recarga la página para limpiar datos
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  // Retorna todas las variables y funciones para usarlas en los componentes
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