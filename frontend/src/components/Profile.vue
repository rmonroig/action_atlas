<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '../config';

const router = useRouter();
const user = ref(null);
const loading = ref(true);
const stats = ref({ meetings: 0 });

onMounted(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    // Fetch Profile
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      user.value = await res.json();
    } else {
      // Token invalid
      localStorage.removeItem('token');
      router.push('/login');
    }

    // Fetch Stats (Lazy way: get history count)
    const historyRes = await fetch(`${API_URL}/api/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (historyRes.ok) {
        const history = await historyRes.json();
        stats.value.meetings = history.length;
    }

  } catch (error) {
    console.error("Failed to load profile:", error);
  } finally {
    loading.value = false;
  }
});

const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
};
</script>

<template>
  <div class="profile-wrapper fade-in">
    <div class="profile-card">
      <div class="card-header-actions">
           <router-link to="/home" class="back-link">← Back</router-link>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="user" class="profile-content">
        <header class="profile-header">
           <div class="avatar-placeholder">
              {{ user.email[0].toUpperCase() }}
           </div>
           <h2>{{ user.email }}</h2>
           <span class="role-badge">Pro User</span>
        </header>

        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-value">{{ stats.meetings }}</span>
                <span class="stat-label">Total Meetings</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">∞</span>
                <span class="stat-label">Analysis Credits</span>
            </div>
        </div>

        <div class="actions">
            <button @click="handleLogout" class="btn btn-danger">Log Out</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-wrapper {
  max-width: 600px;
  margin: 2rem auto;
}

.profile-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: var(--glass-border);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: var(--shadow-soft);
  text-align: center;
  position: relative;
}

.card-header-actions {
    position: absolute;
    top: 2rem;
    left: 2rem;
}

.back-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
}

.back-link:hover {
    color: var(--accent-primary);
}

.profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2.5rem;
}

.avatar-placeholder {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--accent-primary), #3b82f6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.profile-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
}

.role-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.3rem 0.8rem;
    border-radius: 100px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-item {
    background: rgba(255, 255, 255, 0.03);
    padding: 1.5rem;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: white;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.btn-danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
    padding: 0.8rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-danger:hover {
    background: #ef4444;
    color: white;
}

.loading-state {
    padding: 2rem;
    display: flex;
    justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
