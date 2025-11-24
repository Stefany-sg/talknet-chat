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
/* (PEGA AQUÍ LOS MISMOS ESTILOS INDENTADOS DE ANTES - NO CAMBIARON) */
.chat-container { display: flex; flex-direction: column; height: 100%; background: #fff; }
.chat-header { height: 60px; background-color: #f0f2f5; border-bottom: 1px solid #d1d7db; display: flex; align-items: center; padding: 0 15px; }
.info-grupo { display: flex; align-items: center; gap: 15px; }
.icono-grupo { width: 40px; height: 40px; background-color: #dfe5e7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.detalles { display: flex; flex-direction: column; justify-content: center; }
.titulo-chat { font-weight: bold; font-size: 1rem; color: #111; }
.subtitulo-chat { font-size: 0.8rem; color: #667781; }
.mensajes-area { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background-color: #e5ddd5; }
.empty-state { text-align: center; color: #888; margin-top: 20px; font-style: italic; }
.mensaje-sistema { display: flex; justify-content: center; margin: 10px 0; width: 100%; }
.mensaje-sistema span { padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-style: italic; box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1); }
.sys-in { background-color: rgba(212, 237, 218, 0.9); color: #155724; }
.sys-out { background-color: rgba(248, 215, 218, 0.9); color: #721c24; }
.mensaje-wrapper { max-width: 70%; display: flex; flex-direction: column; }
.mensaje-wrapper.propio { align-self: flex-end; align-items: flex-end; }
.mensaje-wrapper.propio .burbuja { background: #d9fdd3; color: #111; border-radius: 10px 0 10px 10px; }
.mensaje-wrapper.ajeno { align-self: flex-start; align-items: flex-start; }
.mensaje-wrapper.ajeno .burbuja { background: white; color: #111; border-radius: 0 10px 10px 10px; }
.burbuja { padding: 8px 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); font-size: 0.95rem; word-wrap: break-word; position: relative; }
.autor { font-size: 0.75rem; color: #555; margin-bottom: 2px; margin-left: 5px; }
.hora { font-size: 0.65rem; margin-left: 10px; color: #999; float: right; margin-top: 4px; }
.input-area { padding: 10px; border-top: 1px solid #ddd; display: flex; gap: 10px; background: #f0f2f5; }
input { flex: 1; padding: 12px; border-radius: 8px; border: none; outline: none; font-size: 1rem; }
button { padding: 0 24px; background: #008069; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
button:disabled { background: #ccc; cursor: not-allowed; }
</style>