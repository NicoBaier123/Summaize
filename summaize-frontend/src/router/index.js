import { createRouter, createWebHistory } from 'vue-router'

import DisplayCardView from '../views/DisplayCardView.vue'
import DragAndDropView from '@/views/DragAndDropView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DisplayCardView,
    },
    {
      path: '/newSet',
      name: 'newSet',
      component: DragAndDropView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/card-set/:id',
      name: 'DisplayCard',
      component: DisplayCardView,
    },
  ],
})

export default router
