<script setup>
// IMPORTACIONES
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useUserStore } from '../stores/user'
import ChatBox from '../components/ChatBox.vue'

// STORES (ESTADO GLOBAL)
// Store principal del chat: maneja mensajes, WebSocket, presencia (US-02, US-03, US-04)
const store = useChatStore()

// Store del usuario: maneja autenticación y datos del usuario logueado (US-01)
const userStore = useUserStore()

// CICLO DE VIDA - INICIALIZACIÓN
// Cuando el componente se monta, iniciamos el sistema de chat
onMounted(() => {
  // Este método hace 3 cosas:
  // 1. Conecta el WebSocket para tiempo real (US-02)
  // 2. Carga el historial de mensajes (US-03)
  // 3. Activa los listeners de presencia (US-04)
  store.iniciar() 
})
</script>

<template>
  <!-- LAYOUT PRINCIPAL: Estructura de la aplicación (Header + Contenido)    -->
  <div class="main-layout">
    
    <!-- HEADER: Barra superior con título, contador y controles de usuario -->

    <header class="app-header">
      <div class="header-content">
        
        <!-- Lado izquierdo: Logo y contador de usuarios online (US-04) -->
        <div class="header-left">
           <h1>TalkNet 💬</h1>
           <!-- Contador dinámico que muestra cuántos usuarios están conectados -->
           <span v-if="store.conectado" class="online-counter">
             🟢 {{ store.connectedUsers }} Online
           </span>
        </div>
        
        <!-- Lado derecho: Información del usuario y botón de salir -->
        <!-- Solo se muestra si hay un usuario autenticado (US-01) -->
        <div v-if="userStore.usuario" class="user-controls">
          <span class="user-info">
             <!-- Avatar del usuario (si existe) -->
             <img v-if="userStore.usuario.avatar" 
                  :src="userStore.usuario.avatar" 
                  class="avatar" />
             <!-- Nombre o email del usuario -->
             {{ userStore.usuario.nombre || userStore.usuario.email }}
          </span>
          
          <!-- Botón para cerrar sesión -->
          <button @click="userStore.logout" class="btn-logout">Salir</button>
        </div>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL: Área donde se renderiza el chat               -->
    <main class="content-area">
      <div class="chat-wrapper">
        <!-- Componente principal del chat que contiene:
             - Lista de mensajes (US-02, US-03)
             - Notificaciones de sistema (US-04)
             - Input para enviar mensajes (US-02)
             - Contador de usuarios online en el header interno (US-04) -->
        <ChatBox />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* LAYOUT GENERAL: Estructura básica de la aplicación                         */
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ocupa toda la altura de la ventana */
  background-color: #f7f9fc; /* Fondo gris claro para contraste */
  font-family: 'Inter', 'Segoe UI', sans-serif; /* Tipografía moderna */
}

/* HEADER: Barra superior con branding y controles                            */
.app-header {
  background-color: #2c3e50; /* Azul marino oscuro profesional */
  color: white;
  height: 64px; /* Altura fija para consistencia */
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2); /* Sombra para dar profundidad */
  z-index: 10; /* Mantener encima de otros elementos */
}

/* Contenedor interno del header: centra el contenido y limita el ancho */
.header-content {
  width: 100%;
  max-width: 1200px; /* Ancho máximo para pantallas grandes */
  margin: 0 auto; /* Centrado horizontal */
  padding: 0 25px;
  display: flex;
  justify-content: space-between; /* Separa elementos izq/der */
  align-items: center;
}

/* Título principal de la aplicación */
.app-header h1 { 
  margin: 0; 
  font-size: 1.6rem; 
  font-weight: 700; 
  color: #ffffff; /* Blanco puro para máximo contraste */
}

/* Controles del usuario (avatar, nombre, botón salir) */
.user-controls {
  display: flex;
  align-items: center;
  gap: 20px; /* Espacio entre elementos */
  font-size: 1rem;
}

/* Contenedor de información del usuario */
.user-info { 
  display: flex; 
  align-items: center; 
  gap: 10px; /* Espacio entre avatar y nombre */
  font-weight: 500;
}

/* Avatar circular del usuario */
.avatar {
  width: 34px; 
  height: 34px; 
  border-radius: 50%; /* Hace la imagen circular */
  border: 3px solid #6c7a89; /* Borde para destacar */
  object-fit: cover; /* Recorta la imagen si no es cuadrada */
}

/* Botón de cerrar sesión con estilo discreto pero visible */
.btn-logout {
  background: #6d1200; /* Rojo oscuro */
  border: 1px solid rgba(255, 95, 95, 0.3); /* Borde sutil */
  color: white;
  padding: 8px 18px; 
  border-radius: 6px; 
  cursor: pointer;
  font-size: 0.9rem; 
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s; /* Animación suave */
}

/* Efecto hover del botón de logout */
.btn-logout:hover { 
  background: rgba(255,255,255,0.2); /* Más claro al pasar el mouse */
  border-color: white; /* Borde más visible */
}

/* ÁREA DE CONTENIDO: Zona central donde vive el chat                         */
.content-area {
  flex: 1; /* Ocupa todo el espacio disponible */
  display: flex; 
  justify-content: center; /* Centra horizontalmente */
  padding: 20px; /* Espacio alrededor del chat */
  overflow: hidden; /* Evita scroll horizontal */
}

/* CONTENEDOR DEL CHAT: Caja principal que contiene ChatBox.vue               */
.chat-wrapper {
  width: 100%; 
  max-width: 950px; /* Ancho máximo para no ser muy ancho en pantallas grandes */
  height: 100%; /* Ocupa toda la altura disponible */
  background: white; /* Fondo blanco para el área de chat */
  box-shadow: 0 5px 20px rgba(0,0,0,0.1); /* Sombra suave para elevar visualmente */
  border-radius: 12px; /* Bordes redondeados modernos */
  overflow: hidden; /* Evita que el contenido interno sobresalga */
}
</style>