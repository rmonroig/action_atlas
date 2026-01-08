<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/ui/Sidebar.vue';

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

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Close menu on route change
watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
  }
);

const showSidebar = computed(() => {
  return isDashboardPage.value;
});
</script>

<template>
  <div class="app-container" :class="{ 'has-sidebar': isDashboardPage }">
    <!-- Mobile Header / Hamburger -->
    <button 
      v-if="showSidebar" 
      class="mobile-menu-btn" 
      @click="toggleMobileMenu"
      aria-label="Toggle Menu"
    >
      <span class="hamburger-icon">☰</span>
    </button>

    <!-- Overlay -->
    <div 
      v-if="showSidebar && isMobileMenuOpen" 
      class="sidebar-overlay"
      @click="isMobileMenuOpen = false"
    ></div>

    <Sidebar 
      v-if="showSidebar" 
      :class="{ 'mobile-open': isMobileMenuOpen }" 
    />
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

.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 200;
  background: var(--bg-secondary, #1e293b);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  backdrop-filter: blur(2px);
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 0;
    width: 100%;
    padding-top: 4rem; /* Space for hamburger */
  }

  .mobile-menu-btn {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }
}
.guest-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}
</style>
