<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div style="text-align: center; margin-top: 50px;">
    <h1> Home de TalkNet</h1>
    <p>¡Bienvenido al Chat!</p>
    <br>
    <RouterLink to="/chat" style="font-size: 20px; color: blue; font-weight: bold;">
       IR AL CHAT (US-03)
    </RouterLink>
  </div>
</template>
