import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Product {
  title: string;
}

interface User {
  email: string;
}

interface Buyback {
  id: number;
  product: { title: string } | null;
  user: { email: string };
  manager?: { fullName?: string; email: string };
  price: number;
  percent?: number;
  reward?: number;
  status?: string;
  createdAt: string;
  comment?: string;
}

interface BuybackResponse {
  buybacks: Buyback[];
  total: number;
  page: number;
  limit: number;
}

export const useBuybackStore = defineStore('buyback', () => {
  const buybacks = ref<Buyback[]>([]);
  const userBuybacks = ref<Buyback[]>([]);
  const total = ref<number>(0);
  const page = ref<number>(1);
  const limit = ref<number>(10);
  const searchQuery = ref<string>('');
  const isLoading = ref<boolean>(false);

  async function fetchBuybacks() {
    isLoading.value = true;
    try {
      const response = await ($fetch as any)('/api/admin/buybacks', {
        query: {
          search: searchQuery.value,
          page: page.value.toString(),
          limit: limit.value.toString(),
        },
      }) as BuybackResponse;
      buybacks.value = response.buybacks.map(buyback => ({
        ...buyback,
        product: buyback.product || null, // Обработка случаев, когда product отсутствует
      }));
      total.value = response.total;
      page.value = response.page;
      limit.value = response.limit;
    } catch (error) {
      console.error('Error fetching buybacks:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserBuybacks(userId: string) {
    isLoading.value = true;
    try {
      const response: Buyback[] = await ($fetch as any)('/api/buybacks', {
        query: { userId },
      });
      userBuybacks.value = response.map(buyback => ({
        ...buyback,
        product: buyback.product || null, // Обработка случаев, когда product отсутствует
      }));
    } catch (error) {
      console.error('Error fetching user buybacks:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function createBuyback(userId: string, productId: number, price: number, percent?: number, comment?: string) {
    try {
      const buyback: Buyback = await ($fetch as any)('/api/buybacks/create', {
        method: 'POST',
        body: { userId, productId, price, percent, comment },
      });
      userBuybacks.value.push({ ...buyback, product: buyback.product || null });
    } catch (error) {
      console.error('Error creating buyback:', error);
      throw error;
    }
  }

  async function approveBuyback(buybackId: number, status: 'APPROVED' | 'REJECTED', percent?: number, reward?: number) {
    try {
      const buyback: Buyback = await ($fetch as any)('/api/admin/buybacks/approve', {
        method: 'POST',
        body: { buybackId, status, percent, reward },
      });
      buybacks.value = buybacks.value.map(b => (b.id === buybackId ? { ...buyback, product: buyback.product || null } : b));
      userBuybacks.value = userBuybacks.value.map(b => (b.id === buybackId ? { ...buyback, product: buyback.product || null } : b));
    } catch (error) {
      console.error('Error processing buyback:', error);
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
    page.value = 1;
    fetchBuybacks();
  }

  function setPage(newPage: number) {
    page.value = newPage;
    fetchBuybacks();
  }

  return { buybacks, userBuybacks, total, page, limit, searchQuery, isLoading, fetchBuybacks, fetchUserBuybacks, createBuyback, approveBuyback, setSearchQuery, setPage };
});