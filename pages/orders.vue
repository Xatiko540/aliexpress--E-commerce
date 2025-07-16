<template>
  <MainLayout>
    <div id="OrdersPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div class="bg-white w-full p-6 min-h-[150px]">
        <div class="flex items-center text-xl mb-4">
          <Icon name="carbon:delivery" color="#5FCB04" size="35" />
          <span class="pl-4 font-semibold">{{ $t('orders.title') }}</span>
        </div>

        <div 
          v-if="orders.length > 0" 
          v-for="order in orders" 
          :key="order.id"
          class="text-sm pl-[50px]"
        >
          <div class="border-b py-1">
            <p>{{ $t('orders.stripeId') }}: {{ order.stripeId }}</p>

            <div class="pt-2 space-y-2">
              <div 
                v-for="item in order.orderItem" 
                :key="item.id"
              >
                <NuxtLink 
                  class="flex items-center gap-3 p-1 hover:underline hover:text-blue-500" 
                  :to="`/item/${item.productId}`"
                >
                  <img width="40" :src="item.product.url">
                  {{ item.product.title }}
                </NuxtLink>
              </div>
            </div>

            <div class="pt-2 pb-5 text-gray-500">
              {{ $t('orders.deliveryAddress') }}: {{ order.name }}, {{ order.address }}, 
              {{ order.zipcode }}, {{ order.city }}, {{ order.country }}
            </div>
          </div>
        </div>

        <div v-else class="flex justify-center items-center text-gray-500 py-10">
          {{ $t('orders.empty') }}
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '~/layouts/MainLayout.vue'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

interface Product {
  id: number
  title: string
  description: string
  url: string
  price: number
  category: string
  created_at: Date | null
  sellerId: string | null
}

interface OrderItem {
  id: number
  productId: number
  product: Product
}

interface Order {
  id: number
  stripeId: string
  name: string
  address: string
  zipcode: string
  city: string
  country: string
  orderItem: OrderItem[]
}

const orders = ref<Order[]>([])
const isLoading = ref(true)


useHead({
  title: 'Aliexpress | Orders',
  meta: [
    { name: 'description', content: 'Manage your orders on Aliexpress' }
  ]
})

watchEffect(async () => {
  if (!authStore.isInitialized) return

  if (!authStore.user) {
    return router.push('/auth')
  }

  try {
    const { data } = await useAsyncData('orders', () =>
      $fetch(`/api/prisma/get-all-orders-by-user/${authStore.user?.id || ''}`)
    )
    orders.value = (data.value ?? []).map((order: any) => ({
      ...order,
      orderItem: order.orderItem.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          created_at: item.product.created_at ? new Date(item.product.created_at) : null
        }
      }))
    }))
  } catch (err) {
    console.error('❌ Fetch orders failed:', err)
  } finally {
    isLoading.value = false
    userStore.isLoading = false
  }
})
</script>