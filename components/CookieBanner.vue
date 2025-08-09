<template>
  <div
    v-if="showBanner"
    class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-xl max-w-[480px] w-[95%] p-4 z-50"
  >
    <p class="text-sm text-gray-600 mb-4 leading-snug">
      {{ texts.message }}
      <a
        href="https://terms.alicdn.com/legal-agreement/terms/platform_service/20220531142242826/20220531142242826.html?spm=a2g0o.home.0.0.3ad170e5qQLavm"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-500 underline"
      >
        {{ texts.privacy }}
      </a>.
      {{ texts.agree }}
      <a
        href="https://terms.alicdn.com/legal-agreement/terms/suit_bu1_aliexpress/suit_bu1_aliexpress201911041031_29376.html"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-500 underline"
      >
        {{ texts.terms }}
      </a>.
    </p>
    <button
      @click="acceptCookies"
      class="w-full py-2 text-white bg-neutral-800 text-center rounded-lg font-semibold hover:bg-neutral-900"
    >
      {{ texts.button }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const showBanner = ref(false)
const COOKIE_KEY = 'cookie_consent_accepted'

const { locale } = useI18n()

const texts = computed(() => {
  const ru = {
    message:
      'Используя этот сайт, Вы выражаете согласие на сбор и обработку Ваших персональных данных, в том числе с привлечением сторонних сервисов, с применением cookie-файлов и средств анализа поведения пользователей, согласно нашей',
    privacy: 'Политике конфиденциальности',
    agree: 'Вы также принимаете условия нашего',
    terms: 'Пользовательского соглашения',
    button: 'Понятно'
  }
  const en = {
    message:
      'By using this site, you consent to the collection and processing of your personal data, including the use of third-party services, cookies, and analytics tools as described in our',
    privacy: 'Privacy Policy',
    agree: 'You also accept our',
    terms: 'Terms of Use',
    button: 'Got it'
  }
  return locale.value === 'ru' ? ru : en
})

onMounted(() => {
  if (localStorage.getItem(COOKIE_KEY) !== 'true') {
    showBanner.value = true
  }
})

const acceptCookies = () => {
  localStorage.setItem(COOKIE_KEY, 'true')
  showBanner.value = false
}
</script>