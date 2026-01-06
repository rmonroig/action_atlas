<script setup>
import { useRouter } from 'vue-router';
import { API_URL } from '../../config';

const router = useRouter();

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/auth/logout`, {
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
        <router-link to="/profile" class="nav-item" active-class="active">
          <span class="icon">👤</span> Profile
        </router-link>
      </div>

      <div class="nav-group">
        <h3>Workspace</h3>
        <router-link to="/home" class="nav-item" active-class="active">
          <span class="icon">🕒</span> Previous Meetings
        </router-link>
        <router-link to="/preparation" class="nav-item" active-class="active">
          <span class="icon">📝</span> Meeting Preparation
        </router-link>
        <router-link to="/whatsapp" class="nav-item" active-class="active">
          <span class="icon" style="color: #25D366; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </span> WhatsApp Audio
        </router-link>
        <router-link to="/opportunities" class="nav-item" active-class="active">
          <span class="icon">✨</span> New Opportunities
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
