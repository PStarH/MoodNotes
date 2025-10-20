<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      @click.self="handleCancel"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"></div>

      <!-- Dialog -->
      <div
        ref="dialogRef"
        class="relative glass-effect rounded-2xl p-6 warm-shadow-lg max-w-md w-full animate-scale-in"
        role="alertdialog"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
        aria-modal="true"
      >
        <!-- Icon -->
        <div
          v-if="icon"
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full"
          :class="iconBgClass"
        >
          <span class="text-3xl" aria-hidden="true">{{ icon }}</span>
        </div>

        <!-- Title -->
        <h2
          :id="titleId"
          class="text-xl font-bold text-center mb-3"
          :class="titleClass"
        >
          {{ title }}
        </h2>

        <!-- Message -->
        <p
          :id="messageId"
          class="text-center mb-6 leading-relaxed"
          style="color: var(--color-text-secondary);"
        >
          {{ message }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            v-if="!hideCancel"
            ref="cancelButtonRef"
            type="button"
            @click="handleCancel"
            class="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover-lift glass-effect"
            style="border: 1px solid var(--color-border);"
            :aria-label="cancelText"
          >
            <span style="color: var(--color-text);">{{ cancelText }}</span>
          </button>
          <button
            ref="confirmButtonRef"
            type="button"
            @click="handleConfirm"
            class="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover-lift warm-shadow"
            :class="confirmButtonClass"
            :aria-label="confirmText"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  message?: string
  icon?: string
  type?: 'info' | 'warning' | 'danger' | 'success'
  confirmText?: string
  cancelText?: string
  hideCancel?: boolean
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: 'Confirm',
  message: 'Are you sure?',
  icon: '❓',
  type: 'info',
  hideCancel: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:isOpen': [value: boolean]
}>()

const { t } = useI18n()

const dialogRef = ref<HTMLDivElement>()
const confirmButtonRef = ref<HTMLButtonElement>()
const cancelButtonRef = ref<HTMLButtonElement>()

const titleId = 'confirm-dialog-title'
const messageId = 'confirm-dialog-message'

const confirmText = computed(() => props.confirmText || t('common.confirm'))
const cancelText = computed(() => props.cancelText || t('common.cancel'))

const iconBgClass = computed(() => {
  const classes = {
    info: 'bg-blue-100 dark:bg-blue-900/30',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    danger: 'bg-red-100 dark:bg-red-900/30',
    success: 'bg-green-100 dark:bg-green-900/30'
  }
  return classes[props.type]
})

const titleClass = computed(() => {
  const classes = {
    info: 'text-blue-800 dark:text-blue-300',
    warning: 'text-yellow-800 dark:text-yellow-300',
    danger: 'text-red-800 dark:text-red-300',
    success: 'text-green-800 dark:text-green-300'
  }
  return classes[props.type]
})

const confirmButtonClass = computed(() => {
  const classes = {
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
  }
  return classes[props.type]
})

const handleConfirm = () => {
  emit('confirm')
  emit('update:isOpen', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

// Focus management
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    // Focus the dangerous action (confirm) for danger type, cancel for others
    if (props.type === 'danger' && cancelButtonRef.value) {
      cancelButtonRef.value.focus()
    } else if (confirmButtonRef.value) {
      confirmButtonRef.value.focus()
    }

    // Trap focus within dialog
    const focusableElements = dialogRef.value?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        } else if (e.key === 'Escape') {
          handleCancel()
        }
      }

      document.addEventListener('keydown', trapFocus)
      return () => {
        document.removeEventListener('keydown', trapFocus)
      }
    }
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
