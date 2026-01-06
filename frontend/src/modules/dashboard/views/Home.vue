<script setup>
import { ref, onMounted, computed } from 'vue';
import HistoryItem from '../components/HistoryItem.vue';
import { API_URL } from '../../../config';

const history = ref([]);
const isLoadingHistory = ref(false);
const filterType = ref('all'); // 'all', 'meeting', 'whatsapp'

const filteredHistory = computed(() => {
  if (filterType.value === 'all') return history.value;
  if (filterType.value === 'whatsapp') {
    return history.value.filter(item => item.type === 'whatsapp');
  }
  if (filterType.value === 'meeting') {
    return history.value.filter(item => !item.type || ['meeting', 'standard', 'preparation'].includes(item.type));
  }
  return history.value;
});

const fetchHistory = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  isLoadingHistory.value = true;
  try {
    const response = await fetch(`${API_URL}/api/history`, {
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
      <router-link to="/preparation" class="new-meeting-btn">
        <span class="plus">+</span> New Meeting
      </router-link>
    </header>

    <section class="history-section">
      <div class="section-header">
        <div class="header-controls">
          <h2>Previous Meetings</h2>
          <div class="filters">
            <button 
              :class="['filter-btn', { active: filterType === 'all' }]"
              @click="filterType = 'all'"
            >
              All
            </button>
            <button 
              :class="['filter-btn', { active: filterType === 'meeting' }]"
              @click="filterType = 'meeting'"
            >
              Meetings
            </button>
            <button 
              :class="['filter-btn', { active: filterType === 'whatsapp' }]"
              @click="filterType = 'whatsapp'"
            >
              WhatsApp
            </button>
          </div>
        </div>
        
        <button @click="fetchHistory" class="refresh-btn" :disabled="isLoadingHistory">
          {{ isLoadingHistory ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="filteredHistory.length > 0" class="history-list">
        <HistoryItem v-for="item in filteredHistory" :key="item._id" :item="item" />
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.filters {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.filter-btn:hover {
  color: white;
}

.filter-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

@media (max-width: 600px) {
  .section-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
  }

  .header-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
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
