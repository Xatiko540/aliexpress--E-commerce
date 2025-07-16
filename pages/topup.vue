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

        <hr />

        <!-- Transactions -->
        <div>
          <h2 class="text-lg font-semibold mb-2">Transaction history</h2>
          <ul class="text-sm list-disc list-inside">
            <li v-for="tx in transactions" :key="tx.id">{{ tx.type }}: {{ tx.amount }}₽</li>
          </ul>
        </div>

        <hr />

<form @submit.prevent="submitStripeTopup" class="space-y-4">

  <!-- Платёжные бренды -->
  <div class="flex items-center gap-3 mb-1">
    <img src="/visa.png" alt="Visa" class="h-5" />
    <img src="/mastercard.png" alt="MasterCard" class="h-5" />
    <img src="/applepay.png" alt="Apple Pay" class="h-5" />
  </div>

  <!-- Ввод суммы -->
  <input
    type="number"
    v-model.number="topUpAmount"
    placeholder="Сумма в копейках"
    class="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-400"
    @input="handleTopupAmountChange"
    min="1"
  />

  <!-- Stripe Card Element -->
  <div v-show="stripeReady" id="topup-card-element" class="border border-gray-300 p-3 rounded shadow-sm bg-white" />

  <!-- Ошибка Stripe -->
  <p id="topup-card-error" class="text-red-600 text-sm font-medium"></p>

<!-- Кнопка оплаты -->
<div class="flex justify-end">
  <button
    type="submit"
    class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-all duration-150 ease-in-out flex items-center gap-2"
    :disabled="isProcessingTopup || !stripeReady"
    :class="isProcessingTopup ? 'opacity-60 cursor-not-allowed' : ''"
  >
    <Icon v-if="isProcessingTopup" name="eos-icons:loading" />
    <span v-else>Pay and top up</span>
  </button>
</div>
</form>

        <hr />


<!-- Withdrawal Request -->
<div>
  <h2 class="text-lg font-semibold mb-2">Withdrawal of funds</h2>
  <form @submit.prevent="submitWithdraw" class="space-y-2">
    <input
      type="number"
      v-model.number="withdrawAmount"
      placeholder="Sum (₽)"
      class="border rounded w-full p-2"
      min="1"
    />
    <input
      type="text"
      v-model="cardInfo"
      placeholder="Card (**** **** **** 1234)"
      class="border rounded w-full p-2"
    />
    <p v-if="withdrawError" class="text-red-600 text-sm font-medium">{{ withdrawError }}</p>
    <button
      :disabled="isWithdrawing"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      <span v-if="isWithdrawing">Sending...</span>
      <span v-else>Request withdrawal</span>
    </button>
  </form>
</div>

        <hr />

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




const isWithdrawing = ref(false)
const withdrawError = ref('')

const submitWithdraw = async () => {
  withdrawError.value = ''

  if (!withdrawAmount.value || withdrawAmount.value <= 0) {
    withdrawError.value = 'Введите корректную сумму'
    return
  }

  if (!cardInfo.value || cardInfo.value.length < 4) {
    withdrawError.value = 'Введите корректные данные карты'
    return
  }

  if (withdrawAmount.value > user.balance) {
    withdrawError.value = 'Недостаточно средств на балансе'
    return
  }

  try {
    isWithdrawing.value = true
    await $fetch('/api/withdrawal-request', {
      method: 'POST',
      body: {
        amount: withdrawAmount.value,
        cardInfo: cardInfo.value
      }
    })
    await authStore.fetchUser() 
    router.push('/success')
  } catch (e) {
    withdrawError.value = e?.data?.message || 'Ошибка при отправке запроса'
  } finally {
    isWithdrawing.value = false
  }
}


useHead({
  title: 'Aliexpress | Balance',
  meta: [
    { name: 'description', content: 'Manage your Balance on Aliexpress' }
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

  if (!authStore.isInitialized) return

  if (!authStore.user) {
    return router.push('/auth')
  }


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
    await authStore.fetchUser() 
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

// const submitWithdraw = async () => {
//   try {
//     await $fetch('/api/withdrawal-request', {
//       method: 'POST',
//       body: {
//         amount: withdrawAmount.value,
//         cardInfo: cardInfo.value
//       }
//     })
//     router.push('/success') // ✅ перенаправляем
//   } catch (e) {
//     alert('Ошибка: ' + e?.data?.message)
//   }
// }

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