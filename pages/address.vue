<template>
    <MainLayout>
        <div 
            id="AddressPage" 
            class="mt-4 max-w-[500px] mx-auto px-2"
        >
            <div class="mx-auto bg-white rounded-lg p-3">
                <div class="text-xl text-bold mb-2">Address Details</div>
                <form @submit.prevent="submit()">
                    <TextInput 
                        class="w-full"
                        placeholder="Contact Name"
                        v-model:input="contactName"
                        inputType="text"
                        :error="error && error.type == 'contactName' ? error.message : ''"
                    />

                    <TextInput 
                        class="w-full mt-2"
                        placeholder="Address"
                        v-model:input="address"
                        inputType="text"
                        :error="error && error.type == 'address' ? error.message : ''"
                    />

                    <TextInput 
                        class="w-full mt-2"
                        placeholder="Zip Code"
                        v-model:input="zipCode"
                        inputType="text"
                        :error="error && error.type == 'zipCode' ? error.message : ''"
                    />

                    <TextInput 
                        class="w-full mt-2"
                        placeholder="City"
                        v-model:input="city"
                        inputType="text"
                        :error="error && error.type == 'city' ? error.message : ''"
                    />

                    <TextInput 
                        class="w-full mt-2"
                        placeholder="Country"
                        v-model:input="country"
                        inputType="text"
                        :error="error && error.type == 'country' ? error.message : ''"
                    />

                    <button 
                        :disabled="isWorking"
                        type="submit"
                        class="
                            mt-6
                            bg-gradient-to-r 
                            from-[#FE630C] 
                            to-[#FF3200]
                            w-full 
                            text-white 
                            text-[21px] 
                            font-semibold 
                            p-1.5 
                            rounded-full
                        "
                    >
                        <div v-if="!isWorking">Update Address</div>
                        <Icon 
                            v-else
                            name="eos-icons:loading" 
                            size="25" 
                            class="mr-2"
                        />
                    </button>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const contactName = ref('')
const address = ref('')
const zipCode = ref('')
const city = ref('')
const country = ref('')
const currentAddress = ref(null)
const isUpdate = ref(false)
const isWorking = ref(false)
const error = ref<null | { type: string; message: string }>(null)


useHead({
  title: 'Aliexpress | Address',
  meta: [
    { name: 'description', content: 'Manage your Address on Aliexpress' }
  ]
})

watchEffect(async () => {
  if (!user.value?.id) return

  const res = await useFetch(`/api/prisma/get-address-by-user/${user.value.id}`)
  currentAddress.value = res.data.value

  if (currentAddress.value) {
    contactName.value = currentAddress.value.name
    address.value = currentAddress.value.address
    zipCode.value = currentAddress.value.zipcode
    city.value = currentAddress.value.city
    country.value = currentAddress.value.country
    isUpdate.value = true
  }

  userStore.isLoading = false
})

const submit = async () => {
  isWorking.value = true
  error.value = null

  if (!contactName.value) error.value = { type: 'contactName', message: 'A contact name is required' }
  else if (!address.value) error.value = { type: 'address', message: 'An address is required' }
  else if (!zipCode.value) error.value = { type: 'zipCode', message: 'A zip code is required' }
  else if (!city.value) error.value = { type: 'city', message: 'A city is required' }
  else if (!country.value) error.value = { type: 'country', message: 'A country is required' }

  if (error.value) {
    isWorking.value = false
    return
  }

  const payload = {
    userId: user.value.id,
    name: contactName.value,
    address: address.value,
    zipCode: zipCode.value,
    city: city.value,
    country: country.value,
  }

  if (isUpdate.value && currentAddress.value?.id) {
    await useFetch(`/api/prisma/update-address/${currentAddress.value.id}`, {
      method: 'PATCH',
      body: payload
    })
  } else {
    await useFetch(`/api/prisma/add-address`, {
      method: 'POST',
      body: payload
    })
  }

  isWorking.value = false
  router.push('/checkout')
}
</script>