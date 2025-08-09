<template>
  <AdminLayout>
    <main class="p-6">
      <h2 class="text-2xl font-bold mb-4">История возвратов</h2>
      <div class="overflow-x-auto bg-white p-4 rounded shadow">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-200 text-xs uppercase">
            <tr>
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Пользователь</th>
              <th class="px-3 py-2">Товар</th>
              <th class="px-3 py-2">Статус</th>
              <th class="px-3 py-2">Сумма (₽)</th>
              <th class="px-3 py-2">Подтверждён</th>
              <th class="px-3 py-2">Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ret in returns" :key="ret.id" class="border-b">
              <td class="px-3 py-2">{{ ret.id }}</td>
              <td class="px-3 py-2">{{ ret.user?.email || '—' }}</td>
              <td class="px-3 py-2">{{ ret.product?.title || '—' }}</td>
              <td class="px-3 py-2">{{ ret.status }}</td>
              <td class="px-3 py-2">{{ ret.amount ?? '—' }}</td>
              <td class="px-3 py-2">{{ ret.confirmed ? '✅' : '⏳' }}</td>
              <td class="px-3 py-2">{{ formatDate(ret.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/admin.vue'
import { ref, onMounted } from 'vue'

const returns = ref([])

const fetchReturns = async () => {
  const { data, error } = await useFetch('/api/prisma/get-return-history')

  if (!error.value && Array.isArray(data.value)) {
    // сортировка на фронте по дате (на всякий случай)
    returns.value = data.value.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  } else {
    console.error('Ошибка загрузки возвратов', error.value)
  }
}

onMounted(fetchReturns)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>