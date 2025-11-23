<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useUserStore } from '../stores/user'

const store = useChatStore()
const userStore = useUserStore()
const texto = ref('')
const fondoChat = ref(null)

// --- US-05: Scroll automático ---
// Baja al final cada vez que llega un mensaje o carga el historial
const bajarScroll = () => {
  if (fondoChat.value) {
    fondoChat.value.scrollTo({
      top: fondoChat.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Vigilar cambios en la lista de mensajes
watch(() => store.messages.length, async () => {
  await nextTick() // Esperar a que Vue termine de pintar
  bajarScroll()
})

onMounted(() => {
  bajarScroll()
})

// --- US-02: Envío de mensajes ---
const enviar = () => {
  if (texto.value.trim()) {
    store.enviarMensaje(texto.value)
    texto.value = '' // Limpiar input
  }
}
</script>

<template>
  <div class="chat-container">
    <!-- Cabecera interna -->
    <div class="header">
      <span>Conectado como: {{ store.usuario?.email }}</span>
       
      <!-- PUEDE QUE ESTO SE BORRE --> <button @click="store.logout" class="btn-salir">Salir</button>
    </div>

    <!-- Área de mensajes -->
    <div class="mensajes-area" ref="fondoChat">
      <div v-if="store.messages.length === 0" class="empty-state">
        <p>No hay mensajes aún. ¡Saluda!</p>
      </div>

      <div 
        v-for="msg in store.messages" 
        :key="msg.id || Math.random()" 
        class="mensaje-wrapper"
        :class="{ 
          'propio': store.usuario && msg.usuarioId === store.usuario.id, 
          'ajeno': !store.usuario || msg.usuarioId !== store.usuario.id 
        }"
      >
        <!-- Nombre del remitente (solo si es ajeno) -->
        <small 
          class="autor" 
          v-if="!store.usuario || msg.usuarioId !== store.usuario.id"
        >
          {{ msg.email ? msg.email.split('@')[0] : 'Anónimo' }}
        </small>
        
        <!-- Burbuja de texto -->
        <div class="burbuja">
          {{ msg.contenido }}
          <!-- Hora (Opcional, si el mensaje tiene fecha) -->
          <span v-if="msg.fecha" class="hora">
            {{ new Date(msg.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Área de Input -->
    <div class="input-area">
      <input 
        v-model="texto" 
        @keyup.enter="enviar" 
        placeholder="Escribe un mensaje..." 
        :disabled="!userStore.usuario"
      />
      <button 
        @click="enviar" 
        :disabled="!texto || !store.usuario"
      >
        Enviar
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container { 
  display: flex; 
  flex-direction: column; 
  height: 500px; 
  border: 1px solid #ccc; 
  border-radius: 10px; 
  background: #fff; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.header { 
  padding: 10px; 
  background: #eee; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 1px solid #ccc; 
}

.mensajes-area { 
  flex: 1; 
  padding: 20px; 
  overflow-y: auto; 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  background-color: #f0f2f5;
}

.empty-state {
  text-align: center;
  color: #888;
  margin-top: 20px;
  font-style: italic;
}

/* --- ESTILOS CLAVE PARA US-02 (Derecha/Izquierda) --- */
.mensaje-wrapper { 
  max-width: 70%; 
  display: flex; 
  flex-direction: column; 
}

/* Mis mensajes (Derecha) */
.mensaje-wrapper.propio { 
  align-self: flex-end; 
  align-items: flex-end; 
}
.mensaje-wrapper.propio .burbuja { 
  background: #007bff; 
  color: white; 
  border-radius: 15px 15px 0 15px; 
}

/* Mensajes de otros (Izquierda) */
.mensaje-wrapper.ajeno { 
  align-self: flex-start; 
  align-items: flex-start; 
}
.mensaje-wrapper.ajeno .burbuja { 
  background: #e9ecef; 
  color: black; 
  border-radius: 15px 15px 15px 0; 
}

.burbuja { 
  padding: 10px 15px; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.1); 
  font-size: 0.95rem;
  word-wrap: break-word;
}

.autor { 
  font-size: 0.75rem; 
  color: #666; 
  margin-bottom: 4px; 
  margin-left: 5px;
}

.hora {
  font-size: 0.65rem;
  margin-left: 8px;
  opacity: 0.7;
}

.input-area { 
  padding: 15px; 
  border-top: 1px solid #ccc; 
  display: flex; 
  gap: 10px; 
  background: white;
}

input { 
  flex: 1; 
  padding: 10px; 
  border-radius: 20px; 
  border: 1px solid #ddd; 
  outline: none;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>