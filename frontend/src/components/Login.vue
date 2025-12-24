<template>
  <div class="auth-page">
    <div class="auth-card-container">
      <div class="auth-visual-side">
        <div class="visual-content">
          <div class="logo-area">
            <span class="logo-icon">📍</span>
            <span class="logo-text">Action Atlas</span>
          </div>
          <h1>From Meetings and Ideas to Action</h1>
          <p>Transform your team's conversations into actionable insights. Your journey to peak performance starts here.</p>
          <div class="map-decoration">
            <!-- Simplified abstract map pattern -->
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M10,100 Q50,150 100,100 T190,100" stroke="var(--accent-primary)" stroke-dasharray="4 4" fill="none" opacity="0.3" />
              <circle cx="10" cy="100" r="3" fill="var(--accent-primary)" />
              <circle cx="190" cy="100" r="3" fill="var(--accent-secondary)" />
              <path d="M40,20 Q80,60 40,100 T40,180" stroke="var(--accent-secondary)" fill="none" opacity="0.1" />
            </svg>
          </div>
        </div>
      </div>

      <div class="auth-form-side">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Welcome Back</h2>
            <p>Ready to continue your exploration?</p>
          </div>

          <form @submit.prevent="onSubmit" class="modern-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input id="email" v-model="email" type="email" placeholder="explorer@actionatlas.com" required />
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label for="password">Password</label>
                <a href="#" class="subtle-link">Forgot?</a>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="password" 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="••••••••"
                  required 
                />
                <button type="button" class="visibility-toggle" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="!isLoading">Begin Journey</span>
              <span v-else class="loader"></span>
            </button>

            <div class="divider">
              <span>or</span>
            </div>

            <button type="button" class="btn-google" @click="loginWithGoogle">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Continue with Google
            </button>

            <button type="button" class="btn-secondary" @click="router.push('/test')">
              Test Capabilities
            </button>
          </form>

          <div class="form-footer">
            <p>New to the Atlas? <router-link to="/register" class="highlight-link">Start Mapping</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const error = ref('');
const router = useRouter();

async function onSubmit() {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: email.value,
      password: password.value
    });
    
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
    console.error('Login error:', err);
  } finally {
    isLoading.value = false;
  }
}

function loginWithGoogle() {
  window.location.href = 'http://localhost:3000/api/auth/google';
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-card-container {
  display: flex;
  width: 100%;
  max-width: 860px;
  min-height: 480px;
  background: var(--bg-secondary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: var(--glass-border);
}

/* Visual Side */
.auth-visual-side {
  flex: 1;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 2.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.visual-content {
  position: relative;
  z-index: 2;
  text-align: left;
  max-width: 280px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: 1.25rem;
}

.auth-visual-side h1 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, var(--text-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: left;
}

.auth-visual-side p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 320px;
  margin: 0;
  text-align: left;
}

.map-decoration {
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  opacity: 0.5;
  pointer-events: none;
}

/* Form Side */
.auth-form-side {
  flex: 1;
  background: var(--bg-secondary);
  padding: 2.25rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  width: 100%;
  max-width: 360px;
  text-align: left;
}

.form-header {
  margin-bottom: 1.5rem;
}

.form-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.form-header p {
  color: var(--text-secondary);
  margin: 0;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  opacity: 0.5;
}

input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: inherit;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.visibility-toggle {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: none;
}

.visibility-toggle:hover {
  border-color: transparent;
  box-shadow: none;
}

.btn-primary {
  margin-top: 1rem;
  padding: 0.875rem;
  background: var(--accent-primary);
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover {
  background: #059669; /* Darker emerald */
  transform: translateY(-1px);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider:not(:empty)::before {
  margin-right: .5em;
}

.divider:not(:empty)::after {
  margin-left: .5em;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #fff;
  color: #374151;
  border: 1px solid var(--border-color);
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-google:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.btn-google img {
  width: 18px;
  height: 18px;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  margin-top: 0.5rem;
  padding: 0.875rem;
  background: transparent;
  color: var(--accent-secondary);
  border: 1px solid var(--accent-secondary);
  font-weight: 700;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(14, 165, 233, 0.1);
  border-color: var(--accent-secondary);
  color: #fff;
}

.subtle-link {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.subtle-link:hover {
  color: var(--accent-primary);
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.form-footer p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.highlight-link {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 700;
}

.highlight-link:hover {
  text-decoration: underline;
}

/* Loader */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsiveness */
@media (max-width: 768px) {
  .auth-page {
    padding: 0;
    align-items: flex-start;
  }

  .auth-card-container {
    flex-direction: column;
    min-height: 100vh;
    border-radius: 0;
    border: none;
  }
  
  .auth-visual-side {
    padding: 2rem;
    text-align: center;
    flex: none;
    min-height: 200px;
  }
  
  .auth-visual-side h1 {
    font-size: 1.75rem;
    text-align: center;
  }
  
  .auth-visual-side p {
    margin: 0 auto;
    text-align: center;
    font-size: 0.95rem;
  }
  
  .visual-content {
    max-width: 100%;
    text-align: center;
  }

  .logo-area {
    justify-content: center;
    margin-bottom: 1rem;
  }

  .auth-form-side {
    padding: 2rem;
    flex: 1;
  }
}
</style>
