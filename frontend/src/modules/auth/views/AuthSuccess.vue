<template>
  <div class="auth-success-page">
    <div class="loader-container">
      <div class="loader"></div>
      <p>Finalizing your journey...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

onMounted(() => {
  const token = route.query.token;
  if (token) {
    localStorage.setItem('token', token);
    // You might want to fetch user data here or just redirect
    router.push('/');
  } else {
    router.push('/login');
  }
});
</script>

<style scoped>
.auth-success-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.loader-container {
  text-align: center;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
