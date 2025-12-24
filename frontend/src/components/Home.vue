<script setup>
import { ref, onMounted } from 'vue';
import HistoryItem from './HistoryItem.vue';

const history = ref([]);
const isLoadingHistory = ref(false);

const fetchHistory = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  isLoadingHistory.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      history.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch history:', error);
  } finally {
    isLoadingHistory.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});
</script>

<template>
  <div class="home-page fade-in">
    <header class="content-header">
      <div>
         <h1>Intelligence hub</h1>
         <p class="subtitle">Actionable insights from your meetings</p>
      </div>
      <router-link to="/process" class="new-meeting-btn">
        <span class="plus">+</span> New Meeting
      </router-link>
    </header>

    <section class="history-section">
      <div class="section-header">
        <h2>Previous Meetings</h2>
        <button @click="fetchHistory" class="refresh-btn" :disabled="isLoadingHistory">
          {{ isLoadingHistory ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="history.length > 0" class="history-list">
        <HistoryItem v-for="item in history" :key="item._id" :item="item" />
      </div>
      <div v-else-if="isLoadingHistory" class="loading-history">
        <div class="spinner small"></div>
        <p>Gathering your past meetings...</p>
      </div>
      <div v-else class="empty-state">
        <p>No meetings found. Start by processing your first one!</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  text-align: left;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.new-meeting-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.new-meeting-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  filter: brightness(1.1);
}

.plus {
  font-size: 1.2rem;
}

.history-section {
  text-align: left;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px dashed var(--border-color);
}

.loading-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4rem;
  color: var(--text-secondary);
}

.spinner.small {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(56, 189, 248, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .content-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .new-meeting-btn {
    justify-content: center;
  }
}
</style>
