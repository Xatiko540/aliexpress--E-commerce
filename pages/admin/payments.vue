<template>
  <AdminLayout>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">История платежей</h2>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left">
          <thead class="text-xs uppercase bg-gray-200">
            <tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Пользователь</th>
              <th class="px-4 py-2">Сумма</th>
              <th class="px-4 py-2">Дата</th>
              <th class="px-4 py-2">Статус</th>
              <th class="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-for="payment in payments" :key="payment.id" class="border-b">
              <td class="px-4 py-2">{{ payment.id }}</td>
              <td class="px-4 py-2">{{ payment.user?.email || '—' }}</td>
              <td class="px-4 py-2 text-orange-500">{{ payment.amount }} ₽</td>
              <td class="px-4 py-2">{{ payment.date?.slice(0,10) }}</td>
              <td class="px-4 py-2">{{ payment.status }}</td>
              <td class="px-4 py-2">
                <div class="flex flex-wrap gap-1">
                  <button class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Подтвердить</button>
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
import AdminLayout from "@/layouts/admin.vue";
const payments = ref([])

onMounted(async () => {
  const res = await useFetch('/api/payments')
  payments.value = res.data.value || []
})
</script>

<style scoped>
</style>
