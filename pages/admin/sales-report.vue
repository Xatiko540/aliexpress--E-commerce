<template>
  <AdminLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold">Отчёт по продажам</h1>

      <div class="bg-white rounded shadow p-4 space-y-4">
        <!-- Фильтр по датам -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Дата начала</label>
            <input type="date" class="mt-1 block w-full border rounded p-2" v-model="startDate">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Дата окончания</label>
            <input type="date" class="mt-1 block w-full border rounded p-2" v-model="endDate">
          </div>
          <div class="flex items-end">
            <button 
              @click="fetchReport" 
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Сформировать отчёт
            </button>
          </div>
        </div>

        <!-- Таблица -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="text-left px-4 py-2">ID заказа</th>
                <th class="text-left px-4 py-2">Пользователь</th>
                <th class="text-left px-4 py-2">Товар</th>
                <th class="text-left px-4 py-2">Сумма</th>
                <th class="text-left px-4 py-2">Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="orders.length === 0">
                <td colspan="5" class="text-center py-4 text-gray-500">Нет данных за выбранный период</td>
              </tr>
              <tr v-for="order in orders" :key="order.id" class="border-t">
                <td class="px-4 py-2">{{ order.id }}</td>
                <td class="px-4 py-2">{{ order.user }}</td>
                <td class="px-4 py-2">{{ order.product }}</td>
                <td class="px-4 py-2">{{ order.amount }} ₽</td>
                <td class="px-4 py-2">{{ new Date(order.date).toLocaleDateString('ru-RU') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Итог -->
        <div v-if="orders.length" class="text-right font-bold text-lg pt-4 border-t">
          Итого: {{ totalAmount }} ₽ ({{ orders.length }} заказов)
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/admin.vue'
import { ref, computed } from 'vue'

const startDate = ref('')
const endDate = ref('')
const orders = ref([])
const loading = ref(false)

const totalAmount = computed(() => orders.value.reduce((sum, o) => sum + o.amount, 0))

const fetchReport = async () => {
  if (!startDate.value || !endDate.value) {
    alert('Выберите обе даты')
    return
  }

  loading.value = true
  try {
    const res = await $fetch('/api/admin/sales-report', {
      credentials: 'include',
      query: {
        startDate: startDate.value,
        endDate: endDate.value
      }
    })
    orders.value = res.data || []
  } catch (err) {
    console.error('Ошибка загрузки отчёта', err)
    alert(err?.data?.statusMessage || err.message || 'Ошибка загрузки отчёта')
  } finally {
    loading.value = false
  }
}
</script>