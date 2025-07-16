<template>
    <MainLayout>
        <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
  
            <div class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="md:w-[65%]">
                    <div class="bg-white rounded-lg p-4">

                        <div class="text-xl font-semibold mb-2">{{ $t('checkout.shipping') }}</div>

                        <div v-if="currentAddress && currentAddress.data">
                            <NuxtLink 
                                to="/address"
                                class="flex items-center pb-2 text-blue-500 hover:text-red-400"
                            >
                                <Icon name="mdi:plus" size="18" class="mr-2"/>
                                {{ $t('checkout.updateAddress') }}
                            </NuxtLink>

                            <div class="pt-2 border-t">
                                <div class="underline pb-1">{{ $t('checkout.deliveryAddress') }}</div>
                                <ul class="text-xs">
                                    <li class="flex items-center gap-2">
                                        <div>{{ $t('checkout.contactName') }}</div> 
                                        <div class="font-bold">{{ currentAddress.data.name }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>{{ $t('checkout.address') }}</div> 
                                        <div class="font-bold">{{ currentAddress.data.address }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>{{ $t('checkout.zip') }}</div> 
                                        <div class="font-bold">{{ currentAddress.data.zipcode }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>{{ $t('checkout.city') }}</div> 
                                        <div class="font-bold">{{ currentAddress.data.city }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>{{ $t('checkout.country') }}</div> 
                                        <div class="font-bold">{{ currentAddress.data.country }}</div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <NuxtLink 
                            v-else
                            to="/address"
                            class="flex items-center text-blue-500 hover:text-red-400"
                        >
                            <Icon name="mdi:plus" size="18" class="mr-2"/>
                            {{ $t('checkout.addAddress') }}
                        </NuxtLink>
                    </div>

                    <div id="Items" class="bg-white rounded-lg p-4 mt-4">
                        <div v-for="product in userStore.checkout">
                            <CheckoutItem :product="product" />
                        </div>
                    </div>
                </div>

                <div class="md:hidden block my-4"/>
                <div class="md:w-[35%]">
                    <div id="PlaceOrder" class="bg-white rounded-lg p-4">

                        <div class="text-2xl font-extrabold mb-2">{{ $t('checkout.summary') }}</div>

                        <div class="flex items-center justify-between my-4">
                            <div class="">{{ $t('checkout.totalShipping') }}</div>
                            <div class="">{{ $t('checkout.free') }}</div>
                        </div>

                        <div class="border-t" />

                        <div class="flex items-center justify-between my-4">
                            <div class="font-semibold">{{ $t('checkout.total') }}</div>
                            <div class="text-2xl font-semibold">
                                $ <span class="font-extrabold">{{ total / 100 }}</span>
                            </div>
                        </div>

                        <form @submit.prevent="pay()">
                            <div 
                                class="border border-gray-500 p-2 rounded-sm" 
                                id="card-element" 
                            />

                            <p 
                                id="card-error" 
                                role="alert" 
                                class="text-red-700 text-center font-semibold" 
                            />

                            <button 
                                :disabled="isProcessing"
                                type="submit"
                                class="
                                mt-4
                                    bg-gradient-to-r 
                                  from-[#FE630C] 
                                  to-[#FF3200]
                                    w-full 
                                    text-white 
                                    text-[21px] 
                                    font-semibold 
                                    p-1.5 
                                    rounded-full
                                "
                                :class="isProcessing ? 'opacity-70' : 'opacity-100'"
                            >
                                <Icon v-if="isProcessing" name="eos-icons:loading" />
                               <div v-else>{{ $t('checkout.placeOrder') }}</div>
                            </button>
                        </form>

                    </div>

                    <div class="bg-white rounded-lg p-4 mt-4">
                        <div class="text-lg font-semibold mb-2 mt-2">{{ $t('checkout.safePayment') }}</div>
                        <p class="my-2">
                            AliExpress keeps your information and payment safe
                        </p>

                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>


<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount, watchEffect } from 'vue'
import MainLayout from '~/layouts/MainLayout.vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'

import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const router = useRouter()
const route = useRoute()

definePageMeta({ middleware: "auth" })

const userStore = useUserStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

let stripe: any = null
let elements: any = null
let card: any = null
let form: any = null
let clientSecret: string | null = null

let total = ref(0)
let currentAddress = ref(null)
let isProcessing = ref(false)


useHead({
  title: 'Aliexpress | Checkout',
  meta: [
    { name: 'description', content: 'Manage your Checkout on Aliexpress' }
  ]
})

onBeforeMount(async () => {
  if (userStore.checkout.length < 1) return router.push('/shoppingcart')

  total.value = 0.00
  if (user.value) {
    currentAddress.value = await useFetch(`/api/prisma/get-address-by-user/${user.value.id}`)
    setTimeout(() => userStore.isLoading = false, 200)
  }
})

watchEffect(() => {
  if (route.fullPath === '/checkout' && !user.value) router.push('/auth')
})

onMounted(() => {
  isProcessing.value = true
  userStore.checkout.forEach(item => total.value += item.price)
})

watch(() => total.value, () => {
  if (total.value > 0) stripeInit()
})

const stripeInit = async () => {
  const runtimeConfig = useRuntimeConfig()
  stripe = Stripe(runtimeConfig.public.stripePk)

  const res = await $fetch('/api/stripe/paymentintent', {
    method: 'POST',
    body: { amount: total.value }
  })
  clientSecret = res.client_secret

  elements = stripe.elements()
  const style = {
    base: { fontSize: "18px" },
    invalid: {
      fontFamily: 'Arial, sans-serif',
      color: "#EE4B2B",
      iconColor: "#EE4B2B"
    }
  }
  card = elements.create("card", { hidePostalCode: true, style })
  card.mount("#card-element")
  card.on("change", (event: any) => {
    document.querySelector("button")!.disabled = event.empty
    document.querySelector("#card-error")!.textContent = event.error?.message || ""
  })

  isProcessing.value = false
}

const pay = async () => {
  if (!currentAddress.value?.data) return showError('Please add shipping address')
  isProcessing.value = true

  const result = await stripe.confirmCardPayment(clientSecret!, {
    payment_method: { card }
  })

  if (result.error) {
    showError(result.error.message)
    isProcessing.value = false
  } else {
    await createOrder(result.paymentIntent.id)
    userStore.cart = []
    userStore.checkout = []
    setTimeout(() => router.push('/success'), 500)
  }
}

const createOrder = async (stripeId: string) => {
  await useFetch('/api/prisma/create-order', {
    method: "POST",
    body: {
      userId: user.value.id,
      stripeId,
      name: currentAddress.value.data.name,
      address: currentAddress.value.data.address,
      zipcode: currentAddress.value.data.zipcode,
      city: currentAddress.value.data.city,
      country: currentAddress.value.data.country,
      products: userStore.checkout
    }
  })
}

const showError = (msg: string) => {
  const errorMsg = document.querySelector("#card-error")
  if (errorMsg) {
    errorMsg.textContent = msg
    setTimeout(() => { errorMsg.textContent = "" }, 4000)
  }
}
</script>