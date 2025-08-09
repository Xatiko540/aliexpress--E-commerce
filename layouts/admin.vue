<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="['bg-white shadow-md h-screen top-0 overflow-y-auto z-50 lg:sticky transition-transform duration-300 ease-in-out', isSidebarOpen ? 'fixed left-0 w-64' : 'fixed -translate-x-full w-64', 'lg:translate-x-0 lg:w-72']"
      @click.self="closeSidebar"
    >
      <div class="p-4 text-xl font-bold border-b flex justify-between items-center">
        <span>Админ Панель</span>
        <button @click="closeSidebar" class="lg:hidden">
          <Icon name="ph:x" size="20" />
        </button>
      </div>
        <nav class="p-4 space-y-2 text-sm">
          <template v-for="(group, idx) in sidebarItems" :key="idx">
            <div>
              <p class="text-gray-500 font-medium mt-4 mb-1">{{ group.label }}</p>
              <router-link
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-2 px-2 py-2 rounded hover:text-blue-600 hover:bg-blue-50"
                :class="{ 'bg-blue-100 text-blue-700 font-semibold': route.path === item.to }"
              >
                <Icon :name="item.icon" size="16" />
                <span>{{ item.text }}</span>
              </router-link>
            </div>
          </template>
        </nav>
    </aside>

    <!-- Content Area -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Header / App Bar -->
    <header class="bg-white border-b shadow-sm p-4 flex justify-between items-center">
      <button @click="toggleSidebar" class="lg:hidden p-2 rounded-full hover:bg-gray-200">
        <Icon name="mdi:menu" size="24" />
      </button>
      <h1 class="text-lg font-semibold hidden lg:block">Админ Панель</h1>
      <div class="flex items-center space-x-4">
        <div class="text-sm text-gray-600">
          {{ user?.email || '—' }}
        </div>
        <button class="p-2 rounded-full hover:bg-gray-200" @click="logout">
          <Icon name="ph:sign-out" size="20" />
        </button>
      </div>
    </header>

      <!-- Dynamic Slot Content -->
      <main class="flex-1 p-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScroll, useStorage } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { nextTick } from 'vue'


import { useAuthStore } from '~/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const user = computed(() => authStore.user)

const logout = () => {
  useCookie('auth_token').value = null
  authStore.logout()
  router.push('/auth')
}

// sidebar state
const isSidebarOpen = ref(false)
const savedSidebar = useStorage('sidebarOpen', false)

watch(isSidebarOpen, (val) => {
  savedSidebar.value = val
})

// scroll state
const scroll = useScroll(window)
const savedY = useStorage('scrollY', 0)

watch(() => scroll.y.value, (y) => {
  savedY.value = y
})

// restore sidebar + scroll
onMounted(() => {
  if (process.client) {
    window.history.scrollRestoration = 'auto'
    const unwatch = useRouter().beforeEach(() => {
      window.history.scrollRestoration = 'manual'
      unwatch()
    })
    window.addEventListener('unload', () => {
      window.history.scrollRestoration = 'auto'
    })
  }
})

// navigation logic
const route = useRoute()

const navigate = async (to: string) => {
  if (route.path !== to) {
    savedY.value = window.scrollY
    await router.push(to)
    await nextTick()
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedY.value, behavior: 'auto' })
    })
  }
}

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

// sidebar menu
const sidebarItems = [
  {
    label: ' Главное',
    items: [
      { text: 'Дашборд', to: '/admin', icon: 'ph:house' },
    ]
  },
  {
    label: ' Центр товаров',
    items: [
      { text: 'Управление товарами', to: '/admin/products', icon: 'ph:package' },
      { text: 'Добавление товара', to: '/admin/create', icon: 'ph:plus-square' },
      // { text: 'Выкупы клиентов', to: '/admin/buybacks', icon: 'ph:recycle' },
      // { text: 'Ручная переработка', to: '/admin/manualbuybacks', icon: 'ph:toolbox' },
    ]
  },
  {
    label: ' Центр транзакций',
    items: [
      { text: 'Список заказов (Выкупы,переработка)', to: '/admin/orders', icon: 'ph:list' },
      // { text: 'История возвратов', to: '/admin/history', icon: 'ph:clock-counter-clockwise' },
      // { text: 'Добавить заказ вручную', to: '/admin/manual', icon: 'ph:file-plus' },
      // { text: 'Общая статистика', to: '/admin/stats', icon: 'ph:chart-line' },
      { text: 'Отчёт по продажам', to: '/admin/sales-report', icon: 'ph:shopping-cart' },

    ]
  },
  {
    label: ' Центр пользователей',
    items: [
      { text: 'Список участников', to: '/admin/users', icon: 'ph:users' },
      // { text: 'Уровни участников', to: '/admin/levels', icon: 'ph:stairs' },
      { text: 'Запросы на вывод', to: '/admin/finance/withdrawals', icon: 'ph:currency-dollar-simple' },
      { text: 'Запросы на пополнение', to: '/admin/finance/topups', icon: 'ph:bank' },
      { text: 'Начисление бонусов', to: '/admin/bonuses', icon: 'ph:gift' },
      { text: 'Ссылки и активность', to: '/admin/referrals', icon: 'ph:link' },
      // { text: 'Клиенты менеджеров', to: '/admin/clients', icon: 'ph:user-list' },
    ]
  },

]
</script>