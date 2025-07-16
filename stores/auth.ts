import { defineStore } from 'pinia'

interface UserPayload {
  id: string 
  email: string
  avatar?: string
  username?: string
  role?: string
  balance?: number // ✅ добавлено
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | UserPayload,
    token: null as string | null,
    isInitialized: false
  }),
  actions: {
    async fetchUser() {
      try {
        interface ApiUser {
          id: string
          token?: string
          email: string
          username?: string
          role?: string
          avatar?: string
          balance?: number
        }
        const user = await $fetch<ApiUser>('/api/user', { credentials: 'include' })
        if (!user) throw new Error('Пользователь не найден или не авторизован')

        console.log('✅ [authStore] fetchUser() user:', user)

        this.user = {
          id: user.id,
          email: user.email,
          avatar: user.avatar || '',
          username: user.username || '',
          role: user.role || 'user',
          balance: user.balance ?? 0 // ✅ обязательно
        } as UserPayload

        this.token = user.token ?? null
      } catch (err) {
        this.user = null
        this.token = null
      } finally {
        this.isInitialized = true
      }
    },

    logout() {
      document.cookie = 'auth_token=; Max-Age=0; path=/;'
      this.user = null
      this.token = null
      this.$reset()
      localStorage.removeItem('auth')
    }
  },
  persist: true
})