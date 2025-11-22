// client/src/stores/chat.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
  // 1. ESTADO: Aquí se guardará la lista de mensajes
  const messages = ref([]);

  // 2. ACCIÓN (US-03): Ir al servidor a buscar los mensajes
  const fetchMessages = async () => {
    try {
      // Conectamos con tu backend en el puerto 3001
      const response = await fetch('http://localhost:3001/api/messages');
      
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();
      
      // Guardamos los datos en la variable 'messages'
      messages.value = data;
      console.log(" Historial cargado:", data);
      
    } catch (error) {
      console.error(" Error cargando el chat:", error);
    }
  };

  return { messages, fetchMessages };
});