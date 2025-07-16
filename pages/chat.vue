<template>
    <MainLayout>
  <div class="chat">
    <div class="chat__header">
      <span class="chat__header__greetings">   {{ userName }}  </span>
    </div>

    <!-- Список чатов -->
    <div v-if="!activeChat" class="chat__list">
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="openChat(chat)"
        class="chat__list__item"
      >
        <img :src="chat.avatar || defaultAvatar" class="chat__avatar" />
        <div class="chat__info">
          <p class="chat__name">{{ chat.name }}</p>
          <p class="chat__last">{{ chat.lastMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Активный чат -->
    <div v-else class="chat__content">
      <ChatContainer :chat="activeChat" @back="activeChat = null" />
    </div>
  </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '~/layouts/MainLayout.vue'

import ChatContainer from '@/components/ChatContainer.vue'

const userName = ref(' Message Center')
const defaultAvatar = '/avatar.svg'


import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()


useHead({
  title: 'Aliexpress | Chat',
  meta: [
    { name: 'description', content: 'Manage your Chat on Aliexpress' }
  ]
})

const chats = ref([
  {
    id: 1,
    name: 'Support',
    lastMessage: 'Hello, how can we help you?',
    avatar: '/avatar.svg'
  },

])

const activeChat = ref(null)


onMounted(() => {
  setTimeout(() => userStore.isLoading = false, 300)
})

function openChat(chat) {
  activeChat.value = chat
}
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9f9f9;
}

.chat__header {
  background: #fff;
  padding: 1.5rem;
  border-radius: 24px 24px 0 0;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.05);
}

.chat__header__greetings {
  color: #292929;
}

.chat__list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
}

.chat__list__item {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: background 0.2s;
}

.chat__list__item:hover {
  background: #f0f0f0;
}

.chat__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.chat__info {
  display: flex;
  flex-direction: column;
}

.chat__name {
  font-weight: 600;
  font-size: 15px;
}

.chat__last {
  font-size: 13px;
  color: #666;
  margin-top: 0.2rem;
}

.chat__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 90px; /* 👈 это всё, что нужно */
}
</style>