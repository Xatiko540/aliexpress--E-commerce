<script setup lang="ts">
import AdminLayout from "@/layouts/admin.vue"
import { ref } from 'vue'

const title = ref('')
const description = ref('')
const price = ref(0)
const url = ref('')
const category = ref('')
const success = ref(false)

const submit = async () => {
  try {
    const res = await $fetch('/api/prisma/create-product', {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value,
        price: price.value,
        url: url.value,
        category: category.value,
        images: [url.value] // отправляем в массив, даже если 1 изображение
      }
    })

    if (res?.id) {
      success.value = true
      setTimeout(() => navigateTo('/admin/products'), 1500)
    }
  } catch (err) {
    console.error('Ошибка при добавлении товара:', err)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="p-6 bg-gray-100 min-h-screen">
      <div class="bg-white p-6 shadow rounded max-w-xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Добавить товар</h1>

        <div v-if="success" class="mb-4 text-green-600">Товар успешно добавлен!</div>

        <form @submit.prevent="submit" class="space-y-4">
          <input v-model="title" type="text" placeholder="Название" class="w-full p-2 border rounded" required />
          <textarea v-model="description" placeholder="Описание" class="w-full p-2 border rounded" required></textarea>
          <input v-model="price" type="number" placeholder="Цена в руб." class="w-full p-2 border rounded" required />
          <input v-model="url" type="text" placeholder="URL изображения" class="w-full p-2 border rounded" required />

          <select v-model="category" class="w-full p-2 border rounded" required>
            <option value="">Выберите категорию</option>
            <option value="electronics">Электроника</option>
            <option value="fashion">Одежда</option>
            <option value="home">Дом</option>
            <option value="books">Книги</option>
            <option value="other">Другое</option>
          </select>

          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Добавить товар
          </button>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>