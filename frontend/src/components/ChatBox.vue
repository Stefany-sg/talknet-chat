<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useUserStore } from '../stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()

const texto = ref('')
const fondoChat = ref(null)

const bajarScroll = () => {
  if (fondoChat.value) {
    fondoChat.value.scrollTo({ top: fondoChat.value.scrollHeight, behavior: 'smooth' })
  }
}

watch(() => chatStore.messages.length, async () => {
  await nextTick()
  bajarScroll()
})

onMounted(() => {
  bajarScroll()
})

const enviar = () => {
  if (texto.value.trim()) {
    chatStore.enviarMensaje(texto.value)
    texto.value = ''
  }
}
</script>

<template>
  <div class="chat-container">
    
    <div class="chat-header">
      <div class="info-grupo">
        <div class="icono-grupo">👥</div>
        <div class="detalles">
          <span class="titulo-chat">Sala General</span>
          <span class="subtitulo-chat">
             {{ chatStore.connectedUsers }} participantes en línea
          </span>
        </div>
      </div>
    </div>

    <div class="mensajes-area" ref="fondoChat">
      <div v-if="chatStore.messages.length === 0" class="empty-state">
        <p>No hay mensajes aún. ¡Saluda! 👋</p>
      </div>

      <template v-for="msg in chatStore.messages" :key="msg.id || Math.random()">
        
        <div v-if="msg.tipo === 'sistema'" class="mensaje-sistema">
           <span v-if="msg.contenido.includes('desconectado')" class="sys-out">
             🚪 {{ msg.contenido }}
           </span>
           <span v-else class="sys-in">
             👋 {{ msg.contenido }}
           </span>
        </div>

        <div v-else
          class="mensaje-wrapper"
          :class="{ 
            'propio': userStore.usuario && msg.usuarioId === userStore.usuario.id, 
            'ajeno': !userStore.usuario || msg.usuarioId !== userStore.usuario.id 
          }"
        >
          <small class="autor" v-if="!userStore.usuario || msg.usuarioId !== userStore.usuario.id">
            {{ msg.email || 'Anónimo' }}
          </small>
          
          <div class="burbuja">
            {{ msg.contenido }}
            <span v-if="msg.fecha" class="hora">
              {{ new Date(msg.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
            </span>
          </div>
        </div>

      </template>
    </div>

    <div class="input-area">
      <input 
        v-model="texto" 
        @keyup.enter="enviar" 
        placeholder="Escribe un mensaje..." 
        :disabled="!userStore.usuario" 
      />
      <button 
        @click="enviar" 
        :disabled="!texto || !userStore.usuario"
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
  height: 100%; 
  background: #fff; /* Fondo de la caja es blanco */
}

/* --- CHAT HEADER (SALA GENERAL) --- */
.chat-header { 
  height: 70px; /* Más espacio */
  background-color: #ffffff; 
  border-bottom: 1px solid #e2e8f0; /* Borde más sutil */
  display: flex; 
  align-items: center; 
  padding: 0 20px; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.info-grupo { 
  display: flex; 
  align-items: center; 
  gap: 12px; /* Espacio reducido */
}

.icono-grupo { 
  width: 44px; 
  height: 44px; 
  background-color: #3b82f6; /* Azul corporativo */
  color: white;
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.4rem; 
  font-weight: 600;
}

.detalles { 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
}

.titulo-chat { 
  font-weight: 700; 
  font-size: 1.1rem; 
  color: #1a202c; 
}

.subtitulo-chat { 
  font-size: 0.9rem; 
  color: #718096; /* Gris más legible */
}

/* --- MENSAJES AREA --- */
.mensajes-area { 
  flex: 1; 
  padding: 20px 25px; /* Más padding horizontal */
  overflow-y: auto; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; /* Espacio reducido entre mensajes */

  /* Fondo limpio, textura sutil */
  background-color: #fcfcfc; 
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.05"><circle cx="50" cy="50" r="1" fill="%23d0d0d0" /></svg>');
  background-size: 50px 50px;
}

.empty-state { 
  text-align: center; 
  color: #a0aec0; 
  margin-top: 50px; 
  font-size: 1rem;
  font-style: normal; /* No itálica, más limpio */
}

/* --- MENSAJES SISTEMA (Se elimina el CSS de aquí, se delega a MensajeSistema.vue) --- */
.mensaje-sistema { 
  display: flex; 
  justify-content: center; 
  margin: 5px 0; /* Más compacto */
  width: 100%; 
}

/* --- BURBUJAS DE MENSAJE --- */
.mensaje-wrapper { 
  max-width: 65%; /* Un poco más estrecho */
  display: flex; 
  flex-direction: column; 
  position: relative;
}

.autor { 
  font-size: 0.8rem; 
  color: #5472aa; /* Color del autor en azul */
  font-weight: 600;
  margin-bottom: 2px; 
  margin-left: 5px; 
}

.burbuja { 
  padding: 10px 14px; /* Más padding interno */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
  font-size: 0.98rem; 
  word-wrap: break-word; 
  position: relative;
  line-height: 1.4;
}

/* AJENO (OTROS) */
.mensaje-wrapper.ajeno { 
  align-self: flex-start; 
  align-items: flex-start; 
}

.mensaje-wrapper.ajeno .burbuja { 
  background: #ffffff; /* Blanco */
  color: #1a202c; 
  border-radius: 0 12px 12px 12px; 
}

/* Flecha ajena */
.mensaje-wrapper.ajeno .burbuja::before {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  border-width: 6px 8px 6px 0;
  border-style: solid;
  border-color: transparent #ffffff transparent transparent;
}

/* PROPIO (TÚ) */
.mensaje-wrapper.propio { 
  align-self: flex-end; 
  align-items: flex-end; 
}

.mensaje-wrapper.propio .burbuja { 
  /* Verde claro y elegante (como un verde azulado) */
  background: #5a94ff; 
  color: #1a202c; 
  border-radius: 12px 0 12px 12px; 
}

/* Flecha propia */
.mensaje-wrapper.propio .burbuja::before {
  content: '';
  position: absolute;
  top: 0;
  right: -7px;
  border-width: 6px 0 6px 7px;
  border-style: solid;
  border-color: transparent transparent transparent #5a94ff;
}

/* HORA */
.hora { 
  font-size: 0.7rem; 
  margin-left: 12px; 
  color: rgba(0, 0, 0, 0.4); /* Gris oscuro y sutil */
  float: right; 
  margin-top: 6px; 
  white-space: nowrap; /* Evita que la hora se rompa */
}

/* --- ÁREA DE ENTRADA --- */
.input-area { 
  padding: 12px 20px; /* Más padding */
  border-top: 1px solid #e2e8f0; 
  display: flex; 
  gap: 10px; 
  background: #ffffff; 
}

input { 
  flex: 1; 
  padding: 10px 15px; 
  border-radius: 20px; /* Más redondeado */
  border: 1px solid #cbd5e0; /* Borde sutil */
  outline: none; 
  font-size: 1rem; 
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4c5f7e; /* Borde azul al enfocarse */
  box-shadow: 0 0 0 1px #5170a2;
}

button { 
  padding: 0 20px; 

  /* Azul corporativo */
  background: #3b82f6; 
  color: white; 
  border: none; 
  border-radius: 20px; /* Redondeado igual al input */
  cursor: pointer; 
  font-weight: 600; 
  font-size: 1rem;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled { 
  background: #a0aec0; 
  cursor: not-allowed; 
}
</style>