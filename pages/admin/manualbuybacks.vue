<template>
  <AdminLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">{{ $t('manualBuybacks.title') }}</h2>
      <div class="bg-white p-4 rounded shadow">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('manualBuybacks.userId') }}</label>
            <input
              v-model="form.userId"
              type="text"
              class="w-full border rounded p-2"
              :placeholder="$t('manualBuybacks.userIdPlaceholder')"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('manualBuybacks.productId') }}</label>
            <input
              v-model.number="form.productId"
              type="text"
              class="w-full border rounded p-2"
              :placeholder="$t('manualBuybacks.productIdPlaceholder')"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('manualBuybacks.price') }}</label>
            <input
              v-model.number="form.price"
              type="number"
              class="w-full border rounded p-2"
              :placeholder="$t('manualBuybacks.pricePlaceholder')"
              min="1"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('manualBuybacks.percent') }}</label>
            <input
              v-model.number="form.percent"
              type="number"
              class="w-full border rounded p-2"
              :placeholder="$t('manualBuybacks.percentPlaceholder')"
              min="0"
              max="100"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('manualBuybacks.comment') }}</label>
            <textarea
              v-model="form.comment"
              class="w-full border rounded p-2"
              rows="3"
              :placeholder="$t('manualBuybacks.commentPlaceholder')"
            ></textarea>
          </div>
          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            :disabled="isLoading"
          >
            {{ isLoading ? $t('manualBuybacks.processing') : $t('manualBuybacks.submitBtn') }}
          </button>
          <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBuybackStore } from '~/stores/buybacks';
import AdminLayout from '@/layouts/admin.vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const router = useRouter();
const buybackStore = useBuybackStore();
const isLoading = ref(false);
const error = ref<string | null>(null);
// Убрано: const toast = useToast();

const form = ref({
  userId: '',        // Теперь строка
  productId: 0,
  price: 100,
  percent: 25,
  comment: '',
});



const handleSubmit = async () => {
  if (!form.value.userId || !form.value.productId || !form.value.price || form.value.price <= 0) {
    error.value = $t('manualBuybacks.validationError');
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // const token = useCookie('auth_token').value;
    // if (!token) throw new Error('No authentication token');

    console.log('Sending request with body:', form.value);
    await buybackStore.createBuyback(
      form.value.userId,
      form.value.productId,
      form.value.price,
      form.value.percent,
      form.value.comment,

    );
    await buybackStore.fetchUserBuybacks(form.value.userId.toString());
    // Убрано: toast.success($t('manualBuybacks.success'));
    router.push('/admin/buybacks');
    form.value = { userId: 0, productId: 0, price: 100, percent: 25, comment: '' };
  } catch (e: any) {
    console.error('Client error:', e);
    error.value = `${$t('manualBuybacks.error')}: ${e?.data?.message || e.message}`;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Проверка роли администратора уже выполняется через middleware
});
</script>