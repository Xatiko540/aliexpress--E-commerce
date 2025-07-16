<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto px-2 py-6 flex flex-col md:flex-row gap-6">
      <!-- 🧭 Sidebar -->
      <aside class="w-full md:w-[220px] border rounded bg-white shadow-md">
        <ul class="text-sm font-medium divide-y">
          <li 
            v-for="cat in sidebar"
            :key="cat"
            class="p-3 hover:bg-gray-100 cursor-pointer text-gray-700 hover:text-[#FF4646]"
            :class="{ 'text-[#FF4646] font-semibold': activeCategory === cat }"
            @click="activeCategory = cat"
          >
            {{ $t(`categories.${cat}`) }}
          </li>
        </ul>
      </aside>

      <!-- 🖼️ Products Display -->
      <section class="flex-1">
        <h2 class="text-xl font-bold mb-4">{{ $t(`categories.${activeCategory}`) }}</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <ProductComponent
            v-for="item in filteredItems"
            :key="item.id"
            :product="item"
          />
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '~/layouts/MainLayout.vue'
import ProductComponent from '~/components/ProductComponent.vue'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()
import { ref, computed, onMounted, watchEffect } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()


useHead({
  title: 'Aliexpress | Categories',
  meta: [
    { name: 'description', content: 'Manage your Categories on Aliexpress' }
  ]
})

const sidebar = [
  'Recommend', 'Women Clothes', 'Watches', 'Bags', 'Men clothes',
  'Education & Office supplies', 'Sports & Outdoor', 'Home appliances',
  'Jewelry & Accessories', 'Automotive & Motorcycle', 'Toys & Hobbies',
  'Shoes', 'Halloween', 'Hair wigs', 'Furniture', 'Beauty & Health'
]

const activeCategory = ref('Recommend')
const allItems = ref([])

const filteredItems = computed(() =>
  allItems.value.filter(item => item.category === activeCategory.value)
)

onMounted(async () => {
  userStore.isLoading = true
  await authStore.fetchUser()
  userStore.isLoading = false
})

watchEffect(async () => {
  try {
    const response = await $fetch('/api/products', {
      query: { category: activeCategory.value }
    })
    allItems.value = response
  } catch (error) {
    console.error('❌ Error fetching products:', error)
  }
})
</script>