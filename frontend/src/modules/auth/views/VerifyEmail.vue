<template>
  <div class="auth-page">
    <div class="auth-card-container">
      <div class="auth-form-side full-width">
        <div class="form-wrapper center-text">
          <div class="form-header">
            <h2>Email Verification</h2>
            <p v-if="loading">Verifying your email address...</p>
            <p v-else-if="success" class="success-text">Verification Successful!</p>
            <p v-else class="error-text">Verification Failed</p>
          </div>

          <div v-if="loading" class="loader-container">
            <span class="loader large"></span>
          </div>

          <div v-if="success" class="result-content">
             <div class="icon-circle success">✓</div>
             <p>Your email has been verified. You can now access your account.</p>
             <button @click="router.push('/login')" class="btn-primary">Proceed to Login</button>
          </div>

          <div v-if="!loading && !success" class="result-content">
             <div class="icon-circle error">✕</div>
             <p>{{ error }}</p>
             <button @click="router.push('/login')" class="btn-secondary">Back to Login</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../../config';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
    const token = route.query.token;
    if (!token) {
        error.value = 'No verification token provided.';
        loading.value = false;
        return;
    }

    try {
        await axios.post(`${API_URL}/api/auth/verify-email`, { token });
        success.value = true;
    } catch (err) {
        error.value = err.response?.data?.message || 'Verification failed. The link may be invalid or expired.';
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
/* Reuse styles from Login/Register logic implicitly or explicitly copy common styles */
/* For brevity, I'll copy the key structure styles */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-primary); 
}

.auth-card-container {
  display: flex;
  width: 100%;
  max-width: 500px;
  min-height: 400px;
  background: var(--bg-secondary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: var(--glass-border);
}

.auth-form-side {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  width: 100%;
  text-align: center;
}

.form-header h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.center-text { text-align: center; }

.btn-primary {
  margin-top: 1.5rem;
  padding: 0.875rem;
  background: var(--accent-primary);
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  width: 100%;
  border: none;
  cursor: pointer;
}

.btn-secondary {
    margin-top: 1.5rem;
    padding: 0.875rem;
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    width: 100%;
    cursor: pointer;
}

.result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 1rem;
}

.icon-circle.success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--accent-primary);
}

.icon-circle.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.loader {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    border-top-color: var(--accent-primary);
    animation: spin 1s linear infinite;
    margin: 2rem auto;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
