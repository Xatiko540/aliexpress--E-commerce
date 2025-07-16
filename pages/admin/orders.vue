<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Список заказов</h2>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left">
            <thead class="text-xs uppercase bg-gray-200">
              <tr>
                <th class="px-4 py-2">ID</th>
                <th class="px-4 py-2">Пользователь</th>
                <th class="px-4 py-2">Сумма</th>
                <th class="px-4 py-2">Город</th>
                <th class="px-4 py-2">Адрес</th>
                <th class="px-4 py-2">Дата</th>
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
                <td class="px-4 py-2">{{ order.created_at?.slice(0,10) }}</td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1">
                   <button
                      class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                      @click="confirmOrder(order.id)"
                      :disabled="order.confirmed"
                    >
                      {{ order.confirmed ? '✅ Подтверждено' : 'Подтвердить' }}
                    </button>
                    <button class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Удалить</button>
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

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from "@/layouts/admin.vue"

const orders = ref([])

const confirmOrder = async (orderId) => {
  try {
    const res = await $fetch('/api/prisma/confirm-order', {
      method: 'POST',
      body: { id: orderId }
    })

    const index = orders.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders.value[index].confirmed = true
    }
  } catch (err) {
    console.error('❌ Ошибка при подтверждении:', err)
  }
}

onMounted(async () => {
  const res = await useFetch('/api/prisma/get-all-orders')
  orders.value = (res.data.value || []).map(order => ({
    ...order,
    total: order.orderItem.reduce((sum, item) => sum + item.product.price, 0)
  }))
})
</script>