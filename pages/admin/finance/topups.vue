<template>
  <AdminLayout>
    <div class="max-w-[1200px] mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Заявки на пополнение</h1>
        <button @click="fetchRequests" class="text-sm text-blue-600 underline">🔄 Обновить</button>
      </div>

      <!-- 🔽 Фильтр по статусу -->
      <div class="mb-4">
        <select v-model="status" class="border p-2 rounded">
          <option value="">Все</option>
          <option value="PENDING">Ожидают</option>
          <option value="APPROVED">Одобрены</option>
          <option value="REJECTED">Отклонены</option>
        </select>
      </div>

      <div class="overflow-auto bg-white rounded-lg shadow p-4">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-2">ID</th>
              <th class="text-left p-2">Email</th>
              <th class="text-left p-2">Сумма</th>
              <th class="text-left p-2">Stripe ID</th>
              <th class="text-left p-2">Статус</th>
              <th class="text-left p-2">Дата</th>
              <th class="text-left p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in requests" :key="r.id" class="border-t">
              <td class="p-2">{{ r.id }}</td>
              <td class="p-2">{{ r.user.email }}</td>
              <td class="p-2">{{ r.amount }}₽</td>
              <td class="p-2 text-xs text-gray-500 break-all">{{ r.stripeId }}</td>
              <td class="p-2">
                <span :class="statusClass(r.status)">{{ r.status }}</span>
                <div v-if="r.status === 'REJECTED'" class="text-xs text-red-500 mt-1 italic">
                  Отклонено админом
                </div>
              </td>
              <td class="p-2">{{ formatDate(r.createdAt) }}</td>
              <td class="p-2 space-x-2">
                <button
                  v-if="r.status === 'PENDING'"
                  @click="approve(r.id)"
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >Одобрить</button>
                <button
                  v-if="r.status === 'PENDING'"
                  @click="reject(r.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >Отклонить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminLayout from '@/layouts/admin.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const requests = ref([])
const status = ref('') // 🔄 Статус-фильтр

const fetchRequests = async () => {
  try {
    const res = await $fetch('/api/admin/topup-requests', {
      credentials: 'include',
      query: status.value ? { status: status.value } : {}
    })
    requests.value = res.data
  } catch (e) {
    console.error('Ошибка загрузки заявок', e)
    alert('Ошибка загрузки заявок')
  }
}

const formatDate = (d) => new Date(d).toLocaleString('ru-RU')

const statusClass = (status) => {
  if (status === 'APPROVED') return 'text-green-600 font-bold'
  if (status === 'REJECTED') return 'text-red-600 font-bold'
  return 'text-yellow-600 font-bold'
}

const approve = async (id) => {
  if (!confirm('Одобрить заявку?')) return
  await $fetch(`/api/admin/topup-requests/${id}/approve`, { method: 'POST', credentials: 'include' })
  fetchRequests()
}

const reject = async (id) => {
  if (!confirm('Отклонить заявку?')) return
  await $fetch(`/api/admin/topup-requests/${id}/reject`, { method: 'POST', credentials: 'include' })
  fetchRequests()
}

onMounted(fetchRequests)
watch(status, fetchRequests) // 🔁 Автообновление при изменении фильтра
</script>