<template>
  <div class="auth-page">
    <div class="auth-card-container">
      <div class="auth-visual-side">
        <div class="visual-content">
          <div class="logo-area">
            <span class="logo-icon">🦁</span>
            <span class="logo-text">Brave Mentor</span>
          </div>
          <h1>Start Your Bold Journey</h1>
          <p>Join a community of professionals turning complex challenges into decisive victories.</p>
          <div class="trust-signals">
            <div class="trust-item">
              <span class="trust-icon">🔒</span>
              <span>Enterprise-grade security</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">🛡️</span>
              <span>Privacy-first approach</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-form-side">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Create Your Account</h2>
            <p>Your journey begins here.</p>
          </div>

          <div v-if="success" class="success-message">
            <div class="icon-circle success">✉️</div>
            <h3>Check Your Email</h3>
            <p>We've sent a verification link to <strong>{{ email }}</strong>.</p>
            <p>Please check your inbox (and spam folder) to verify your account before logging in.</p>
            <button @click="router.push('/login')" class="btn-primary">Return to Login</button>
          </div>

          <form v-else @submit.prevent="onSubmit" class="modern-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input id="email" v-model="email" type="email" placeholder="explorer@bravementor.com" required />
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input id="password" v-model="password" type="password" placeholder="Min. 8 characters" required minlength="8" />
              </div>
              <div class="password-strength" v-if="password">
                <div class="strength-bar" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <div class="input-wrapper">
                <span class="input-icon">✅</span>
                <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="Repeat password" required />
              </div>
            </div>

            <div class="terms-check">
              <input type="checkbox" id="terms" required />
              <label for="terms">I agree to the <a href="#" class="subtle-link">Terms of Service</a> and <a href="#" class="subtle-link">Privacy Policy</a></label>
            </div>

            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="!isLoading">Establish Basecamp</span>
              <span v-else class="loader"></span>
            </button>

            <div class="divider">
              <span>or</span>
            </div>

            <button type="button" class="btn-google" @click="loginWithGoogle">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Continue with Google
            </button>

            <button type="button" class="btn-secondary" @click="router.push('/')">
              Test Capabilities
            </button>
          </form>

          <div class="form-footer">
            <p>Already an explorer? <router-link to="/login" class="highlight-link">Sign In</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../config';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const error = ref('');
const router = useRouter();

const strengthPercent = computed(() => {
  if (!password.value) return 0;
  let score = 0;
  if (password.value.length >= 8) score += 25;
  if (/[A-Z]/.test(password.value)) score += 25;
  if (/[0-9]/.test(password.value)) score += 25;
  if (/[^A-Za-z0-9]/.test(password.value)) score += 25;
  return score;
});

const strengthClass = computed(() => {
  if (strengthPercent.value <= 25) return 'weak';
  if (strengthPercent.value <= 75) return 'medium';
  return 'strong';
});

const success = ref(false); // Add success ref

async function onSubmit() {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match');
    return;
  }
  
  isLoading.value = true;
  error.value = '';
  
  try {
    await axios.post(`${API_URL}/api/auth/register`, {
      email: email.value,
      password: password.value
    });
    
    success.value = true; // Set success instead of redirect
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
    console.error('Registration error:', err);
  } finally {
    isLoading.value = false;
  }
}

function loginWithGoogle() {
  window.location.href = `${API_URL}/api/auth/google`;
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
  min-height: 520px;
  background: var(--bg-secondary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: var(--glass-border);
}

/* Visual Side */
.auth-visual-side {
  flex: 1;
  background: linear-gradient(225deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
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
  margin-bottom: 2rem;
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
  margin-bottom: 0.75rem;
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
  margin-bottom: 1.5rem;
  text-align: left;
}

.trust-signals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.trust-icon {
  font-size: 1rem;
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
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

input[type="text"],
input[type="email"],
input[type="password"] {
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
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.15);
}

.password-strength {
  height: 4px;
  background: var(--bg-primary);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-bar.weak { background: var(--error); }
.strength-bar.medium { background: var(--accent-highlight); }
.strength-bar.strong { background: var(--success); }

.terms-check {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.terms-check input {
  margin-top: 0.25rem;
  cursor: pointer;
}

.terms-check label {
  font-weight: 400;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
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
  background: #059669;
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
  color: var(--accent-primary);
  text-decoration: none;
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
    margin: 0 auto 1.5rem;
    text-align: center;
    font-size: 0.95rem;
  }

  .visual-content {
    max-width: 100%;
    text-align: center;
  }

  .logo-area {
    justify-content: center;
  }

  .trust-signals {
    align-items: center;
  }
  
  .auth-form-side {
    padding: 2rem;
    flex: 1;
  }
}

.success-message {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.icon-circle.success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--accent-primary);
}
</style>
