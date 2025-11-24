<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useUserStore } from '../stores/user'
import ChatBox from '../components/ChatBox.vue'

const store = useChatStore()
const userStore = useUserStore()

onMounted(() => {
  store.iniciar() 
})
</script>

<template>
  <div class="main-layout">
    
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
           <h1>TalkNet 💬</h1>
           <span v-if="store.conectado" class="online-counter">
             🟢 {{ store.connectedUsers }} Online
           </span>
        </div>
        
        <div v-if="userStore.usuario" class="user-controls">
          <span class="user-info">
             <img v-if="userStore.usuario.avatar" 
                  :src="userStore.usuario.avatar" 
                  class="avatar" />
             {{ userStore.usuario.nombre || userStore.usuario.email }}
          </span>
          
          <button @click="userStore.logout" class="btn-logout">Salir</button>
        </div>
      </div>
    </header>

    <main class="content-area">
      <div class="chat-wrapper">
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
  /* Fondo limpio, muy claro */
  background-color: #f7f9fc; 
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* --- HEADER --- */
.app-header {
  /* Azul marino oscuro */
  background-color: #2c3e50; 
  color: white;
  height: 64px; /* Un poco más alto */
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2); /* Sombra más definida */
  z-index: 10;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 { 
  margin: 0; 
  font-size: 1.6rem; 
  font-weight: 700; 
  color: #ffffff; /* Blanco puro */
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 1rem;
}

.user-info { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  font-weight: 500;
}

.avatar {
  width: 34px; height: 34px; border-radius: 50%;
  border: 3px solid #6c7a89; /* Borde más visible */
  object-fit: cover;
}

.btn-logout {
  /* Estilo de botón ghost sutil */
  background: #6d1200; 
  border: 1px solid rgba(255, 95, 95, 0.3);
  color: white;
  padding: 8px 18px; 
  border-radius: 6px; 
  cursor: pointer;
  font-size: 0.9rem; 
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s;
}

.btn-logout:hover { 
  background: rgba(255,255,255,0.2); 
  border-color: white;
}

/* --- ÁREA CENTRAL --- */
.content-area {
  flex: 1; display: flex; justify-content: center;
  padding: 20px; overflow: hidden;
}



/* --- CONTENEDOR CHAT --- */

.chat-wrapper {
  width: 100%; max-width: 950px; height: 100%;
  background: white; 
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  border-radius: 12px; 
  overflow: hidden;
}
</style>
