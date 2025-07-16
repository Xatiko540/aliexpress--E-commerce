<template>
  <MainLayout>
    <div id="SuccessPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div class="bg-white w-full p-6 min-h-[150px]">
        <div class="flex items-center text-xl">
          <Icon name="clarity:success-standard-line" color="#5FCB04" size="35"/>
          <span class="pl-4">{{ $t('success.title') }}</span>
        </div>
        <p class="text-sm pl-[50px]">{{ $t('success.message') }}</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '~/layouts/MainLayout.vue';
import { useUserStore } from '~/stores/user';
import { onMounted } from 'vue';

import { useI18n } from 'vue-i18n'


useHead({
  title: 'Aliexpress | Success',
  meta: [
    { name: 'description', content: 'Manage your success on Aliexpress' }
  ]
})

const { t: $t } = useI18n()

const userStore = useUserStore()

onMounted(() => {
  setTimeout(() => userStore.isLoading = false, 300)
})
</script>