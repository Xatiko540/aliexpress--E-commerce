<template>
  <AdminLayout>
    <div class="p-6 space-y-8">

      <!-- Основная статистика -->
      <div>
        <h2 class="text-xl font-bold mb-4">Общая статистика</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Всего товаров</h3>
            <p class="text-2xl font-bold">{{ products.length }}</p>
          </div>
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Активные заказы</h3>
            <p class="text-2xl font-bold">{{ orders.length }}</p>
          </div>
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Пользователи</h3>
            <p class="text-2xl font-bold">{{ users.length }}</p>
          </div>
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Продажи (₽)</h3>
            <p class="text-2xl font-bold">{{ totalSales }}</p>
          </div>
        </div>
      </div>

      <!-- Финансовая статистика -->
      <div>
        <h2 class="text-xl font-bold mb-4">Финансы</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Активные заявки на пополнение</h3>
            <p class="text-2xl font-bold">{{ topups.length }}</p>
          </div>
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Ожидают вывода средств</h3>
            <p class="text-2xl font-bold">{{ withdrawals.length }}</p>
          </div>
          <div class="bg-white shadow rounded p-4">
            <h3 class="text-sm text-gray-500">Общий баланс пользователей</h3>
            <p class="text-2xl font-bold">{{ totalBalance }}₽</p>
          </div>
        </div>
      </div>

      <!-- Графики -->
      <ClientOnly>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white shadow rounded p-4">
           <apexchart type="line" height="300" :options="chartOptions.sales" :series="series.sales" />
          </div>
          <div class="bg-white shadow rounded p-4">
            <apexchart type="bar" height="300" :options="chartOptions.orders" :series="series.orders" />
          </div>
          <div class="bg-white shadow rounded p-4 md:col-span-2">
            <apexchart type="area" height="300" :options="chartOptions.users" :series="series.users" />
          </div>
        </div>
      </ClientOnly>



          <!-- Список чатов -->
    <div v-if="!activeChat" class="chat__list">
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="openChat(chat)"
        class="chat__list__item"
      >
        <img :src="chat.avatar || defaultAvatar" class="chat__avatar" />
        <div class="chat__info">
          <p class="chat__name">{{ chat.name }}</p>
          <p class="chat__last">{{ chat.lastMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Активный чат -->
    <div v-else class="chat__content">
      <ChatContainer :chat="activeChat" @back="activeChat = null" />
    </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/admin.vue'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import ChatContainer from '@/components/ChatContainer.vue'



const userName = ref(' anonymity')
const defaultAvatar = '/avatar.svg'


const getMonthlyStats = (items, dateKey = 'created_at') => {
  const result = new Array(12).fill(0)
  for (const item of items) {
    const date = new Date(item[dateKey])
    const month = date.getMonth()
    result[month] += 1
  }
  return result
}

const getMonthlySales = (orders) => {
  const result = new Array(12).fill(0)
  for (const order of orders) {
    const month = new Date(order.created_at).getMonth()
    const orderSum = (order.orderItem || []).reduce(
      (sum, item) => sum + (item.product?.price || 0),
      0
    )
    result[month] += orderSum
  }
  return result
}

const chartSales = computed(() => getMonthlySales(orders.value))
const chartOrders = computed(() => getMonthlyStats(orders.value))
const chartUsers = computed(() => getMonthlyStats(users.value))

const series = computed(() => ({
  sales: [{ name: 'Продажи', data: chartSales.value }],
  orders: [{ name: 'Заказы', data: chartOrders.value }],
  users: [{ name: 'Пользователи', data: chartUsers.value }]
}))

const chats = ref([
  {
    id: 1,
    name: 'support center',
    lastMessage: 'Reply to message',
    avatar: '/avatar.svg'
  },
  // {
  //   id: 2,
  //   name: 'Тест Юзер',
  //   lastMessage: 'Привет, как дела?',
  //   avatar: '/avatar.svg'
  // }
])

const activeChat = ref(null)

function openChat(chat) {
  activeChat.value = chat
}

const authStore = useAuthStore()
const router = useRouter()

const products = ref([])
const orders = ref([])
const users = ref([])
const topups = ref([])
const withdrawals = ref([])
const totalSales = ref(0)
const totalBalance = ref(0)


useHead({
  title: 'Aliexpress | Admin Dashboard',
  meta: [
    { name: 'description', content: 'Manage your Admin Dashboard on Aliexpress' }
  ]
})

const fetchStats = async () => {
  const results = await Promise.allSettled([
    $fetch('/api/prisma/get-all-products'),
    $fetch('/api/prisma/get-all-orders'),
    $fetch('/api/prisma/get-all-users'),
    $fetch('/api/admin/topup-requests?status=PENDING', { credentials: 'include' }),
    $fetch('/api/admin/withdrawals?status=PENDING', { credentials: 'include' }),
  ])

  const [productsRes, ordersRes, usersRes, topupsRes, withdrawalsRes] = results

  products.value = productsRes.status === 'fulfilled' ? productsRes.value : []
  orders.value = ordersRes.status === 'fulfilled' ? ordersRes.value : []
  users.value = usersRes.status === 'fulfilled' ? usersRes.value : []
  topups.value = topupsRes.status === 'fulfilled' ? topupsRes.value.data : []
  withdrawals.value = withdrawalsRes.status === 'fulfilled' ? withdrawalsRes.value.data : []

  totalSales.value = orders.value.reduce((sum, order) => {
  const orderSum = (order.orderItem || []).reduce(
    (subtotal, item) => subtotal + (item.product?.price || 0),
    0
  )
  return sum + orderSum
}, 0)

  totalBalance.value = users.value.reduce((sum, u) => sum + (u.balance || 0), 0)
}


// const series = {
//   sales: [{ name: 'Продажи', data: [10, 41, 35, 51, 49, 62, 69, 91, 100, 110, 95, 130] }],
//   orders: [{ name: 'Заказы', data: [5, 15, 20, 30, 25, 35, 40, 38, 50, 60, 45, 70] }],
//   users: [{ name: 'Пользователи', data: [100, 120, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900] }]
// }

const monthLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const chartOptions = {
  sales: { chart: { id: 'sales' }, xaxis: { categories: monthLabels } },
  orders: { chart: { id: 'orders' }, xaxis: { categories: monthLabels } },
  users: { chart: { id: 'users' }, xaxis: { categories: monthLabels } }
}


onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.fetchUser()
  }


   if (authStore.user?.role !== 'ADMIN') {
    alert('Доступ запрещён: только для администраторов')
    return router.push('/') // не админ — на главную
  }

  // const user = authStore.user
  // if (!user) return router.push('/auth')
  // if (user.role !== 'admin') {
  //   alert('Доступ запрещён: только для администраторов')
  //   return router.push('/')
  // }

  await fetchStats()
})

</script>