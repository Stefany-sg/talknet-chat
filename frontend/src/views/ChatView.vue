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
/* (Mismos estilos de siempre) */
.main-layout { display: flex; flex-direction: column; height: 100vh; background-color: #d1d7db; font-family: 'Segoe UI', sans-serif; }
.app-header { background-color: #008069; color: white; height: 60px; display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
.header-content { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 15px; }
.app-header h1 { margin: 0; font-size: 1.3rem; font-weight: 600; }
.online-counter { background-color: rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; }
.user-controls { display: flex; align-items: center; gap: 15px; font-size: 0.9rem; }
.user-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.5); }
.btn-logout { background: rgba(255, 255, 255, 0.15); border: none; color: white; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; transition: background 0.2s; }
.btn-logout:hover { background: rgba(255, 255, 255, 0.3); }
.content-area { flex: 1; display: flex; justify-content: center; padding: 20px; overflow: hidden; }
.chat-wrapper { width: 100%; max-width: 900px; height: 100%; background: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden; }
</style>