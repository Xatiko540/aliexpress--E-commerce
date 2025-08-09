<template>
  <AdminLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Выкупы клиентов</h2>

      <!-- Поиск -->
      <div class="mb-4 bg-white p-4 rounded shadow flex flex-wrap gap-4 items-center">
        <input
          v-model="buybackStore.searchQuery"
          type="text"
          placeholder="🔍 ID или название товара..."
          class="border p-2 rounded w-full max-w-xs"
          @input="debouncedSearch"
        />
        <button @click="buybackStore.fetchBuybacks" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Применить фильтр
        </button>
      </div>

      <!-- Таблица -->
      <div class="overflow-x-auto bg-white p-4 rounded shadow">
        <div v-if="buybackStore.isLoading" class="text-center">Загрузка...</div>
        <div v-else-if="buybackStore.buybacks.length === 0" class="text-center">Выкупы не найдены</div>

        <table v-else class="min-w-full text-sm">
          <thead class="bg-gray-200 text-xs uppercase">
            <tr>
              <th class="px-3 py-2">ID</th>
              <th class="px-3 py-2">Товар</th>
              <th class="px-3 py-2">Пользователь</th>
              <th class="px-3 py-2">Менеджер</th>
              <th class="px-3 py-2">Цена</th>
              <th class="px-3 py-2">Процент</th>
              <th class="px-3 py-2">Награда</th>
              <th class="px-3 py-2">Статус</th>
              <th class="px-3 py-2">Дата</th>
              <th class="px-3 py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="buyback in buybackStore.buybacks" :key="buyback.id" class="border-b">
              <td class="px-3 py-2">{{ buyback.id }}</td>
              <td class="px-3 py-2">{{ buyback.product?.title ?? '-' }}</td>
              <td class="px-3 py-2">{{ buyback.user.email }}</td>
              <td class="px-3 py-2">{{ buyback.manager?.fullName ?? buyback.manager?.email ?? '-' }}</td>
              <td class="px-3 py-2">{{ buyback.price }} ₽</td>
              <td class="px-3 py-2">
                <input
                  v-if="buyback.status === 'PENDING'"
                  v-model.number="buyback.percent"
                  type="number"
                  class="border p-1 rounded w-16"
                  placeholder="%"
                  min="0"
                  max="100"
                />
                <span v-else>{{ buyback.percent ?? '-' }}%</span>
              </td>
              <td class="px-3 py-2">
                <input
                  v-if="buyback.status === 'PENDING'"
                  v-model.number="buyback.reward"
                  type="number"
                  class="border p-1 rounded w-20"
                  placeholder="₽"
                  min="0"
                />
                <span v-else>{{ buyback.reward ?? '-' }} ₽</span>
              </td>
              <td class="px-3 py-2">{{ buyback.status ?? '-' }}</td>
              <td class="px-3 py-2">
                {{ new Date(buyback.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-3 py-2">
                <div v-if="buyback.status === 'PENDING'" class="flex gap-2">
                  <button
                    @click="buybackStore.approveBuyback(buyback.id, 'APPROVED', buyback.percent, buyback.reward)"
                    class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    :disabled="!buyback.percent || !buyback.reward"
                  >
                    Одобрить
                  </button>
                  <button
                    @click="buybackStore.approveBuyback(buyback.id, 'REJECTED')"
                    class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Отклонить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div v-if="buybackStore.total > buybackStore.limit" class="mt-4 flex justify-center">
        <button
          v-for="page in Math.ceil(buybackStore.total / buybackStore.limit)"
          :key="page"
          :class="[
            'mx-1 px-3 py-1 rounded',
            buybackStore.page === page ? 'bg-blue-500 text-white' : 'bg-gray-200',
          ]"
          @click="buybackStore.setPage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/layouts/admin.vue';
import { useBuybackStore } from '~/stores/buybacks';
import { onMounted } from 'vue';

const buybackStore = useBuybackStore();

const debouncedSearch = (() => {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      buybackStore.setSearchQuery(buybackStore.searchQuery);
    }, 500);
  };
})();

onMounted(() => {
  buybackStore.fetchBuybacks();
});
</script>