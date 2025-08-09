<template>
    <MainLayout>
        <div id="ShoppingCartPage" class="mt-4 max-w-[1200px] mx-auto px-2">
            <div v-if="!userStore.cart.length" class="h-[500px] flex items-center justify-center">
                <div class="pt-20">
                    <img 
                        class="mx-auto"
                        width="250"
                        src="/cart-empty.png"
                    >

                    <div class="text-xl text-center mt-4">{{ $t('cart.empty') }}</div>

                    <div v-if="!user" class="flex text-center">
                        <NuxtLink 
                            to="/auth"
                            class="
                                bg-[#FD374F] 
                                w-full 
                                text-white 
                                text-[21px] 
                                font-semibold 
                                p-1.5 
                                rounded-full
                                mt-4
                            "
                        >
                            {{ $t('cart.signIn') }}
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div v-else class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="md:w-[65%]">
                    <div class="bg-white rounded-lg p-4">

                        <div class="text-2xl font-bold mb-2">
                              {{ $t('cart.title') }} ({{ userStore.cart.length }})
                        </div>

                    </div>

                    <div class="bg-[#FEEEEF] rounded-lg p-4 mt-4">
                        <div class="text-red-500 font-bold">{{ $t('cart.welcomeDeal') }}</div>
                    </div>

                    <div id="Items" class="bg-white rounded-lg p-4 mt-4">
                        <div v-for="product in userStore.cart.filter(p => p)">
                            <CartItem 
                                :product="product" 
                                :selectedArray="selectedArray"
                                @selectedRadio="selectedRadioFunc"
                                @removeItem="removeFromSelected"
                                />
                        </div>
                    </div>
                </div>

                <div class="md:hidden block my-4"/>
                <div class="md:w-[35%]">
                    <div id="Summary" class="bg-white rounded-lg p-4">
                        <div class="text-2xl font-extrabold mb-2">{{ $t('cart.summary') }}</div>
                        <div class="flex items-center justify-between my-4">
                            <div class="font-semibold">{{ $t('cart.total') }}</div>
                            <div class="text-2xl font-semibold">
                                $ <span class="font-extrabold">{{ totalPriceComputed }}</span>
                            </div>
                        </div>
                        <button 
                            @click="goToCheckout"
                            class="
                                flex
                                items-center
                                justify-center
                                bg-[#FD374F] 
                                w-full 
                                text-white 
                                text-[21px] 
                                font-semibold 
                                p-1.5 
                                rounded-full
                                mt-4
                            "
                        >
                              {{ $t('cart.checkout') }}
                        </button>
                    </div>

                    <div id="PaymentProtection" class="bg-white rounded-lg p-4 mt-4">

                        <div class="text-lg font-semibold mb-2">{{ $t('cart.paymentMethods') }}</div>
                        <div class="flex items-center justify-start gap-8 my-4">
                            <div v-for="card in cards">
                                <img class="h-6" :src="card">
                            </div>
                        </div>

                        <div class="border-b"/>
                        <div class="text-lg font-semibold mb-2 mt-2">{{ $t('cart.protectionTitle') }}</div>
                            <p class="my-2">{{ $t('cart.protectionText') }}</p>

                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue'
import MainLayout from '~/layouts/MainLayout.vue'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const userStore = useUserStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const selectedArray = ref<{ id: number }[]>([])



useHead({
  title: 'Aliexpress | Shopping Cart',
  meta: [
    { name: 'description', content: 'Manage your Shopping Cart on Aliexpress' }
  ]
})

onMounted(() => {
  setTimeout(() => {
    userStore.isLoading = false
  }, 200)
})

const cards = ref<string[]>([
  'visa.png',
  'mastercard.png',
  'paypal.png',
  'applepay.png',
])

const totalPriceComputed = computed(() => {
  return (
    userStore.cart
      .filter(p => p) // защита от null
      .reduce((acc, prod) => acc + prod.price, 0) / 100
  ).toFixed(2)
})

const selectedRadioFunc = (item: { id: number; val: boolean }) => {
  const index = selectedArray.value.findIndex((i) => i.id === item.id)
  if (item.val && index === -1) {
    selectedArray.value.push({ id: item.id })
  } else if (!item.val && index !== -1) {
    selectedArray.value.splice(index, 1)
  }
}

const goToCheckout = () => {
  const ids = selectedArray.value.map((item) => item.id)
  const filtered = userStore.cart.filter((item) => ids.includes(item.id))
  userStore.checkout = filtered.map((item) => toRaw(item))
  navigateTo('/checkout')
}


const removeFromSelected = (id: number) => {
  const index = selectedArray.value.findIndex(i => i.id === id)
  if (index !== -1) selectedArray.value.splice(index, 1)
}


</script>