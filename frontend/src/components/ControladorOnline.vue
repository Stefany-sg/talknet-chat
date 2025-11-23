
<!-- US-04: Contador de usuarios conectados en vivo -->
//

<script setup>
import { ref } from 'vue'

// Props
defineProps({
  usuarios: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  }
})

// Estado para expandir/colapsar lista de usuarios
const mostrarLista = ref(false)

const toggleLista = () => {
  mostrarLista.value = !mostrarLista.value
}

// Obtener iniciales del nombre para el avatar
const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="contador-container">
    <!-- Indicador compacto (siempre visible) -->
    <div class="indicador" @click="toggleLista">
      <!-- Punto verde animado -->
      <span class="punto-verde"></span>
      
      <!-- Texto del contador -->
      <span class="texto">{{ total }} en línea</span>
      
      <!-- Flecha para expandir -->
      <span class="flecha" :class="{ 'rotada': mostrarLista }">▼</span>
    </div>

    <!-- Lista desplegable de usuarios -->
    <transition name="slide">
      <div v-if="mostrarLista" class="lista-usuarios">
        <!-- Si hay usuarios -->
        <div 
          v-for="usuario in usuarios" 
          :key="usuario.socketId" 
          class="usuario-item"
        >
          <!-- Avatar con iniciales -->
          <div class="avatar">
            {{ obtenerIniciales(usuario.nombre) }}
            <span class="punto-online"></span>
          </div>
          
          <!-- Nombre del usuario -->
          <span class="nombre">{{ usuario.nombre }}</span>
        </div>

        <!-- Si no hay usuarios -->
        <div v-if="usuarios.length === 0" class="sin-usuarios">
          No hay usuarios conectados
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.contador-container {
  position: relative;
}

/* Indicador compacto */
.indicador {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.indicador:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

/* Punto verde pulsante */
.punto-verde {
  width: 8px;
  height: 8px;
  background-color: #4ade80;
  border-radius: 50%;
  animation: pulso 2s ease-in-out infinite;
}

@keyframes pulso {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.texto {
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.flecha {
  font-size: 0.6rem;
  color: white;
  opacity: 0.7;
  transition: transform 0.2s;
}

.flecha.rotada {
  transform: rotate(180deg);
}

/* Lista desplegable */
.lista-usuarios {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.usuario-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.usuario-item:last-child {
  border-bottom: none;
}

/* Avatar */
/* */
.avatar {
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 50%;
}

.punto-online {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
}

.nombre {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

.sin-usuarios {
  padding: 15px;
  text-align: center;
  color: #999;
  font-size: 0.85rem;
}

/* Animación slide */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>