<template>
  <AdminLayout>
    <div>
      <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-bold">Редактировать пользователя</h1>
          <p class="text-gray-500">Обновление данных участника</p>
        </div>
        <NuxtLink to="/admin/users">
          <Button variant="outline">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Назад
          </Button>
        </NuxtLink>
      </div>

      <div class="my-8 px-4 max-w-2xl mx-auto">
        <Card v-if="user" class="rounded-xl shadow">
          <CardHeader>
            <CardDescription>Измените информацию о пользователе</CardDescription>
          </CardHeader>
          <CardContent class="p-4 md:p-6">
            <form @submit.prevent="onSubmit" class="space-y-6">
              <!-- Avatar Upload -->
              <div class="space-y-2">
                <Label>Аватар</Label>
                <div class="flex items-center gap-4 flex-wrap">
                  <Avatar class="w-24 h-24">
                    <AvatarImage :src="avatarSrc" :alt="user.username || 'User'" />
                    <AvatarFallback>{{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}</AvatarFallback>
                  </Avatar>
                  <Input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @input="handleFileInput"
                  />
                </div>
              </div>

              <div class="space-y-2 mb-4">
                <Label for="username">Имя пользователя</Label>
            <Input
                  id="username"
                  :value="username"
                  placeholder="johndoe"
                  @input="(e: Event) => (username = (e.target as HTMLInputElement).value)"
                />
                <span v-if="usernameError" class="text-sm text-destructive">{{ usernameError }}</span>
              </div>

              <div class="space-y-2 mb-4">
                <Label for="email">Email</Label>
                <Input 
                  id="email"
                  :value="emailField"
                  type="email"
                  placeholder="user@example.com"
                  @input="(e: Event) => (emailField = (e.target as HTMLInputElement).value)"
                />
                <span v-if="emailError" class="text-sm text-destructive">{{ emailError }}</span>
              </div>

              <div class="space-y-2 mb-4">
                <Label for="password">Новый пароль (необязательно)</Label>
                <Input 
                  id="password"
                  type="password"
                  :value="passwordField"
                  placeholder="Оставьте пустым, чтобы не менять"
                  @input="(e: Event) => (passwordField = (e.target as HTMLInputElement).value)"
                />
                <span v-if="passwordError" class="text-sm text-destructive">{{ passwordError }}</span>
              </div>

              <div class="space-y-2">
                <Label for="role">Роль</Label>
                <Select v-model="role">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <span v-if="roleError" class="text-sm text-destructive">{{ roleError }}</span>
              </div>

              <div class="space-y-2 mb-4">
                <Label for="balance">Баланс</Label>
                      <Input
                      id="balance"
                      :value="balance"
                      type="number"
                      placeholder="0"
                      @input="(e: Event) => (balance = Number((e.target as HTMLInputElement).value))"
                    />
                <span v-if="balanceError" class="text-sm text-destructive">{{ balanceError }}</span>
              </div>

              <div class="space-y-2">
                <Label for="level">Уровень</Label>
                <Select v-model="level">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Выберите уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIP1">VIP1</SelectItem>
                    <SelectItem value="VIP2">VIP2</SelectItem>
                  </SelectContent>
                </Select>
                <span v-if="levelError" class="text-sm text-destructive">{{ levelError }}</span>
              </div>

              <div class="space-y-2 mb-4">
                <Label for="isBalanceFrozen">Заморозить баланс</Label>
                <input
                  id="isBalanceFrozen"
                  type="checkbox"
                  class="form-checkbox h-5 w-5 text-primary"
                  :checked="isBalanceFrozen"
                  @change="e => isBalanceFrozen = (e.target as HTMLInputElement)?.checked"
                />
              </div>

                <Button type="submit" class="w-full"> 
                {{ isLoading ? "Сохраняем..." : "Сохранить" }}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div v-else class="text-center py-4 text-destructive">Пользователь не найден</div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/components/ui/AppToast/use-toast";
import { z } from "zod";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { ArrowLeft } from "lucide-vue-next";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AdminLayout from "@/layouts/admin.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";

// Типизация пользователя
type User = {
  id: string;
  email: string;
  username?: string;
  role?: string;
  avatar?: string;
  balance?: number;
  level?: "VIP1" | "VIP2";
  isBalanceFrozen?: boolean;
  createdAt: string;
};

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const avatarFile = ref<File | null>(null);





const { data: user } = await useFetch<User>(`/api/users/${route.params.id}`);


const email = ref("");
const password = ref("");
const role = ref<"USER" | "ADMIN">("USER");

const level = ref<"VIP1" | "VIP2">("VIP1");
const isBalanceFrozen = ref(false);
const isDirty = ref(false);

const form = useForm({
  validationSchema: toTypedSchema(
    z.object({
      username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Только латинские буквы, цифры и _").optional(),
      email: z.string().email("Неверный email").max(255).optional(),
      password: z.string().min(6).max(32).optional().or(z.literal("")),
      role: z.enum(["USER", "ADMIN"]).optional(),
      balance: z.number().min(0).optional(),
      level: z.enum(["VIP1", "VIP2"]).optional(),
      isBalanceFrozen: z.boolean().optional(),
    })
  ),
  initialValues: {
    username: "",
    email: "",
    password: "",
    role: "USER",
    balance: 0,
    level: "VIP1",
    isBalanceFrozen: false,
  },
});

const { value: username, errorMessage: usernameError } = useField<string>("username");
const { value: emailField, errorMessage: emailError } = useField<string>("email");
const { value: passwordField, errorMessage: passwordError } = useField<string>("password");
const { errorMessage: roleError } = useField<string>("role");
const { value: balance, errorMessage: balanceError } = useField<number>("balance");
const { errorMessage: levelError } = useField<string>("level");


watch(user, (newUser) => {

  if (newUser) {
    console.group("📥 Загрузка пользователя");
    console.log("👤 Пользователь:", newUser);

    username.value = newUser.username ?? "";
    email.value = newUser.email;
    role.value = (newUser.role as "USER" | "ADMIN") || "USER";
    balance.value = newUser.balance ?? 0;
    level.value = newUser.level || "VIP1";
    isBalanceFrozen.value = newUser.isBalanceFrozen || false;

      console.log(' Баланс сейчас:', balance.value);

      console.log(' Баланс сейчас:', newUser.balance);

       console.log(' Баланс сейчас:', newUser.username);

    form.setValues({
      username: username.value,
      email: email.value,
      password: "",
      role: role.value,
      balance: balance.value,
      level: level.value,
      isBalanceFrozen: isBalanceFrozen.value,
    });

    console.groupEnd();
  }
}, { immediate: true });
const { handleSubmit } = form;

watch([username, email, password, role, balance, level, isBalanceFrozen], () => {
  isDirty.value = true;
});

const isModified = computed(() => {
  return (
    username.value !== user.value?.username ||
    email.value !== user.value?.email ||
    role.value !== user.value?.role ||
    balance.value !== user.value?.balance ||
    level.value !== user.value?.level ||
    isBalanceFrozen.value !== user.value?.isBalanceFrozen ||
    (password.value && password.value.length >= 6) ||
    avatarFile.value !== null
  );
});

const avatarSrc = computed(() =>
  previewUrl.value ? previewUrl.value : user.value?.avatar ? `/${user.value.avatar.replace(/^\//, "")}` : ""
);

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file && file.size > 2 * 1024 * 1024) {
    toast({ title: "Ошибка", description: "Размер до 2MB", variant: "destructive" });
    return;
  }
  avatarFile.value = file || null;
  previewUrl.value = file ? URL.createObjectURL(file) : null;
};

const onSubmit = handleSubmit(async () => {
  console.log("onSubmit вызван");
  console.log("Ошибки валидации:", form.errors.value);

  try {
    isLoading.value = true;

    const updateData: any = {
      username: username.value.trim(),
      email: emailField.value.trim().toLowerCase(),
      role: role.value,
      balance: Number(balance.value),
      level: level.value,
      isBalanceFrozen: isBalanceFrozen.value,
    
    };

    // Только если задан новый пароль
    if (passwordField.value && passwordField.value.length >= 6) {
      updateData.password = passwordField.value;
    }

    console.log("📤 Отправка на сервер:", updateData);

    await $fetch(`/api/users/${route.params.id}`, {
      method: "PUT",
      body: updateData,
    });

    if (avatarFile.value) {
      const formData = new FormData();
      formData.append("avatar", avatarFile.value);
      await $fetch(`/api/users/avatar/${route.params.id}`, {
        method: "POST",
        body: formData,
      });
    }

    toast({ title: "✅ Успешно", description: "Пользователь обновлён" });
    router.push("/admin/users");
  } catch (error: any) {
    console.error("❌ Ошибка при обновлении:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: error?.data?.message || error.message || "Ошибка при обновлении",
    });
  } finally {
    isLoading.value = false;
  }
});
</script>