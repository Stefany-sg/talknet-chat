<script setup>
import { onMounted } from 'vue';
import { useChatStore } from '../stores/chat';

const chatStore = useChatStore();

// --- TU PARTE CRÍTICA (US-03) ---
// "Al entrar, se deben cargar los últimos 50 mensajes."
onMounted(async () => {
  await chatStore.fetchMessages();
  scrollToBottom(); // Pequeña ayuda de usabilidad
});

// Función auxiliar simple para el scroll inicial
const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.getElementById('messages-box');
    if(container) container.scrollTop = container.scrollHeight;
  }, 100);
};
</script>

<template>
  <div class="chat-layout">
    <h2>Historial de Chat (US-03 Test)</h2>
    
    <div id="messages-box" class="history-container">
      <p v-if="chatStore.messages.length === 0">Cargando historial o chat vacío...</p>

      <div 
        v-for="msg in chatStore.messages" 
        :key="msg.id" 
        class="message-item"
      >
        <strong>{{ msg.usuarioId }}:</strong>
        <span>{{ msg.contenido }}</span>
        <small style="display:block; color:gray; font-size:0.7em">
          {{ new Date(msg.fecha).toLocaleString() }}
        </small>
      </div>
    </div>

    <div style="margin-top: 10px;">
      <input type="text" placeholder="Área de US-02 (Sockets)" disabled />
      <button disabled>Enviar</button>
    </div>
  </div>
</template>

<style scoped>
.history-container {
  border: 2px dashed #ccc; /* Borde punteado para indicar que es estructura */
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
}
.message-item {
  border-bottom: 1px solid #eee;
  padding: 5px 0;
}
</style>