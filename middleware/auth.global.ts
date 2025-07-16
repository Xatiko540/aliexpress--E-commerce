export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // Пропустить если уже есть пользователь
  if (authStore.user && authStore.isInitialized) return

  // Только на клиенте вызываем fetchUser
  if (process.client && !authStore.isInitialized) {
    userStore.isLoading = true
    try {
      await authStore.fetchUser()
    } catch (e) {
      console.error('❌ Middleware: auth failed', e)
    } finally {
      userStore.isLoading = false
    }
  }

  // ❗️Редиректим только на клиенте
  if (process.client && !authStore.user) {
    return redirectIfNeeded(to)
  }
})

function redirectIfNeeded(to: any) {
  const protectedPaths = [
    '/checkout', '/orders', '/settings', '/topup', '/admin',
    '/admin/bonuses', '/admin/buybacks', '/admin/categories', '/admin/clients',
    '/admin/create', '/admin/history', '/admin/index', '/admin/levels',
    '/admin/login', '/admin/manual', '/admin/manualbuybacks', '/admin/orders',
    '/admin/payments', '/admin/products', '/admin/referrals', '/admin/reports',
    '/admin/reviews', '/admin/sales-report', '/admin/stats', '/admin/transactions',
    '/admin/withdrawals', '/admin/users'
  ]

  if (protectedPaths.includes(to.path)) {
    sessionStorage.setItem('redirectAfterAuth', to.fullPath)
    return navigateTo('/auth')
  }
}