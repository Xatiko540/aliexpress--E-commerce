<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-6">{{ $t('settings.title') }}</h1>

      <div class="bg-white rounded-lg p-6 shadow-md space-y-6">
        <!-- Информация о пользователе -->
        <div>
          <h2 class="text-lg font-semibold mb-2">{{ $t('settings.profile') }}</h2>
          <div class="text-sm">{{ $t('settings.email') }}: <strong>{{ authStore.user?.email || 'Загрузка...' }}</strong></div>
        </div>

        <!-- Обновление пароля -->
        <div>
          <h2 class="text-lg font-semibold mb-2">{{ $t('settings.updateTitle') }}</h2>
          <form @submit.prevent="updatePassword" class="space-y-2">
            <input
              type="password"
              v-model="newPassword"
              :placeholder="$t('settings.newPassword')"
              class="border rounded w-full p-2"
            />
            <button
              type="submit"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              :disabled="!newPassword"
            >
              {{ $t('settings.updateBtn') }}
            </button>
          </form>
        </div>

        <hr />

        <!-- Удаление аккаунта -->
        <div>
          <h2 class="text-lg font-semibold mb-2 text-red-600">{{ $t('settings.dangerTitle') }}</h2>
          <button
            @click="deleteAccount"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {{ $t('settings.deleteBtn') }}
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useUserStore } from '~/stores/user';
import { useBuybackStore } from '~/stores/buybacks';
import MainLayout from '~/layouts/MainLayout.vue';
import { useCookie, useRuntimeConfig } from '#app';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();
const buybackStore = useBuybackStore();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const newPassword = ref('');
const topUpAmount = ref<number>(0);
const withdrawAmount = ref<number>(0);
const cardInfo = ref('');
const buybackProductId = ref<number>(0);
const buybackPrice = ref<number>(0);
const transactions = ref<any[]>([]);

let stripeTopup: any = null;
let topupElements: any = null;
let topupCard: any = null;
let topupClientSecret: string | null = null;
const isProcessingTopup = ref(false);
const stripeReady = ref(false);

useHead({
  title: 'Aliexpress | Settings',
  meta: [{ name: 'description', content: 'Manage your settings on Aliexpress' }],
});

// Инициализация Stripe для пополнения
const stripeTopupInit = async () => {
  if (topUpAmount.value < 200) {
    document.querySelector('#topup-card-error')!.textContent = $t('settings.minAmountError');
    stripeReady.value = false;
    return;
  }

  try {
    console.log('🔍 Initializing Stripe for top-up:', topUpAmount.value);
    stripeTopup = (window as any).Stripe(runtimeConfig.public.stripePk);

    const res = await $fetch('/api/stripe/paymentintent', {
      method: 'POST',
      credentials: 'include',
      body: {
        amount: topUpAmount.value,
        type: 'topup',
      },
    }).catch((err) => {
      console.error('❌ PaymentIntent error:', err.data);
      throw err;
    });

    topupClientSecret = res.client_secret;
    topupElements = stripeTopup.elements();
    topupCard = topupElements.create('card');
    topupCard.mount('#topup-card-element');
    topupCard.on('change', (event: any) => {
      document.querySelector('#topup-card-error')!.textContent = event.error?.message || '';
    });
    stripeReady.value = true;
  } catch (e) {
    stripeReady.value = false;
    document.querySelector('#topup-card-error')!.textContent = $t('settings.stripeError');
  }
};

// Обработчик пополнения через Stripe
const submitStripeTopup = async () => {
  if (!topupClientSecret || !stripeTopup || !topupCard) return;

  isProcessingTopup.value = true;
  try {
    const result = await stripeTopup.confirmCardPayment(topupClientSecret, {
      payment_method: { card: topupCard },
    });

    if (result.error) {
      document.querySelector('#topup-card-error')!.textContent = result.error.message;
      isProcessingTopup.value = false;
      return;
    }

    await $fetch('/api/topup-request', {
      method: 'POST',
      body: {
        amount: topUpAmount.value,
        stripeId: result.paymentIntent.id,
        userId: authStore.user?.id,
      },
    });
    await userStore.fetchUser(); // Обновляем баланс
    topUpAmount.value = 0;
    stripeReady.value = false;
    router.push('/success');
  } catch (e) {
    document.querySelector('#topup-card-error')!.textContent = $t('settings.stripeError');
    isProcessingTopup.value = false;
  }
};

// Обработчик вывода средств
const submitWithdraw = async () => {
  if (!withdrawAmount.value || !cardInfo.value) {
    alert($t('settings.withdrawError'));
    return;
  }

  try {
    await $fetch('/api/withdrawal-request', {
      method: 'POST',
      body: {
        userId: authStore.user?.id,
        amount: withdrawAmount.value,
        cardInfo: cardInfo.value,
      },
    });
    await userStore.fetchUser(); // Обновляем баланс
    withdrawAmount.value = 0;
    cardInfo.value = '';
    router.push('/success');
  } catch (e: any) {
    alert(`${$t('settings.error')}: ${e?.data?.message || e.message}`);
  }
};

// Создание выкупа
const createBuyback = async () => {
  if (!buybackProductId.value || !buybackPrice.value) {
    alert($t('settings.buybackError'));
    return;
  }

  try {
    await buybackStore.createBuyback(authStore.user!.id, buybackProductId.value, buybackPrice.value);
    buybackProductId.value = 0;
    buybackPrice.value = 0;
    await buybackStore.fetchUserBuybacks(authStore.user!.id);
  } catch (e: any) {
    alert(`${$t('settings.error')}: ${e?.data?.message || e.message}`);
  }
};

// Обновление пароля
const updatePassword = async () => {
  if (!newPassword.value) {
    alert($t('settings.passwordError'));
    return;
  }

  try {
    await $fetch('/api/update-password', {
      method: 'POST',
      body: { userId: authStore.user!.id, newPassword: newPassword.value },
    });
    newPassword.value = '';
    router.push('/success');
  } catch (e: any) {
    alert(`${$t('settings.error')}: ${e?.data?.message || e.message}`);
  }
};

// Удаление аккаунта
const deleteAccount = async () => {
  if (!confirm($t('settings.confirmDelete'))) return;

  try {
    await $fetch('/api/delete-user', {
      method: 'POST',
      body: { userId: authStore.user!.id },
    });
    useCookie('auth_token').value = null;
    authStore.logout();
    router.push('/auth');
  } catch (e: any) {
    alert(`${$t('settings.error')}: ${e?.data?.message || e.message}`);
  }
};

// Загрузка данных при монтировании
onMounted(async () => {
  userStore.isLoading = true;
  try {
    await authStore.fetchUser();
    if (authStore.user?.id) {
      await userStore.fetchUser();
      await buybackStore.fetchUserBuybacks(authStore.user.id);
      transactions.value = await ($fetch as any)('/api/transactions', {
        query: { userId: authStore.user.id },
      });
    }
  } catch (e) {
    console.error('Error loading data:', e);
  } finally {
    userStore.isLoading = false;
  }
});

// Наблюдение за изменением суммы пополнения
watch(topUpAmount, () => {
  if (topUpAmount.value >= 200) {
    stripeTopupInit();
  } else {
    stripeReady.value = false;
    document.querySelector('#topup-card-error')!.textContent = topUpAmount.value > 0 ? $t('settings.minAmountError') : '';
  }
});
</script>