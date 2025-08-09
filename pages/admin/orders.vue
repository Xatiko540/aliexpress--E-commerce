<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Список заказов</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-200 text-xs uppercase">
              <tr>
                <th class="px-4 py-2">ID</th>
                <th class="px-4 py-2">Пользователь</th>
                <th class="px-4 py-2">Сумма</th>
                <th class="px-4 py-2">Город</th>
                <th class="px-4 py-2">Адрес</th>
                <th class="px-4 py-2">Дата</th>
                <th class="px-4 py-2">Начислить</th>
                <th class="px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr v-for="order in orders" :key="order.id" class="border-b">
                <td class="px-4 py-2">{{ order.id }}</td>
                <td class="px-4 py-2">{{ order.user?.email || '—' }}</td>
                <td class="px-4 py-2 text-orange-500">{{ order.total }} ₽</td>
                <td class="px-4 py-2">{{ order.city }}</td>
                <td class="px-4 py-2">{{ order.address }}</td>
                <td class="px-4 py-2">{{ order.created_at?.slice(0, 10) }}</td>
                <td class="px-4 py-2">
                  <input
                    v-if="!order.confirmed"
                    v-model.number="order.reward"
                    type="number"
                    class="w-24 border rounded p-1"
                    placeholder="₽"
                    min="1"
                  />
                  <span v-else class="text-green-600">{{ order.reward }} ₽</span>
                </td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1">
                    <button
                      class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                      @click="confirmOrder(order.id, order.userId, order.reward)"
                      :disabled="order.confirmed || !order.reward"
                    >
                      {{ order.confirmed ? '✅ Подтверждено' : 'Подтвердить' }}
                    </button>
                    <button
                      class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                      @click="deleteOrder(order.id)"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from "@/layouts/admin.vue"

interface Order {
  id: number
  userId: string
  user?: { email?: string }
  city: string
  address: string
  created_at?: string
  confirmed: boolean
  orderItem: { product: { price: number } }[]
  total: number
  reward: number
}

const orders = ref<Order[]>([])

const confirmOrder = async (orderId: number, userId: string, reward: number) => {
  if (!reward || reward <= 0) return

  try {
    await $fetch('/api/prisma/confirm-order', {
      method: 'POST',
      body: { orderId, userId, reward }
    })

    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.confirmed = true
      order.reward = reward
    }

  } catch (err) {
    console.error('Ошибка при подтверждении:', err)
  }
}

const deleteOrder = async (orderId: number) => {
  try {
    await $fetch('/api/prisma/delete-order', {
      method: 'POST',
      body: { orderId }
    })
    orders.value = orders.value.filter(o => o.id !== orderId)
  } catch (err) {
    console.error('Ошибка при удалении:', err)
  }
}

onMounted(async () => {
  const res = await useFetch<Order[]>('/api/prisma/get-all-orders')

  if (res.data.value) {
    orders.value = res.data.value.map((order) => ({
      ...order,
      total: order.orderItem.reduce((sum: number, item: any) => sum + item.product.price, 0),
      confirmed: order.confirmed,
      reward: 0 // Устанавливаем reward по умолчанию
    }))
  }
})
</script>