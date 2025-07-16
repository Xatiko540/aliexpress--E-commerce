<template>
  <AdminLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Начисление бонусов</h1>
      <div class="bg-white shadow rounded p-4">
      <form @submit.prevent="submitBonus" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email пользователя</label>
          <input v-model="email" type="email" placeholder="user@example.com" class="w-full border rounded p-2" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Сумма бонуса (₽)</label>
          <input v-model.number="amount" type="number" min="1" class="w-full border rounded p-2" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <textarea v-model="comment" rows="3" class="w-full border rounded p-2" placeholder="Причина начисления..."></textarea>
        </div>

        <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Начислить бонус
        </button>
      </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/layouts/admin.vue'

const email = ref('')
const amount = ref(0)
const comment = ref('')

const submitBonus = async () => {
  if (!email.value || amount.value <= 0) {
    alert('Введите email и сумму больше 0')
    return
  }

  try {
    await $fetch('/api/admin/bonus', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: email.value,
        amount: amount.value,
        comment: comment.value
      }
    })
    alert('Бонус успешно начислен!')
    email.value = ''
    amount.value = 0
    comment.value = ''
  } catch (e) {
    alert('Ошибка при начислении: ' + (e?.data?.message || e.message))
  }
}
</script>