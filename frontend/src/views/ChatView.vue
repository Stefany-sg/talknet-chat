<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatBox from '../components/ChatBox.vue' // Importamos el componente visual
import { useUserStore } from '../stores/user'

const store = useChatStore()
const userStore = useUserStore()
// --- INICIALIZACIÓN (US-02 + US-03) ---
// En lugar de llamar solo a fetchMessages, llamamos a 'iniciar'.
// 'iniciar' hace dos cosas:
// 1. Carga el historial (US-03)
// 2. Conecta el Socket para tiempo real (US-02)
onMounted(() => {
  store.iniciar()
})
</script>

<template>
  <div class="main-layout">
    <!-- CABECERA GLOBAL -->
    <header class="app-header">
      <h1>TalkNet 💬</h1>
      
      <!-- Controles de Usuario (Solo si está logueado) -->
      <div v-if="userStore.usuario" class="user-controls">
        <span class="user-email">{{ store.usuario.email }}</span>
        <button @click="store.logout" class="btn-logout">Salir</button>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="content-area">
      <div class="chat-wrapper">
        <!-- Aquí cargamos el ChatBox que tiene los estilos de burbujas y scroll -->
        <ChatBox />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* --- LAYOUT --- */
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #d1d7db;
  font-family: 'Segoe UI', sans-serif;
}

/* --- HEADER --- */
.app-header {
  background-color: #00a884;
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.app-header h1 { margin: 0; font-size: 1.3rem; }

.user-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
}

.btn-logout {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* --- ÁREA CENTRAL --- */
.content-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

/* --- LOGIN --- */
.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.btn-google {
  background: #4285f4;
  color: white;
  border: 1px solid #ddd;
  padding: 12px 20px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  width: 100%;
}

/* --- CONTENEDOR CHAT --- */
.chat-wrapper {
  width: 100%;
  max-width: 900px;
  height: 100%;
}
</style>