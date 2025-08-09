<template>
  <AdminLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Ссылки и активность</h2>


        <!-- Форма создания новой ссылки -->
        <div class="mb-6 bg-white p-4 rounded shadow">
          <h3 class="text-lg font-semibold mb-2">Создать новую ссылку</h3>
          <form @submit.prevent="createLink" class="space-y-4">
            <select v-model="newLink.managerId" class="w-full p-2 border rounded" required>
              <option value="" disabled>Выберите менеджера</option>
              <option v-for="mgr in managers" :key="mgr.id" :value="mgr.id">
                {{ mgr.fullName || mgr.email }}
              </option>
            </select>
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Создать ссылку
            </button>
          </form>
        </div>

      <!-- Список ссылок -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="text-lg font-semibold mb-2">Реферальные ссылки</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="border rounded p-3" v-for="link in links" :key="link.code">
            <p class="text-sm text-gray-500">Код:</p>
            <p class="font-mono font-semibold">
              <a
                :href="`https://aliwebb.xyz/?ref=${link.code}`"
                target="_blank"
                class="text-blue-600 underline"
              >
                https://aliwebb.xyz/?ref={{ link.code }}
              </a>
            </p>
            <p class="text-sm text-gray-500 mt-2">Менеджер:</p>
            <p>{{ link.manager?.fullName ?? link.manager?.email ?? '-' }}</p>
          </div>
        </div>
      </div>

<!-- Активность -->
<div class="bg-white p-4 rounded shadow">
  <h3 class="text-lg font-semibold mb-2">Активность по ссылкам</h3>
  <table class="w-full text-sm">
    <thead class="bg-gray-200">
      <tr>
        <th class="text-left px-2 py-2">Пользователь</th>
        <th class="text-left px-2 py-2">Email</th>
        <th class="text-left px-2 py-2">Ссылка</th>
        <th class="text-left px-2 py-2">Менеджер</th>
        <th class="text-left px-2 py-2">Дата регистрации</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="act in activity" :key="act.email" class="border-b">
        <td class="px-2 py-2">{{ act.name }}</td>
        <td class="px-2 py-2">{{ act.email }}</td>
        <td class="px-2 py-2">
          <span v-if="act.refCode">{{ act.refCode }}</span>
          <span v-else class="text-gray-400">—</span>
        </td>
        <td class="px-2 py-2">
          {{ act.manager?.fullName || act.manager?.email || '—' }}
        </td>
        <td class="px-2 py-2">{{ act.registered }}</td>
      </tr>
    </tbody>
  </table>
</div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/admin.vue';
import { ref, onMounted } from 'vue';

const managers = ref([]);
const links = ref([]);
const activity = ref([]);
const newLink = ref({ managerId: '' });

const loadManagers = async () => {
  const res = await $fetch('/api/admin/managers');
  managers.value = res.managers;
};

const createLink = async () => {
  console.log('Selected managerId:', newLink.value.managerId);
  try {
    const res = await $fetch('/api/admin/create-referral', {
      method: 'POST',
      body: { managerId: newLink.value.managerId }
    });
    console.log('Response:', res);
    if (res?.code || res?.success) {
      newLink.value.managerId = '';
      await loadData();
    } else {
      console.warn('Unexpected response:', res);
    }
  } catch (err) {
    console.error('createLink() error:', err);
    alert('Ошибка при создании ссылки');
  }
};

const loadData = async () => {
  const res = await $fetch('/api/admin/get-referrals');
  links.value = res.links;
  activity.value = res.activity.map(u => ({
    name: u.fullName || '—',
    email: u.email,
    refCode: u.refCode,
    registered: new Date(u.createdAt).toLocaleDateString('ru-RU'),
    manager: u.manager,
  }));
};

onMounted(async () => {
  await Promise.all([loadManagers(), loadData()]);
});
</script>