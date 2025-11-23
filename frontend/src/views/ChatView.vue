<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatBox from '../components/ChatBox.vue'
import { useUserStore } from '../stores/user'

const store = useChatStore()
const userStore = useUserStore()

// INICIALIZACIÓN (US-02 + US-03 + US-04)
onMounted(async () => {
  // US-04: Iniciar conexión WebSocket y listeners de presencia
  store.iniciarSocket()
  
  // US-03: Cargar historial de mensajes (últimos 50)
  await store.fetchMessages()
  
  console.log('Chat inicializado: Socket + Historial')
})
</script>

<template>
  <div class="main-layout">
    
    <!-- CABECERA GLOBAL -->
    <header class="app-header">
      <h1>TalkNet </h1>
      
      <!-- Controles de Usuario (Solo si está logueado) -->
      <div v-if="userStore.usuario" class="user-controls">
        <span class="user-email">{{ userStore.usuario.email }}</span>
        <button @click="store.logout" class="btn-logout">Salir</button>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="content-area">
      <div class="chat-wrapper">
        <!-- ChatBox con US-02 (mensajes) + US-04 (presencia) -->
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

.app-header h1 { 
  margin: 0; 
  font-size: 1.3rem; 
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
}

.user-email {
  opacity: 0.9;
}

.btn-logout {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
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

/* --- CONTENEDOR CHAT --- */
.chat-wrapper {
  width: 100%;
  max-width: 900px;
  height: 100%;
  max-height: 700px;
}
</style>