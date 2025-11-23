<script setup>

import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'

// US-04: Importar componentes de presencia
import MensajeSistema from './MensajeSistema.vue'
import ContadorOnline from './ContadorOnline.vue'

const store = useChatStore()
const texto = ref('')
const fondoChat = ref(null)
//
// --- SCROLL AUTOMÁTICO ---
// Baja al final cada vez que llega un mensaje o se carga el componente
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
  await nextTick() // Esperar a que Vue actualice el DOM
  bajarScroll()
})

onMounted(() => {
  bajarScroll()
})

// --- ENVÍO DE MENSAJES ---
const enviar = () => {
  if (texto.value.trim()) {
    store.enviarMensaje(texto.value)
    texto.value = '' // Limpiar input
  }
}
</script>

<template>
  
  <div class="chat-interface">
    
    <!-- Cabecera Interna con estado y contador US-04 -->
    <div class="chat-header-internal">
      <div class="header-left">
        <span v-if="store.conectado" class="status-online">● En línea</span>
        <span v-else class="status-offline">● Conectando...</span>
      </div>
      
      <!-- US-04: Contador de usuarios conectados en vivo -->
      <div class="header-right">
        <ContadorOnline 
          :usuarios="store.usuariosOnline" 
          :total="store.totalOnline" 
        />
      </div>
    </div>

    <!-- 1. ÁREA DE MENSAJES -->
    <div class="messages-area" ref="fondoChat">
      
      <!-- Estado Vacío -->
      <div v-if="store.messages.length === 0" class="empty-state">
        <p>No hay mensajes. ¡Saluda a tu equipo!</p>
      </div>

      <!-- Iterar sobre mensajes -->
      <template v-for="msg in store.messages" :key="msg.id || Math.random()">
        
        <!-- ================================================ -->
        <!-- US-04: MENSAJE DE SISTEMA (unión/salida) -->
        <!-- Criterio: Mensaje en GRIS e ITÁLICA -->
        <!-- ================================================ -->
        <MensajeSistema 
          v-if="msg.tipo === 'sistema'" 
          :mensaje="msg" 
        />

        <!-- ================================================ -->
        <!-- MENSAJE NORMAL DE CHAT -->
        <!-- ================================================ -->
        <div 
          v-else
          class="message-row"
          :class="{ 
            'mio': store.usuario && msg.usuarioId === store.usuario.id, 
            'otro': !store.usuario || msg.usuarioId !== store.usuario.id 
          }"
        >
          <!-- Nombre del remitente (Solo si es Otro) -->
          <small 
            v-if="!store.usuario || msg.usuarioId !== store.usuario.id" 
            class="sender-name"
          >
            {{ msg.email ? msg.email.split('@')[0] : 'Anónimo' }}
          </small>

          <!-- La Burbuja -->
          <div class="bubble">
            {{ msg.contenido }}
            
            <!-- Hora -->
            <span class="time" v-if="msg.fecha">
              {{ new Date(msg.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- 2. ÁREA DE INPUT -->
    <div class="input-area">
      <input 
        v-model="texto" 
        @keyup.enter="enviar" 
        type="text" 
        placeholder="Escribe un mensaje..." 
        class="chat-input"
        :disabled="!store.usuario" 
      />
      <button 
        @click="enviar" 
        class="btn-send" 
        :disabled="!texto || !store.usuario"
      >
        ➤
      </button>
    </div>
  </div>
</template>

<style scoped>
/* --- ESTRUCTURA --- */
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* --- HEADER MODIFICADO PARA US-04 --- */
.chat-header-internal {
  padding: 8px 15px;
  background: linear-gradient(135deg, #00a884, #008f6f);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  font-size: 0.8rem;
}

.status-online { 
  color: #d9fdd3; 
  font-weight: bold; 
}

.status-offline {
  color: #ffcccc;
}


/* --- MENSAJES --- */
.messages-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #e5ded8; /* Fondo WhatsApp */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  color: #888;
  margin-top: 20px;
  font-style: italic;
}

.message-row {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

/* --- CLASES DINÁMICAS (US-02) --- */

/* Míos (Derecha + Verde) */
.mio {
  align-self: flex-end;
  align-items: flex-end;
}
.mio .bubble {
  background-color: #d9fdd3; 
  color: #111;
  border-radius: 10px 0 10px 10px;
}

/* Otros (Izquierda + Blanco) */
.otro {
  align-self: flex-start;
  align-items: flex-start;
}
.otro .bubble {
  background-color: #ffffff;
  color: #111;
  border-radius: 0 10px 10px 10px;
}

/* --- DETALLES --- */
.bubble {
  padding: 8px 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  font-size: 0.95rem;
  line-height: 1.4;
  position: relative;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-size: 0.75rem;
  color: #e542a3;
  font-weight: bold;
  margin-bottom: 2px;
  margin-left: 5px;
}

.time {
  font-size: 0.65rem;
  color: #999;
  align-self: flex-end;
  margin-top: 4px;
}

/* --- INPUT --- */
.input-area {
  padding: 10px;
  background-color: #f0f2f5;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 24px;
  outline: none;
  font-size: 1rem;
  background-color: #ffffff;
}

.btn-send {
  background-color: #00a884;
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-send:hover:not(:disabled) { background-color: #008f6f; }
.btn-send:disabled { background-color: #ccc; cursor: not-allowed; }
</style>