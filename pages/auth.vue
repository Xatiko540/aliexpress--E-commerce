<template>
  <div id="AuthPage" class="w-full h-screen bg-white grid grid-cols-1 md:grid-cols-2">
    
    <!-- 🎠 Левая часть: Карусель -->
<div class="hidden md:flex items-center justify-center bg-gray-100 h-full">
  <Swiper
      :modules="modules"
      :pagination="{ clickable: true, el: '.swiper-pagination' }"
      :autoplay="{ delay: 4000, disableOnInteraction: false }"
      loop
      class="w-full h-full relative"
  >
    <SwiperSlide>
      <div class="h-full w-full relative">
        <img src="/1920x1720.webp" class="object-cover w-full h-full" />
        <div class="absolute bottom-12 left-10 text-white text-2xl font-bold">
          Pay with confidence, <br />shop with ease
        </div>
      </div>
    </SwiperSlide>
    <SwiperSlide>
      <div class="h-full w-full relative">
        <img src="/1920x1720 (1).webp" class="object-cover w-full h-full" />
              <div class="absolute bottom-12 left-10 text-white text-2xl font-bold">
          New shoppers <br />get up to 70% off
        </div>
      </div>
    </SwiperSlide>
    <SwiperSlide>
      <div class="h-full w-full relative">
        <img src="/1920x1720 (2).webp" class="object-cover w-full h-full" />
              <div class="absolute bottom-12 left-10 text-white text-2xl font-bold">
          Free shipping <br />on your first order
        </div>
      </div>
    </SwiperSlide>
        <SwiperSlide>
      <div class="h-full w-full relative">
        <img src="/1920x1720 (3).webp" class="object-cover w-full h-full" />
              <div class="absolute bottom-12 left-10 text-white text-2xl font-bold">
          Your data <br />privacy is our priority
        </div>
      </div>
    </SwiperSlide>
    
   <!-- ✅ Рабочая кастомная пагинация -->
<template #pagination>
  <div class="swiper-pagination absolute bottom-4 left-0 right-0 flex justify-center z-10" />
</template>
  </Swiper>
</div>

    <!-- 🔐 Правая часть: Форма -->
    <div class="flex flex-col items-center justify-center px-5">
      <div class="w-full max-w-[400px]">

        <NuxtLink to="/" class="flex justify-center mb-5">
          <img width="170" src="/AliExpress-logo.png" />
        </NuxtLink>

        <div class="text-center my-6 text-lg font-semibold">{{ $t('auth.title') }}</div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="mode === 'login' || mode === 'register'" class="space-y-4">
            <input
              v-model="email"
              type="email"
              :placeholder="$t('auth.email')"
              class="w-full p-2 border rounded"
            />
            <input
              v-model="password"
              type="password"
              :placeholder="$t('auth.password')"
              class="w-full p-2 border rounded"
            />
            <p
              v-if="mode === 'login'"
              class="text-center text-sm text-blue-600 cursor-pointer underline"
              @click="mode = 'forgot'"
            >
              Forgot your password?
            </p>
          </div>

          <div v-else-if="mode === 'forgot'" class="space-y-4">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full p-2 border rounded"
            />
            <button
              type="submit"
              class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Send Code
            </button>
          </div>

          <div v-else-if="mode === 'reset'" class="space-y-4">
            <input
              v-model="code"
              type="text"
              placeholder="Enter code from email"
              class="w-full p-2 border rounded"
            />
            <input
              v-model="newPassword"
              type="password"
              placeholder="New password"
              class="w-full p-2 border rounded"
            />
            <button
              type="submit"
              class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Reset Password
            </button>
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm text-center">{{ errorMessage }}</p>

          <button
            v-if="mode === 'login' || mode === 'register'"
            type="submit"
            class="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            {{ $t(`auth.${mode}`) }}
          </button>

          <p
            v-if="mode === 'login' || mode === 'register'"
            class="text-center text-sm text-gray-600"
          >
            <span
              @click="toggleMode"
              class="text-blue-500 cursor-pointer underline"
            >
              {{ $t(`auth.toggle.${mode}`) }}
            </span>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import { ref, onMounted, nextTick} from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#app'
import { $fetch } from 'ofetch'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useI18n } from 'vue-i18n'


const modules = [Pagination, Autoplay]

const { t: $t } = useI18n()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()
const authToken = useCookie('auth_token')


const mode = ref<'login' | 'register' | 'forgot' | 'reset'>('login')
const code = ref('')
const newPassword = ref('')
const sentEmail = ref('')


const authStore = useAuthStore()
const userStore = useUserStore()

useHead({
  title: 'Aliexpress | Auth',
  meta: [
    { name: 'description', content: 'Manage your authentication on Aliexpress' }
  ]
})

onMounted(() => {
  authStore.fetchUser()
})

const handleSubmit = async () => {
  errorMessage.value = ''
  userStore.isLoading = true

  try {
    if (mode.value === 'forgot') {
      const res = await $fetch('/api/request-reset', {
        method: 'POST',
        body: { email: email.value }
      })
      if (res.success) {
        sentEmail.value = email.value
        mode.value = 'reset'
      }
    } else if (mode.value === 'reset') {
      const res = await $fetch('/api/verify-reset', {
        method: 'POST',
        body: {
          email: sentEmail.value,
          code: code.value,
          newPassword: newPassword.value
        }
      })
      if (res.success) {
        mode.value = 'login'
        email.value = sentEmail.value
        password.value = ''
      }
    } else {
      const res = await $fetch(`/api/${mode.value}`, {
        method: 'POST',
        body: { email: email.value, password: password.value }
      })
      if (res?.success) {
        await nextTick()
        await authStore.fetchUser()
        const redirectPath = sessionStorage.getItem('redirectAfterAuth') || (authStore.user?.role === 'admin' ? '/admin' : '/')
        sessionStorage.removeItem('redirectAfterAuth')
        router.push(redirectPath)
      } else {
        errorMessage.value = res?.message || 'Login/Registration Error'
      }
    }
  } catch (err) {
    console.error('❌ Submit error:', err)
    errorMessage.value = 'Something went wrong'
  } finally {
    userStore.isLoading = false
  }
}

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMessage.value = ''
}
</script>

<style>
.swiper-pagination-bullet {
  width: 24px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  border-radius: 9999px;
  margin: 0 6px;
  transition: background 0.3s ease;
}
.swiper-pagination-bullet-active {
  background: white;
}
</style>