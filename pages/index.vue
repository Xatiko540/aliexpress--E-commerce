<template>
  <MainLayout>
    <div class="w-full max-w-[1150px] mx-auto mt-6 px-3 relative">
      <Swiper
          :modules="modules"
          :navigation="{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }"
          :pagination="{ clickable: true, el: '.swiper-pagination' }"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          loop
        class="rounded-md overflow-hidden shadow"
      >
        <SwiperSlide>
          <img src="/1920x1720.webp" alt="Баннер 1" class="w-full object-cover max-h-[400px] sm:max-h-[300px] xs:max-h-[200px]" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/1920x1720 (1).webp" alt="Баннер 2" class="w-full object-cover max-h-[400px] sm:max-h-[300px] xs:max-h-[200px]" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/1920x1720 (2).webp" alt="Баннер 3" class="w-full object-cover max-h-[400px] sm:max-h-[300px] xs:max-h-[200px]" />
        </SwiperSlide>
      </Swiper>
      <div class="swiper-pagination mt-2 flex justify-center gap-1"></div>
      <button class="swiper-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10 hidden sm:flex">
        <Icon name="ph:arrow-left-bold" size="20" />
      </button>
      <button class="swiper-next absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10 hidden sm:flex">
        <Icon name="ph:arrow-right-bold" size="20" />
      </button>
    </div>

    <div class="w-full max-w-[1200px] mx-auto px-3 mt-10">
      <div class="text-center text-2xl font-bold text-gray-800 border-b pb-2 border-gray-300">
        Shop by category
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-[1200px] mx-auto px-3 mt-6 min-h-[300px]">
      <div class="bg-sky-100 p-4 rounded-xl flex flex-col gap-4 h-full">
        <div>
          <h3 class="text-3xl font-bold italic">Viva</h3>
          <p class="text-gray-700">Your fashion choice</p>
          <button class="bg-black text-white py-2 px-4 rounded mt-2">Shop now</button>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-3 gap-2">
          <div v-for="(product, i) in promoProducts" :key="i" class="bg-white p-2 rounded shadow">
            <img :src="product.image" class="rounded mb-2 w-full" />
            <div class="text-sm font-bold">
              {{ product.price }}
              <span class="line-through text-xs text-gray-400">{{ product.oldPrice }}</span>
            </div>
            <div class="text-xs text-gray-600">
              ⭐ {{ product.rating }} | {{ product.sold }} sold
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 h-full flex flex-col justify-between">
        <div class="relative overflow-hidden rounded-xl border border-gray-200 group h-full touch-pan-x">
          <div class="absolute top-2 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button @click="prev" class="bg-white p-2 rounded-full shadow hover:bg-gray-100">◀</button>
            <button @click="next" class="bg-white p-2 rounded-full shadow hover:bg-gray-100">▶</button>
          </div>
          <div
            ref="carousel"
            class="flex transition-transform duration-500 ease-in-out w-full min-h-[300px] overflow-hidden snap-x snap-mandatory"
            @touchstart="startTouch"
            @touchmove="moveTouch"
          >
            <div
              class="min-w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 px-3 py-2 snap-start"
              v-for="(chunk, index) in categoryChunks"
              :key="index"
            >
            <div
              v-for="(cat, i) in chunk"
              :key="i"
              class="flex items-center justify-between bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition group h-28 sm:h-32 md:h-36"
              @click="navigateToCategory(cat.title)"
            >
              <!-- Текст -->
              <div class="p-3 sm:p-4 flex items-center w-1/2">
                <h3 class="text-xs sm:text-sm md:text-lg font-bold text-gray-800 leading-tight">
                  {{ cat.title }}
                </h3>
              </div>

              <!-- Фото -->
              <div class="w-1/2 h-full flex items-center justify-center bg-white">
                <img
                  :src="cat.image"
                  alt=""
                  class="h-16 sm:h-20 md:h-24 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-[1200px] mx-auto px-3 mt-10">
      <div class="text-center text-2xl font-bold text-gray-800 border-b pb-2 border-gray-300">
        More to love
      </div>
    </div>

    <div id="IndexPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <div class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
        <template v-if="products">
          <ProductComponent
            v-for="p in products"
            :key="p.id"
            :product="p"
            class="animate-fade-in"
          />
        </template>
        <template v-else>
          <div v-for="i in 12" :key="i" class="bg-gray-200 rounded-lg animate-pulse p-4">
            <div class="h-40 bg-gray-300 rounded mb-4"></div>
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </template>
          <!-- Индикатор загрузки -->
      <div v-if="isLoading && hasMore" class="text-center py-4 text-gray-500">
            Loading...
          </div>

          <!-- Триггер подгрузки -->
          <div
            v-if="hasMore"
            id="load-more-trigger"
            class="h-10"
          ></div>

      </div>
    </div>
  </MainLayout>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useHead } from '#imports'

import MainLayout from '~/layouts/MainLayout.vue'
import ProductComponent from '~/components/ProductComponent.vue'
import { useUserStore } from '~/stores/user'
import { useRouter } from 'vue-router'

const modules = [Navigation, Pagination, Autoplay]
const userStore = useUserStore()
const router = useRouter()

// --- Категории и промо ---
const promoProducts = [
  { image: 'cat7.avif', price: '$4.48', oldPrice: '$19.97', rating: 4.8, sold: '1,000+' },
  { image: 'cat9.avif', price: '$3.37', oldPrice: '$17.75', rating: 4.7, sold: '3,000+' },
  { image: 'cat12.avif', price: '$0.99', oldPrice: '$9.41', rating: 4.5, sold: '5,000+' },
]
const allCategories = [
  { title: 'Plus Sized Clothing', image: 'cat1.webp' },
  { title: 'Computer & Office', image: 'cat2.webp' },
  { title: 'Phones & Telecom', image: 'cat3.webp' },
  { title: 'Home & Garden', image: 'cat4.webp' },
  { title: 'Sports & Entertainment', image: 'cat6.webp' },
  { title: 'Beauty & Health', image: 'p1.webp' },
  { title: 'Toys & Games', image: 'cat8.webp' },
  { title: 'Luggage, Bags & Shoes', image: 'p2.webp' },
  { title: 'Automotive & Motorcycle', image: 'cat10.webp' },
  { title: 'Electronics', image: 'cat11.webp' },
  { title: 'Pet Supplies', image: 'p3.webp' },
]

// --- Навигация по категориям ---
function navigateToCategory(title) {
  router.push({ path: '/categories', query: { cat: title } })
}

// --- Слайдер категорий ---
const startX = ref(0)
const carousel = ref(null)
const activeSlide = ref(0)


const categoryChunks = computed(() => {
  const size = 6
  const chunks = []
  for (let i = 0; i < allCategories.length; i += size) {
    chunks.push(allCategories.slice(i, i + size))
  }
  return chunks
})
function startTouch(e) { startX.value = e.touches[0].clientX }

function moveTouch(e) {
  if (!carousel.value) return
  const deltaX = e.touches[0].clientX - startX.value
  carousel.value.scrollLeft -= deltaX
  startX.value = e.touches[0].clientX
}

function next() { if (carousel.value) carousel.value.scrollLeft += carousel.value.offsetWidth }

function prev() { if (carousel.value) carousel.value.scrollLeft -= carousel.value.offsetWidth }

// --- Пагинация товаров ---
const products = ref([])
const page = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)

const loadProducts = async () => {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true

  const newProducts = await $fetch(`/api/prisma/get-products-paginated?page=${page.value}&limit=20`)

  if (!newProducts.length) {
    hasMore.value = false
  } else {
    products.value.push(...newProducts)
    page.value++
  }

  isLoading.value = false
}

onMounted(() => {
  loadProducts()

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadProducts()
    }
  }, { threshold: 1 })

  const sentinel = document.getElementById('load-more-trigger')
  if (sentinel) observer.observe(sentinel)

  setTimeout(() => { userStore.isLoading = false }, 1000)
})

useHead({
  title: 'Aliexpress | Home',
  meta: [{ name: 'description', content: 'Welcome to the best store!' }]
})


</script>




<!-- <style scoped>
::-webkit-scrollbar {
  display: none;
}
</style> -->


<style scoped>

::-webkit-scrollbar {
  display: none;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

.swiper-pagination-bullet {
  background: rgba(0, 0, 0, 0.4);
  opacity: 1;
}
.swiper-pagination-bullet-active {
  background: #000;
}
</style>





