<template>
  <div class="flex justify-start my-2">
    <!-- Checkbox -->
    <div class="my-auto">
      <div 
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        class="flex items-center justify-start p-0.5 cursor-pointer"
      >
        <div 
          @click="toggleSelected"
          class="flex items-center justify-center h-[20px] w-[20px] rounded-full border mr-5 ml-2"
          :class="[
            isHover ? 'border-[#FD374F]' : 'border-gray-300',
            isSelected ? 'bg-[#FD374F]' : ''
          ]"
        >
          <div class="h-[8px] w-[8px] rounded-full bg-white" />
        </div>
      </div>
    </div>

    <!-- Image -->
    <img 
      class="rounded-md md:w-[150px] w-[90px]" 
      :src="product.images?.[0]?.url"
    >

    <!-- Info -->
    <div class="overflow-hidden pl-2 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center justify-between truncate">
          <span class="sm:block hidden bg-[#FD374F] text-white text-[9px] font-semibold px-1.5 rounded-sm min-w-[80px]">Welcome Deal</span>
          <div class="truncate sm:pl-2">{{ product.title }}</div>
        </div>
        <button 
          @click="removeFromCart"
          class="mx-3 sm:block hidden -mt-0.5 hover:text-red-500"
        >
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>

      <div class="text-xl font-semibold">
        $ <span class="font-bold">{{ product.price / 100 }}</span>
      </div>

      <p class="text-[#009A66] text-xs font-semibold pt-1">Free 11-day delivery</p>
      <p class="text-[#009A66] text-xs font-semibold pt-1">Free Shipping</p>

      <div class="flex items-center justify-end">
        <button 
          @click="removeFromCart"
          class="sm:hidden block -mt-0.5 hover:text-red-500"
        >
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

const props = defineProps<{
  product: { id: number; title: string; price: number; images?: { url: string }[] }
  selectedArray: { id: number }[]
}>()
const emit = defineEmits(['selectedRadio', 'removeItem'])

const { product, selectedArray } = toRefs(props)

const isHover = ref(false)
const isSelected = ref(false)

const toggleSelected = () => {
  isSelected.value = !isSelected.value
  emit('selectedRadio', { id: product.value.id, val: isSelected.value }) // 👈 fix: передаём val
}

const removeFromCart = () => {
  const index = userStore.cart.findIndex(p => p?.id === product.value.id);
  if (index !== -1) {
    userStore.cart.splice(index, 1);
    emit('removeItem', product.value.id);
    emit('selectedRadio', { id: product.value.id, val: false }); // 👈 ДОБАВИТЬ ЭТО
  }
}


watch(() => selectedArray.value, (val) => {
  isSelected.value = val.some(i => i.id === product.value.id)
}, { immediate: true })
</script>