<script setup>
import { ref } from 'vue';

const emit = defineEmits(['file-selected']);
const isDragging = ref(false);
const fileInput = ref(null);

const handleDragEnter = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    validateAndEmit(files[0]);
  }
};

const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    validateAndEmit(files[0]);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const validateAndEmit = (file) => {
  if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
    emit('file-selected', file);
  } else {
    alert('Please upload an MP3 file.');
  }
};
</script>

<template>
  <div
    class="drop-zone"
    :class="{ active: isDragging }"
    @dragenter="handleDragEnter"
    @dragover.prevent
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerFileInput"
  >
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      accept=".mp3,audio/mpeg"
      hidden
    />

    <div class="icon-wrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 19V6l12-2v13"
        />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    </div>

    <p class="title">Upload audio file</p>
    <p class="subtitle">
      Drag & drop your MP3 here or <span>browse files</span>
    </p>
  </div>
</template>


<style scoped>
.drop-zone {
  position: relative;
  border-radius: 20px;
  padding: 4.5rem 2rem;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(12px);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.35s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.drop-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(56, 189, 248, 0.4),
    transparent
  );
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: var(--accent-primary);
  transform: translateY(-2px) scale(1.01);
}

.drop-zone:hover::before,
.drop-zone.active::before {
  opacity: 1;
}

.drop-zone.active {
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.35);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(56, 189, 248, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
  }
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.icon {
  width: 36px;
  height: 36px;
  color: var(--accent-primary);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.subtitle span {
  color: var(--accent-primary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
}

</style>
