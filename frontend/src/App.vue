<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';

const route = useRoute();
const isAuthPage = computed(() => {
  return route.name === 'Login' || route.name === 'Register';
});

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token');
});

const isDashboardPage = computed(() => {
  const dashboardRoutes = ['Home', 'HomeAlt', 'ProcessMeeting', 'Opportunities', 'Preparation'];
  // Dashboard layout applies if it's a dashboard route AND the user is authenticated
  return dashboardRoutes.includes(route.name) && isAuthenticated.value;
});

const showSidebar = computed(() => {
  return isDashboardPage.value;
});
</script>

<template>
  <div class="app-container" :class="{ 'has-sidebar': isDashboardPage }">
    <Sidebar v-if="showSidebar" />
    <main :class="{ 'dashboard-main': showSidebar, 'guest-container': !showSidebar && !isAuthPage }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
}
.dashboard-main {
  margin-left: 280px;
  padding: 2rem;
  min-height: 100vh;
  text-align: left;
}
@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 0;
    width: 100%;
  }
}
.guest-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}
</style>
