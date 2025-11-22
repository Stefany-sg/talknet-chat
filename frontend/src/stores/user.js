import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', () => {
  // Estado reactivo para guardar la info del usuario actual
  const usuario = ref(null)

  // Funcion para verificar si existe una sesion activa al recargar
  async function inicializar() {
    // 1. Verificar sesion de Google con Supabase
    const { data } = await supabase.auth.getSession()
    
    if (data.session) {
      const googleUser = data.session.user
      // Mapeamos los datos de Google a nuestro formato
      usuario.value = {
        id: googleUser.id,
        nombre: googleUser.user_metadata.full_name,
        email: googleUser.email,
        avatar: googleUser.user_metadata.avatar_url
      }
    } else {
      // 2. Si no hay Google, buscar si hay un invitado guardado en el navegador
      const invitadoLocal = localStorage.getItem('talknet_invitado')
      if (invitadoLocal) {
        usuario.value = JSON.parse(invitadoLocal)
      }
    }

    // Listener para detectar cambios de sesion (login/logout) en tiempo real
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        usuario.value = {
          id: session.user.id,
          nombre: session.user.user_metadata.full_name,
          email: session.user.email,
          avatar: session.user.user_metadata.avatar_url
        }
      }
    })
  }

  // Login como invitado (Genera ID y nombre temporal)
  function loginInvitado() {
    const randomId = Math.floor(Math.random() * 9000) + 1000
    const nombreTemp = `Usuario_${randomId}`
    
    const nuevoUsuario = {
      id: Date.now().toString(),
      nombre: nombreTemp,
      email: 'invitado@temp.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombreTemp}`
    }

    // Guardar en el estado y en localStorage para persistencia
    usuario.value = nuevoUsuario
    localStorage.setItem('talknet_invitado', JSON.stringify(nuevoUsuario))
  }

  // Login con Google (Redirecciona a provider)
  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  // Cerrar sesion y limpiar datos
  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('talknet_invitado')
    usuario.value = null
  }

  // Ejecutar verificacion al cargar el store
  inicializar()

  return { usuario, loginInvitado, loginGoogle, logout }
})