import { createRouter, createWebHistory } from 'vue-router'
import DisplayCardView from '../views/DisplayCardView.vue'
import DragAndDropView from '@/views/DragAndDropView.vue'
import MainView from '@/views/MainView.vue'
import EditCardView from '../views/EditCardView.vue'
import LoginView from '@/views/LoginView.vue'

// Helper-Funktion zur Authentifizierungsprüfung
const isAuthenticated = () => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    return cookies.some(cookie => cookie.startsWith('token='))
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView,
      meta: { requiresAuth: true },
    },
    {
      path: '/newSet',
      name: 'newSet',
      component: DragAndDropView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/card-set/:id',
      name: 'DisplayCard',
      component: DisplayCardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/edit-set/:id',
      name: 'EditCardSet',
      component: EditCardView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    // Catch-all route für 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Verbesserter Navigation Guard
router.beforeEach((to, from, next) => {
  // Debug logging
  console.log('Navigation Guard:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated: isAuthenticated(),
  })

  // Prüfe Authentifizierung
  const authenticated = isAuthenticated()

  // Wenn die Route Authentifizierung erfordert und der User nicht eingeloggt ist
  if (to.meta.requiresAuth && !authenticated) {
    console.log(
      'Route requires auth and user is not authenticated, redirecting to login',
    )
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // Speichere ursprüngliche Route
    })
    return
  }

  // Wenn User eingeloggt ist und zur Login-Seite navigiert
  if (to.path === '/login' && authenticated) {
    console.log(
      'User is authenticated and trying to access login page, redirecting to home',
    )
    next({ path: '/' })
    return
  }

  // In allen anderen Fällen normal weiterleiten
  console.log('Proceeding with navigation')
  next()
})

// Handler für Navigations-Fehler
router.onError(error => {
  console.error('Navigation Error:', error)
  // Optional: Hier könnte man einen globalen Error-Handler einbauen
})

export default router
