import { createRouter, createWebHistory } from 'vue-router'
// Solo importamos las vistas reales de TalkNet
import LoginView from '../views/LoginView.vue'
import ChatView from '../views/ChatView.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. Ruta Raíz -> Login 
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    // 2. Ruta Chat -> ChatView  - Protegida
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      // Guard de navegación: Evita entrar sin login
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore()
        // Verificamos si existe usuario en memoria o huella en localStorage
        const hayUsuario = userStore.usuario || localStorage.getItem('talknet_invitado')

        if (hayUsuario) {
          next() // Pase
        } else {
          next('/') // Al login
        }
      }
    },
    // 3. Comodín: Si alguien escribe cualquier cosa rara, mandarlo al login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

export default router