<template>
    <div id="MainLayout" class="w-full fixed z-50">
        
        <div 
            id="TopMenu"
            class="w-full bg-[#FAFAFA] border-b md:block hidden"
        >
            <ul 
                class="
                    flex 
                    items-center 
                    justify-end
                    text-xs 
                    text-[#333333]
                    font-light 
                    px-2 
                    h-10
                    bg-[#FAFAFA] 
                    max-w-[1200px] 
                "
            >
                <li class="border-r border-r-gray-400 px-3 hover:text-[#FF4646] cursor-pointer">
                    <span>{{ $t('layout.sell') }}</span>
                </li>
                <li class="border-r border-r-gray-400 px-3 hover:text-[#FF4646] cursor-pointer">
                    <span>{{ $t('layout.cookies') }}</span>
                </li>
                <li class="border-r border-r-gray-400 px-3 hover:text-[#FF4646] cursor-pointer">
                    <span>{{ $t('layout.help') }}</span>
                </li>
                <li class="border-r border-r-gray-400 px-3 hover:text-[#FF4646] cursor-pointer">
                    <span>{{ $t('layout.protection') }}</span>
                </li>
                  <li
                    class="px-3 hover:text-[#FF4646] cursor-pointer"
                    @click="installApp"
                  >
                    <Icon name="ic:sharp-install-mobile" size="17" />
                    <span>{{ $t('layout.app') }}</span>
                 </li>
                <li 
                    @mouseenter="isAccountMenu = true"
                    @mouseleave="isAccountMenu = false"
                    class="relative flex items-center px-2.5 hover:text-[#FF4646] h-full cursor-pointer"
                    :class="isAccountMenu ? 'bg-white border z-40 shadow-[0_15px_100px_40px_rgba(0,0,0,0.3)]' : 'border border-[#FAFAFA]'"
                >
                    <Icon name="ph:user-thin" size="17"/>
                    <span>{{ authStore.user?.email ?? $t('layout.account') }}</span>
                    <Icon name="mdi:chevron-down" size="15" class="ml-5"/>

                    <div 
                        id="AccountMenu" 
                        v-if="isAccountMenu"
                        class="absolute bg-white w-[220px] text-[#333333] z-40 top-[38px] -left-[100px] border-x border-b"
                    >
                    <div v-if="!authStore.user">
                            <div class="text-semibold text-[15px] my-4 px-3">{{ $t('layout.welcome') }}</div>
                            <div class="flex items-center gap-1 px-3 mb-3">
                                <NuxtLink 
                                    to="/auth"
                                    class="bg-[#FF4646] text-center w-full text-[16px] rounded-sm text-white font-semibold p-2"
                                >
                                    {{ $t('layout.login') }}
                                </NuxtLink>
                            </div>
                        </div>
                      <div class="border-b"></div>
                      <ul class="bg-white">
                        <li 
                          @click="navigateTo(`/chat?name=${authStore.user?.username ?? 'anonymity'}`)"
                          class="text-[13px] py-2 px-4 w-full hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Icon name="fluent:chat-16-regular" size="16" />
                          <span>Message Center</span>
                        </li>

                        <li 
                          @click="navigateTo('/topup')"
                          class="text-[13px] py-2 px-4 w-full hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Icon name="mdi:coin-outline" size="16" />
                          <span>My coins</span>
                        </li>

                        <li 
                          @click="navigateTo('/orders')"
                          class="text-[13px] py-2 px-4 w-full hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Icon name="clarity:shopping-bag-line" size="16" />
                          <span>{{ $t('layout.orders') }}</span>
                        </li>

                        <li 
                          @click="navigateTo('/settings')"
                          class="text-[13px] py-2 px-4 w-full hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Icon name="mdi:cog-outline" size="16" />
                          <span>{{ $t('layout.settings') }}</span>
                        </li>

                        <li 
                          v-if="authStore.user"
                          @click="logout"
                          class="text-[13px] py-2 px-4 w-full hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Icon name="material-symbols:logout" size="16" />
                          <span>{{ $t('layout.signOut') }}</span>
                        </li>
                      </ul>
                        
                    </div>
                </li>
            </ul>
        </div>

        <div 
            id="MainHeader" 
            class="flex items-center w-full bg-white"
        >

        
<div class="max-w-[1150px] w-full px-3 py-5 mx-auto">
  <!-- 🌐 Desktop Row: Logo + Search + Cart -->
  <div class="hidden md:flex items-center justify-between w-full gap-6">
    <!-- Логотип -->
    <NuxtLink to="/" class="min-w-[170px]">
      <img width="170" src="/AliExpress-logo.png">
    </NuxtLink>

    <!-- Поиск -->
<!-- Поиск + Категории (Desktop Only) -->
<div class="flex items-center gap-3 w-full max-w-[850px]">


  <!-- Categories Button -->
<NuxtLink 
  to="/categories"
  class="hidden md:flex items-center gap-2 border rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FF4646] hover:border-[#FF4646] transition"
>
  <Icon name="ph:grid-four-light" size="18" />
  <span>{{ $t('layout.categories') }}</span>
</NuxtLink>

<!-- ЯЗЫК -->
<li class="hidden md:flex items-center gap-2 border rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FF4646] hover:border-[#FF4646] transition cursor-pointer">
  <Icon name="mdi:translate" size="18" />
  <select
    v-model="$i18n.locale"
    class="bg-transparent outline-none cursor-pointer text-sm"
  >
    <option value="en">🇺🇸 EN</option>
    <option value="ru">🇷🇺 RU</option>
  </select>
</li>

  <!-- Search Bar -->
  <div class="relative flex-1">
    <div class="flex items-center border-2 border-[#FF4646] rounded-md w-full">
      <input 
        class="w-full text-sm p-2 pl-3 placeholder-gray-400 focus:outline-none" 
        placeholder="Search..." 
        v-model="searchItem"
      >
      <Icon 
        v-if="isSearching" 
        name="eos-icons:loading" 
        size="25" 
        class="mr-2"
      />
      <button class="flex items-center h-full p-1.5 px-2 bg-[#FF4646]">
        <Icon name="ph:magnifying-glass" size="20" color="#ffffff"/>
      </button>
    </div>

    <!-- Результаты поиска -->
    <div 
      class="absolute z-30 bg-white shadow-md w-full mt-1"
      v-if="items && items.length"
    >
      <div 
        v-for="item in items" 
        :key="item.id"
        class="p-1"
      >
        <NuxtLink 
          :to="`/item/${item.id}`" 
          class="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100 px-2 py-1"
        >
          <div class="flex items-center gap-2">
            <NuxtImg
              class="rounded-md"
              :src="item.url"
              width="40"
              height="40"
              fit="cover"
              format="webp"
              loading="lazy"
            />
            <div class="truncate">{{ item.title }}</div>
          </div>
          <div class="truncate">${{ item.price / 100 }}</div>
        </NuxtLink>
      </div>
    </div>
  </div>
</div>

    <!-- Cart -->
    <NuxtLink to="/shoppingcart" class="flex items-center">
      <button 
        class="relative"
        @mouseenter="isCartHover = true"
        @mouseleave="isCartHover = false"
      >
        <span 
          class="absolute flex items-center justify-center -right-[3px] top-0 bg-[#FF4646] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full"
        >
          {{ userStore.cart.length }}
        </span>
        <div class="min-w-[40px]">
          <Icon 
            name="ph:shopping-cart-simple-light" 
            size="33" 
            :color="isCartHover ? '#FF4646' : ''"
          />
        </div>
      </button>
    </NuxtLink>
  </div>




  <!-- 📱 Mobile Layout: Logo + Burger + Search -->
  <div class="block md:hidden w-full">
    <div class="flex items-center justify-between w-full">
      <!-- Логотип -->
      <NuxtLink to="/" class="min-w-[170px]">
        <img width="170" src="/AliExpress-logo.png">
      </NuxtLink>

      <!-- Бургер -->
      <button
        @click="userStore.isMenuOverlay = true"
        class="rounded-full p-1.5 hover:bg-gray-200"
      >
        <Icon name="radix-icons:hamburger-menu" size="33" />
      </button>
    </div>

    <!-- Поиск -->
    <div class="w-full mt-3">
      <div class="relative">
        <div class="flex items-center border-2 border-[#FF4646] rounded-md w-full">
          <input 
            class="w-full text-sm p-2 pl-3 placeholder-gray-400 focus:outline-none" 
            placeholder="Search..." 
            v-model="searchItem"
          >
          <Icon 
            v-if="isSearching" 
            name="eos-icons:loading" 
            size="25" 
            class="mr-2"
          />
          <button class="flex items-center h-full p-1.5 px-2 bg-[#FF4646]">
            <Icon name="ph:magnifying-glass" size="20" color="#ffffff"/>
          </button>
        </div>

        <!-- Результаты поиска -->
        <div 
          class="absolute z-30 bg-white shadow-md w-full mt-1"
          v-if="items && items.length"
        >
          <div 
            v-for="item in items" 
            :key="item.id"
            class="p-1"
          >
            <NuxtLink 
              :to="`/item/${item.id}`" 
              class="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100 px-2 py-1"
            >
              <div class="flex items-center gap-2">
                <NuxtImg
                  class="rounded-md"
                  :src="item.url"
                  width="40"
                  height="40"
                  fit="cover"
                  format="webp"
                  loading="lazy"
                />
                <div class="truncate">{{ item.title }}</div>
              </div>
              <div class="truncate">${{ item.price / 100 }}</div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
    </div>



    <Loading v-if="userStore.isLoading" />

    <div class="lg:pt-[150px] md:pt-[130px] pt-[150px]" />
    <slot />
    <CookieBanner />
    <Footer v-if="!userStore.isLoading"/>

</template>

<script setup lang="ts">

import { onBeforeMount } from 'vue'
import { useFetch } from '#app'
import { ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useI18n } from 'vue-i18n'

import { useDebounceFn } from '@vueuse/core'

const { t: $t, locale } = useI18n()

const authStore = useAuthStore()
const user = computed(() => authStore.user) 
const router = useRouter()
const navigateTo = (path: string) => router.push(path)
const userStore = useUserStore()


const isAccountMenu = ref(false)
const isCartHover = ref(false)
const isSearching = ref(false)
const searchItem = ref('')

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

let installPrompt = ref<BeforeInstallPromptEvent | null>(null)


onMounted(() => {
  const savedLang = localStorage.getItem('lang')
  if (savedLang === 'ru' || savedLang === 'en') {
    locale.value = savedLang
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    installPrompt.value = e as BeforeInstallPromptEvent
  })

})

const installApp = async () => {
  if (!installPrompt.value) return
  installPrompt.value.prompt()
  const result = await installPrompt.value.userChoice
  installPrompt.value = null
}

watch(() => locale.value, (lang) => {
  localStorage.setItem('lang', lang)
})



const items = ref<{ id: number; title: string; price: number; url: string }[]>([])

const searchByName = useDebounceFn(async () => {
  isSearching.value = true
  const { data } = await useFetch(`/api/prisma/search-by-name/${searchItem.value}`)
  items.value = data.value ?? []
  isSearching.value = false
}, 100)

watch(() => searchItem.value, async () => {
  if (!searchItem.value) {
    setTimeout(() => {
      items.value = []
      isSearching.value = false
    }, 500)
    return
  }
  searchByName() // ← теперь работает корректно
})

// 🔥 Чистый logout
const logout = async () => {

  // Удалить куку
  document.cookie = 'auth_token=; Max-Age=0; path=/;'

  // Дополнительно удалить из localStorage, если persist использует его
  localStorage.removeItem('auth')
  
  useCookie('auth_token').value = null
  authStore.logout()
  router.push('/')
}
</script>