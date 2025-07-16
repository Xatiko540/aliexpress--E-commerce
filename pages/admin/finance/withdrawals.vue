<template>
  <AdminLayout>
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Заявки на вывод средств</h1>
        <button @click="load" class="text-sm text-blue-600 underline">🔄 Обновить</button>
      </div>

      <div class="mb-4 flex gap-4">
        <select v-model="status" class="border p-2 rounded">
          <option value="">Все</option>
          <option value="PENDING">Ожидают</option>
          <option value="APPROVED">Одобрены</option>
          <option value="REJECTED">Отклонены</option>
        </select>
        <span class="text-sm text-gray-600 mt-2">Всего: {{ withdrawals.length }}</span>
      </div>

      <div v-if="withdrawals.length === 0" class="text-gray-500">Нет данных</div>
      <div v-else class="space-y-2">
        <div v-for="item in withdrawals" :key="item.id" class="border rounded p-4">
          <div class="flex justify-between">
            <div>
              <div><strong>{{ item.user.email }}</strong> | ID: {{ item.id }}</div>
              <div>Сумма: {{ item.amount }}₽</div>
              <div>Карта: {{ item.cardInfo }}</div>
              <div>
                Статус:
                <span :class="statusClass(item.status)">{{ item.status }}</span>
                <span v-if="item.status === 'REJECTED'" class="text-xs italic text-red-400 ml-1">отклонено</span>
              </div>
              <div>Дата: {{ new Date(item.createdAt).toLocaleString() }}</div>
            </div>
            <div class="space-x-2">
              <template v-if="item.status === 'PENDING'">
                <button @click="approve(item.id)" class="bg-green-500 text-white px-3 py-1 rounded">Одобрить</button>
                <button @click="reject(item.id)" class="bg-red-500 text-white px-3 py-1 rounded">Отклонить</button>
              </template>
              <template v-else-if="item.status === 'APPROVED'">
                <span class="text-green-600 font-bold text-sm flex items-center gap-1">
                  ✅ Одобрено
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, watch } from 'vue'
import AdminLayout from '@/layouts/admin.vue'

const status = ref('')
const withdrawals = ref([])
const error = ref(null)
const loading = ref(false)

const load = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await $fetch('/api/admin/withdrawals', {
      query: status.value ? { status: status.value } : {},
      credentials: 'include'
    })
    console.log('Ответ API:', res)
    withdrawals.value = res.data ?? []
  } catch (err) {
    console.error('Ошибка API:', err)
    error.value = err?.data?.message || err.message || 'Неизвестная ошибка'
  } finally {
    loading.value = false
  }
}

const statusClass = (s) => {
  if (s === 'APPROVED') return 'text-green-600 font-bold'
  if (s === 'REJECTED') return 'text-red-500 font-bold'
  return 'text-yellow-500 font-bold'
}

const approve = async (id) => {
  await $fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST', credentials: 'include' })
  await load() // ✅ Ждём, пока обновятся данные
}

const reject = async (id) => {
  await $fetch(`/api/admin/withdrawals/${id}/reject`, { method: 'POST', credentials: 'include' })
  await load() // ✅ Ждём, пока обновятся данные
}

watch(status, load, { immediate: true })
</script>