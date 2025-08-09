<template>
  <div 
    :id="`ProductComponent${product?.id ?? 'skeleton'}`"
    class="
      bg-white 
      inline-block 
      rounded 
      cursor-pointer 
      transition 
      duration-300 
      hover:shadow-[0_0_10px_3px_rgba(0,0,0,0.15)]
      min-h-[320px] w-full
    "
  >
    <template v-if="!isLoading">
      <NuxtLink :to="`/item/${product.id}`">
        <img 
        class="rounded-t w-full h-[180px] object-cover" 
        :src="product.images?.[0]?.url" 
         alt="Product Image"
         />

        <div id="ProductDetails">
          <span class="flex items-center justify-start gap-3 px-1 pt-1">
            <span class="text-[#FF6674] font-semibold">${{ priceComputed }}</span>
            <span class="text-gray-500 text-sm text-light line-through">${{ oldPriceComputed }}</span>
          </span>

          <span class="px-1 relative -top-1.5 text-[#FF6674] text-xs font-semibold">{{ $t('product.extraDiscount') }}</span>

          <div class="flex items-center gap-1 px-1 relative -top-1">
            <span class="bg-[#FD374F] text-white text-[9px] font-semibold px-1.5 rounded-sm">{{ $t('product.welcomeDeal') }}</span>
            <span class="bg-[#F5F5F5] border text-[#C08562] text-[9px] font-semibold px-1.5 rounded-sm">{{ $t('product.topSelling') }}</span>
          </div>

          <p class="flex items-center px-1 pt-0.5 text-xs text-[#252525]">
            {{ $t('product.sold') }} <Icon name="material-symbols:star-rate" color="#757575" class="ml-1.5" /> 4.7
          </p>

          <p class="px-1 pt-0.5 text-xs text-[#252525]">{{ product.title.substring(0, 60) }}</p>

          <p class="px-1 pb-1">
            <span class="text-[#009A66] text-xs font-semibold">{{ $t('product.freeShipping') }}</span>
          </p>
        </div>
      </NuxtLink>
    </template>

    <template v-else>
      <div class="animate-pulse p-2 space-y-2">
        <div class="bg-gray-300 rounded w-full h-[180px]" />
        <div class="h-3 bg-gray-300 rounded w-1/2" />
        <div class="h-3 bg-gray-200 rounded w-1/3" />
        <div class="h-2 bg-gray-100 rounded w-2/3" />
        <div class="h-2 bg-gray-100 rounded w-3/4" />
        <div class="h-2 bg-gray-200 rounded w-1/2" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const props = defineProps({
  product: Object,
  isLoading: {
    type: Boolean,
    default: false
  }
})

const { product } = toRefs(props)

const priceComputed = computed(() => product.value?.price / 100)
const oldPriceComputed = computed(() => ((product.value?.price + product.value?.price / 20) / 100).toFixed(2))
</script>