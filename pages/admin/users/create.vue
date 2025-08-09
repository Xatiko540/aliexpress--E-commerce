<template>
  <AdminLayout>
    <div class="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Create User</CardTitle>
              <CardDescription>Add a new user to the system</CardDescription>
            </div>
            <NuxtLink to="/admin/users">
              <Button variant="outline">
                <ArrowLeft class="w-4 h-4 mr-2" />
                Назад
              </Button>
            </NuxtLink>
          </div>
        </CardHeader>
        <CardContent>
          <Form :submit="handleSubmit(onSubmit)" class="space-y-4">
            <!-- Avatar Upload -->
            <div class="flex items-center gap-4">
              <UiAvatar class="w-24 h-24">
                <UiAvatarImage :src="previewUrl || ''" />
                <UiAvatarFallback>
                  {{ username?.charAt(0)?.toUpperCase() || "U" }}
                </UiAvatarFallback>
              </UiAvatar>
              <Input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @input="handleFileInput"
              />
            </div>

            <!-- Username -->
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <Input
                id="username"
                :value="username"
                @input="(e: Event) => (username = (e.target as HTMLInputElement).value)"
                placeholder="johndoe"
              />
              <span v-if="usernameError" class="text-sm text-destructive">{{ usernameError }}</span>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                :value="email"
                @input="(e: Event) => (email = (e.target as HTMLInputElement).value)"
                placeholder="john@example.com"
              />
              <span v-if="emailError" class="text-sm text-destructive">{{ emailError }}</span>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                type="password"
                :value="password"
                @input="(e: Event) => (password = (e.target as HTMLInputElement).value)"
                placeholder="••••••••"
              />
              <span v-if="passwordError" class="text-sm text-destructive">{{ passwordError }}</span>
            </div>

            <!-- Role -->
            <div class="space-y-2">
              <Label for="role">Role</Label>
              <Select v-model="role">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <span v-if="roleError" class="text-sm text-destructive">{{ roleError }}</span>
            </div>

            <!-- Level -->
            <div class="space-y-2">
              <Label for="level">Level</Label>
              <Select v-model="level">
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP1">VIP1</SelectItem>
                  <SelectItem value="VIP2">VIP2</SelectItem>
                </SelectContent>
              </Select>
              <span v-if="levelError" class="text-sm text-destructive">{{ levelError }}</span>
            </div>

            <!-- Submit -->
            <Button type="submit" class="w-full">
              {{ isLoading ? "Creating..." : "Create User" }}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/components/ui/AppToast/use-toast";
import AdminLayout from "@/layouts/admin.vue";
import { useField, useForm, Form } from "vee-validate";
import { UiAvatar, UiAvatarImage, UiAvatarFallback } from "@/components/ui/avatar";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";

const router = useRouter();
const { toast } = useToast();

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const isLoading = ref(false);

const {
  value: level,
  errorMessage: levelError,
} = useField<string>("level");

const { handleSubmit, setFieldValue, errors } = useForm({
  initialValues: {
    username: '',
    email: '',
    password: '',
    role: 'USER',
    level: 'VIP1',
  },
});

const {
  value: username,
  errorMessage: usernameError,
} = useField<string>("username");
const {
  value: email,
  errorMessage: emailError,
} = useField<string>("email");
const {
  value: password,
  errorMessage: passwordError,
} = useField<string>("password");
const {
  value: role,
  errorMessage: roleError,
} = useField<"ADMIN" | "USER">("role");

onMounted(() => {
  setFieldValue("role", "USER");
});

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    toast({
      title: "Ошибка",
      description: "Файл больше 2MB",
      variant: "destructive",
    });
    return;
  }

  avatarFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const onSubmit = async (values: any) => {

  console.log("Submit triggered");
  console.log("Ошибки валидации:", errors.value);
  console.log("🎯 onSubmit values:", values);
  try {
    isLoading.value = true;

    const payload = {
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      level: values.level,
    };

    console.log("📤 Payload being sent:", payload);

    const response = await $fetch("/api/users", {
      method: "POST",
      body: payload,
    });

    console.log("🔥 body received:", response);

    try {
      if (avatarFile.value) {
        const formData = new FormData();
        formData.append("avatar", avatarFile.value);

        await $fetch(`/api/users/avatar/${response.id}`, {
          method: "POST",
          body: formData,
        });
      }
    } catch (e) {
      console.error("Ошибка загрузки аватара:", e);
    }

    toast({ title: "✅ Успех", description: "Пользователь создан" });
    router.push("/admin/users");
  } catch (error: any) {
    console.error("❌ Submit error:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: error?.data?.message || error.message || "Ошибка создания",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>