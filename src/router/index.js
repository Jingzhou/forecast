import { createRouter, createWebHistory } from 'vue-router'
import xiaoliuren from '../view/xiaoliuren/index.vue'
import divination from '../view/divination/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'xiaoliuren' }
    },
    {
      path: '/xiaoliuren',
      name: 'xiaoliuren',
      component: xiaoliuren
    },
    {
      path: '/divination',
      name: 'divination',
      component: divination
    }
  ]
})

export default router
