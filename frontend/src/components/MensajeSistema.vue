<!-- frontend/src/components/MensajeSistema.vue -->
<!-- US-04: Componente para mostrar notificaciones de sistema -->

<script setup>
// Props que recibe el componente
defineProps({
  mensaje: {
    type: Object,
    required: true
    // Estructura esperada:
    // {
    //   tipo: 'sistema',
    //   evento: 'user_joined' | 'user_left',
    //   mensaje: 'Usuario_123 se ha unido',
    //   timestamp: '2024-01-15T10:30:00Z'
    // }
  }
})

// Formatear hora del mensaje
const formatearHora = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<template>
  <div 
    class="mensaje-sistema" 
    :class="{
      'usuario-unido': mensaje.evento === 'user_joined',
      'usuario-salio': mensaje.evento === 'user_left'
    }"
  >
    <!-- Icono según el evento -->
    <span class="icono">
      {{ mensaje.evento === 'user_joined' ? '→' : '←' }}
    </span>
    
    <!-- Texto del mensaje (GRIS e ITÁLICA según criterios) -->
    <span class="texto">{{ mensaje.mensaje }}</span>
    
    <!-- Hora -->
    <span class="hora">{{ formatearHora(mensaje.timestamp) }}</span>
  </div>
</template>

<style scoped>
/* ==================================================================
   CRITERIO DE ACEPTACIÓN US-04:
   - Mensaje en GRIS o CURSIVA: "Usuario_123 se ha unido"
   - Mensaje en GRIS o CURSIVA: "Juan Perez se ha desconectado"
   ================================================================== */
/**/
.mensaje-sistema {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  margin: 10px auto;
  max-width: fit-content;
  border-radius: 16px;
  
  /* CRITERIO: Gris e itálica */
  color: #6b7280;
  font-style: italic;
  font-size: 0.85rem;
  background-color: #f0f0f0;
}

.icono {
  font-style: normal;
  font-weight: bold;
  opacity: 0.6;
}

.hora {
  font-size: 0.7rem;
  font-style: normal;
  opacity: 0.5;
}

/* Variante: Usuario se unió (verde sutil) */
.usuario-unido {
  background-color: #ecfdf5;
  color: #059669;
}

.usuario-unido .icono {
  color: #10b981;
}

/* Variante: Usuario salió (gris) */
.usuario-salio {
  background-color: #f3f4f6;
  color: #6b7280;
}

.usuario-salio .icono {
  color: #9ca3af;
}
</style>