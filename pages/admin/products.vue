<template>
  <AdminLayout>
    <main class="p-6">
      <h2 class="text-2xl font-bold mb-4">Список товаров</h2>

      <div class="mb-4 bg-white p-4 rounded shadow flex flex-wrap gap-4 items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Название товара..."
          class="border p-2 rounded w-full max-w-xs"
        />
        <button
          @click="fetchProducts"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Применить фильтр
        </button>
      </div>

      <div class="overflow-x-auto bg-white p-4 rounded shadow">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-200 text-xs uppercase">
            <tr>
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Изображение</th>
              <th class="px-3 py-2">Название</th>
              <th class="px-3 py-2">Цена</th>
              <th class="px-3 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="border-b"
            >
              <td class="px-3 py-2">{{ product.id }}</td>
              <td class="px-3 py-2">
                <img
                   :src="product.images?.[0]?.url"
                  alt="product"
                  class="w-12 h-12 object-cover rounded"
                />
              </td>
              <td class="px-3 py-2">{{ product.title }}</td>
              <td class="px-3 py-2">{{ product.price / 100 }} ₽</td>
              <td class="px-3 py-2 space-x-1">
                  <button
                      @click="startEdit(product)"
                      class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800"
                    >
                      Редактировать
                    </button>
                    <button
                      @click="deleteProduct(product.id)"
                      class="text-xs px-2 py-1 rounded bg-red-100 text-red-800"
                    >
                      Удалить
                    </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Модалка редактирования -->
      <div v-if="editingProduct" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[400px] space-y-4 shadow-lg">
          <h3 class="text-lg font-semibold">Редактирование товара</h3>
          <input v-model="editingProduct.title" placeholder="Название" class="w-full border p-2 rounded" />
          <input v-model.number="editingProduct.price" type="number" placeholder="Цена (в копейках)" class="w-full border p-2 rounded" />
          <textarea v-model="editingProduct.description" placeholder="Описание" class="w-full border p-2 rounded"></textarea>
          <input type="file" multiple @change="handleImageUpload" class="w-full border p-2 rounded" />
          <div class="flex gap-2 overflow-x-auto">
              <img
                v-for="(src, index) in imagePreviews"
                :key="index"
                :src="src"
                class="w-16 h-16 object-cover rounded border"
              />
            </div>
          <div class="flex justify-end gap-2">
            <button @click="editingProduct = null" class="text-gray-500 px-4 py-1">Отмена</button>
            <button @click="submitEdit" class="bg-green-500 text-white px-4 py-1 rounded">Сохранить</button>
          </div>
        </div>
      </div>
    </main>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from "@/layouts/admin.vue";

const products = ref([])
const searchQuery = ref('')
const editingProduct = ref(null)
const imageFiles = ref([])

const fetchProducts = async () => {
  const res = await useFetch('/api/prisma/get-all-products')
  products.value = res.data.value || []
}

const startEdit = (product) => {
  editingProduct.value = { ...product }
  imageFiles.value = []
  imagePreviews.value = []

  // если у продукта уже есть изображения
  if (product.images && Array.isArray(product.images)) {
    imagePreviews.value = product.images.map(img => img.url)
  }
}

const imagePreviews = ref([])

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  imageFiles.value = files
  imagePreviews.value = files.map(file => URL.createObjectURL(file))
}

const deleteProduct = async (id) => {
  if (!confirm('Удалить этот товар?')) return
  try {
    await $fetch(`/api/prisma/products/${id}`, { method: 'DELETE' })
    await fetchProducts()
  } catch (err) {
    console.error('Ошибка при удалении товара:', err)
    alert('Ошибка при удалении товара')
  }
}

const submitEdit = async () => {
  const formData = new FormData()
  formData.append('title', editingProduct.value.title)
  formData.append('price', editingProduct.value.price.toString())
  formData.append('description', editingProduct.value.description || '')

  imageFiles.value.forEach(file => {
    formData.append('images', file)
  })

  await $fetch(`/api/prisma/products/${editingProduct.value.id}`, {
    method: 'PATCH',
    body: formData
  })
  await fetchProducts()
    editingProduct.value = null
    imageFiles.value = []
    imagePreviews.value = []
}



const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter(p =>
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(fetchProducts)
</script>

<style scoped>
</style>