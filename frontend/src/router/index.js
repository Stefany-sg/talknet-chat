import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// 1. IMPORTAR TU VISTA NUEVA (US-03) - (Codigo de tu compañero)
import ChatView from '../views/ChatView.vue'

// Importaciones para la US-01 (Login e Identidad)
import LoginView from '../views/LoginView.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // La ruta raiz ahora carga el Login (Requerimiento US-01)
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    // Se mantiene la HomeView original pero se mueve a /home para no perderla
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    // 2. AGREGAR LA RUTA DEL CHAT (Con proteccion de seguridad añadida)
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      // Guard de navegacion: Evita entrar al chat sin identificarse
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore()
        // Verificamos si existe usuario en memoria o persistencia
        const hayUsuario = userStore.usuario || localStorage.getItem('talknet_invitado')

        if (hayUsuario) {
          next() // Permite entrar
        } else {
          next('/') // Redirige al Login si no esta identificado
        }
      }
    },
  ],
})

export default router