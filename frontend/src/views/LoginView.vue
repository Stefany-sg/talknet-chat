<script setup>
import { useUserStore } from '../stores/user' 
import { useRouter } from 'vue-router' 
// Importamos las herramientas para detectar el login
import { watch, onMounted } from 'vue' 

const userStore = useUserStore()
const router = useRouter()

// --- FUNCIÓN 1: BOTÓN INVITADO ---
function handleInvitado() {
  console.log("Botón Invitado presionado")
  userStore.loginInvitado()
  // Forzamos el viaje al chat
  router.push('/chat')
}

// --- FUNCIÓN 2: BOTÓN GOOGLE ---
function handleGoogle() {
  console.log("Botón Google presionado")
  userStore.loginGoogle()
}

// --- VIGILANTES (Para el salto automático) ---

// A) Si recargas la página y ya estabas logueado
onMounted(() => {
  if (userStore.usuario) {
    console.log("Usuario ya existe, redirigiendo...")
    router.push('/chat')
  }
})

// B) Si Google responde tarde (detecta el cambio)
watch(() => userStore.usuario, (nuevoUsuario) => {
  if (nuevoUsuario) {
    console.log("Usuario detectado por Google, redirigiendo...")
    router.push('/chat')
  }
})
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1>TalkNet 💬</h1>
      <p>Ingresa para conectarte al chat global</p>

      <div class="actions">
        <button @click="handleGoogle" class="btn btn-google">
          <span class="icon">G</span> Ingresar con Google
        </button>

        <div class="separator">o</div>

        <button @click="handleInvitado" class="btn btn-guest">
          👤 Ingresar como Invitado
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #eceff1;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
  width: 100%;
  max-width: 380px;
}

h1 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 2rem;
}

p {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.btn-google {
  background-color: #db4437;
  color: white;
}

.btn-guest {
  background-color: #3498db;
  color: white;
}

.separator {
  color: #bdc3c7;
  font-size: 14px;
  font-weight: bold;
}

.icon {
  font-weight: bold;
  background: white;
  color: #db4437;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>