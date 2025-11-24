import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', () => {
  const usuario = ref(null)

  async function inicializar() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      const u = data.session.user
      usuario.value = {
        id: u.id,
        nombre: u.user_metadata.full_name,
        email: u.email,
        avatar: u.user_metadata.avatar_url
      }
      return
    }

    const invitado = localStorage.getItem('talknet_invitado')
    if (invitado) {
      try {
        usuario.value = JSON.parse(invitado)
      } catch (e) {
        localStorage.removeItem('talknet_invitado')
      }
    }
  }

  function loginInvitado() {
    const randomId = Math.floor(Math.random() * 9000) + 1000
    const nombreTemp = `Usuario_${randomId}`
    
    const nuevoUsuario = {
      id: `guest-${Date.now()}`, // ID único para la BD
      nombre: nombreTemp,
      email: nombreTemp, // Nombre visible
      // --- CAMBIO: Generamos un avatar automático con las iniciales ---
      avatar: `https://ui-avatars.com/api/?name=${nombreTemp}&background=random&color=fff`
    }
    
    usuario.value = nuevoUsuario
    localStorage.setItem('talknet_invitado', JSON.stringify(nuevoUsuario))
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('talknet_invitado')
    usuario.value = null
    window.location.href = '/'
  }

  inicializar()

  return { usuario, loginInvitado, loginGoogle, logout }
})