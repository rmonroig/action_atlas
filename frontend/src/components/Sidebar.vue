<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }
};
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <div class="nav-group">
        <h3>Account</h3>
        <a href="#" class="nav-item">
          <span class="icon">👤</span> Profile
        </a>
      </div>

      <div class="nav-group">
        <h3>Workspace</h3>
        <router-link to="/home" class="nav-item" active-class="active">
          <span class="icon">🕒</span> Previous Meetings
        </router-link>
        <router-link to="/process" class="nav-item" active-class="active">
          <span class="icon">➕</span> New Meeting
        </router-link>
        <router-link to="/opportunities" class="nav-item" active-class="active">
          <span class="icon">✨</span> New Opportunities
        </router-link>
        <router-link to="/preparation" class="nav-item" active-class="active">
          <span class="icon">📝</span> Meeting Preparation
        </router-link>
      </div>

      <div class="nav-footer">
        <div class="user-card">
          <div class="user-avatar">?</div>
          <div class="user-info">
            <p class="user-name">Professional Member</p>
            <p class="user-role">Premium Member</p>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <span class="icon">🚪</span> Log Out
        </button>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: #060a14; /* Differentiable dark navy */
  border-right: 1px solid var(--border-color);
  z-index: 100;
  overflow: hidden; /* Remove scroll */
}

.sidebar-nav {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  height: 100%;
}

.nav-group h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-primary);
}

.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.nav-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  font-weight: bold;
}

.user-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.9rem;
  text-align: left;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
  text-align: left;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  color: #ef4444;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}
</style>
