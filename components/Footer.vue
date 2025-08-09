<template>
  <div id="FooterMain" class="w-full bg-[#E8E8E8] mt-10 mb-2">
    <div class="max-w-[1200px] mx-auto px-4">
      <div class="md:flex gap-4 justify-between w-full">
        <div class="md:w-[50%] pt-4">
          <div class="text-lg font-semibold text-[#282828]">{{ $t('footer.help.title') }}</div>
          <div class="text-[#999999] text-sm">{{ $t('footer.help.content') }}</div>
        </div>
        <div class="md:w-[50%] pt-4">
          <div class="text-lg font-semibold text-[#282828]">{{ $t('footer.languages.title') }}</div>
          <div class="text-[#999999] text-sm">{{ $t('footer.languages.content') }}</div>
        </div>
      </div>

      <div class="md:flex gap-4 justify-between w-full">
        <div class="md:w-[50%] pt-4">
          <div class="text-lg font-semibold text-[#282828]">{{ $t('footer.categories.title') }}</div>
          <div class="text-[#999999] text-sm">{{ $t('footer.categories.content') }}</div>
        </div>
        <div class="md:w-[50%] pt-4">
          <div class="text-lg font-semibold text-[#282828]">{{ $t('footer.group.title') }}</div>
          <div class="text-[#999999] text-sm">{{ $t('footer.group.content') }}</div>
        </div>
      </div>
    </div>
  </div>

  <div id="FooterSub" class="w-full bg-[#333333] text-sm text-gray-400">
    <div class="max-w-[1200px] mx-auto p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
      <span>{{ $t('footer.subtext') }}</span>
      <div class="flex flex-wrap gap-4">
        <a href="https://helpcenter.aliexpress.com/s/BuyerHelp?spm=a2g0o.home.14.1.3ad170e5qQLavm&language=es_ES&_gl=1*185948h*_gcl_au*ODAxMTk2NzcwLjE3NTQ2OTA1NjM.*_ga*MTM1Mjk4ODk2OS4xNzU0NjkwNTYz*_ga_VED1YSGNC7*czE3NTQ2OTA1NjIkbzEkZzAkdDE3NTQ2OTA2MTYkajYkbDAkaDA.&tsuCode=ByrCmn&terminal=pc&region=DO&suid=1030142508090603552102F8824002"
           target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
          {{ $t('footer.links.support') }}
        </a>
        <a href="https://terms.alicdn.com/legal-agreement/terms/suit_bu1_aliexpress/suit_bu1_aliexpress201911041031_29376.html"
           target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
          {{ $t('footer.links.terms') }}
        </a>
        <a href="https://terms.alicdn.com/legal-agreement/terms/platform_service/20220531142242826/20220531142242826.html?spm=a2g0o.home.0.0.3ad170e5qQLavm"
           target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
          {{ $t('footer.links.privacy') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t: $t } = useI18n()
</script>