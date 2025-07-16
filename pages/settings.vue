<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-6">{{ $t('settings.title') }}</h1>

      <div class="bg-white rounded-lg p-6 shadow-md space-y-6">
        <!-- User Info -->
        <div>
          <h2 class="text-lg font-semibold mb-2">{{ $t('settings.profile') }}</h2>
          <div class="text-sm">{{ $t('settings.email') }}: <strong>{{ user?.email }}</strong></div>
          <div class="text-sm mt-1">Balance: <strong>{{ user?.balance }}₽</strong></div>
        </div>



        <!-- Update Password -->
        <div>
          <h2 class="text-lg font-semibold mb-2">{{ $t('settings.updateTitle') }}</h2>
          <form @submit.prevent="updatePassword" class="space-y-2">
            <input type="password" v-model="newPassword" :placeholder="$t('settings.newPassword')" class="border rounded w-full p-2" />
            <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">{{ $t('settings.updateBtn') }}</button>
          </form>
        </div>

        <hr />

        <!-- Delete Account -->
        <div>
          <h2 class="text-lg font-semibold mb-2 text-red-600">{{ $t('settings.dangerTitle') }}</h2>
          <button @click="deleteAccount" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">{{ $t('settings.deleteBtn') }}</button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import MainLayout from '~/layouts/MainLayout.vue'
import { useCookie, useRuntimeConfig } from '#app'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const authStore = useAuthStore()
const userStore = useUserStore()
const user = authStore.user
const router = useRouter()

const newPassword = ref('')
const topUpAmount = ref(0)
const withdrawAmount = ref(0)
const cardInfo = ref('')
const transactions = ref([])

let stripeTopup = null
let topupElements = null
let topupCard = null
let topupClientSecret = null
const isProcessingTopup = ref(false)
const stripeReady = ref(false)

useHead({
  title: 'Aliexpress | Settings',
  meta: [
    { name: 'description', content: 'Manage your settings on Aliexpress' }
  ]
})


const handleTopupAmountChange = () => {
  stripeReady.value = false
  if (topUpAmount.value > 0) stripeTopupInit()
}

const stripeTopupInit = async () => {
  const runtimeConfig = useRuntimeConfig()
  stripeTopup = Stripe(runtimeConfig.public.stripePk)

  try {
      console.log('🔍 init topup', topUpAmount.value)

      const res = await $fetch('/api/stripe/paymentintent', {
        method: 'POST',
        credentials: 'include',
        body: {
          amount: topUpAmount.value,
          type: 'topup'
        }
      }).catch(err => {
        console.error('❌ paymentintent error:', err.data)
        throw err
      })
    topupClientSecret = res.client_secret

    topupElements = stripeTopup.elements()
    topupCard = topupElements.create('card')
    topupCard.mount('#topup-card-element')
    topupCard.on('change', (event) => {
      document.querySelector('#topup-card-error').textContent = event.error?.message || ''
    })
    stripeReady.value = true
  } catch (e) {
    stripeReady.value = false
    document.querySelector('#topup-card-error').textContent = 'Не менеее 200 '
  }
}

watch(() => topUpAmount.value, () => {
  if (topUpAmount.value > 0) stripeTopupInit()
})

const submitStripeTopup = async () => {
  isProcessingTopup.value = true
  const result = await stripeTopup.confirmCardPayment(topupClientSecret, {
    payment_method: { card: topupCard }
  })

  if (result.error) {
    document.querySelector('#topup-card-error').textContent = result.error.message
    isProcessingTopup.value = false
  } else {
    await $fetch('/api/topup-request', {
      method: 'POST',
      body: {
        amount: topUpAmount.value,
        stripeId: result.paymentIntent.id
      }
    })
    router.push('/success') 
  }
}

onMounted(async () => {
  userStore.isLoading = true
  await authStore.fetchUser()
  userStore.isLoading = false
  transactions.value = await $fetch('/api/transactions')
})

const updatePassword = async () => {
  if (!newPassword.value) return alert('Enter new password')
  try {
    await $fetch('/api/update-password', {
      method: 'POST',
      body: { userId: user.id, newPassword: newPassword.value }
    })
    router.push('/success') // ✅ перенаправляем
  } catch {
    alert('Error updating password')
  }
}

const submitWithdraw = async () => {
  try {
    await $fetch('/api/withdrawal-request', {
      method: 'POST',
      body: {
        amount: withdrawAmount.value,
        cardInfo: cardInfo.value
      }
    })
    router.push('/success') // ✅ перенаправляем
  } catch (e) {
    alert('Ошибка: ' + e?.data?.message)
  }
}

const deleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account?')) return
  try {
    await $fetch('/api/delete-user', {
      method: 'POST',
      body: { userId: user.id }
    })
    useCookie('auth_token').value = null
    authStore.logout()
    router.push('/auth')
  } catch {
    alert('Error deleting account')
  }
}
</script>