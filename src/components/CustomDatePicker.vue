<template>
  <div class="custom-date-picker">
    <Datepicker
      v-model="internalDate"
      :enable-time-picker="false"
      :format="formatDate"
      :preview-format="formatDate"
      auto-apply
      :day-names="['日', '一', '二', '三', '四', '五', '六']"
      :clearable="false"
      :placeholder="placeholder"
      :prevent-min-max-navigation="false"
      :month-change-on-scroll="false"
      @update:model-value="handleUpdate"
    >
      <template #trigger>
        <div class="date-trigger">
          <CalendarIcon :size="18" class="icon" />
          <span class="date-text">{{ displayDate }}</span>
        </div>
      </template>
    </Datepicker>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { Calendar as CalendarIcon } from 'lucide-vue-next';

interface Props {
  modelValue: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择日期'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const internalDate = ref<Date | null>(props.modelValue ? new Date(props.modelValue) : null);

watch(() => props.modelValue, (newVal) => {
  internalDate.value = newVal ? new Date(newVal) : null;
});

const displayDate = computed(() => {
  if (!internalDate.value) return props.placeholder;
  return formatDate(internalDate.value);
});

const formatDate = (date: Date): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
};

const handleUpdate = (date: Date | null) => {
  if (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    emit('update:modelValue', `${year}-${month}-${day}`);
  }
};
</script>

<style scoped>
.custom-date-picker {
  width: 100%;
}

.date-trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 42px;
}

.date-trigger:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.date-trigger:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
  outline: none;
}

.date-trigger .icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.date-text {
  flex: 1;
  color: var(--color-text);
  font-size: 0.9375rem;
  font-weight: 500;
}

/* Override library styles */
:deep(.dp__input_wrap) {
  display: none;
}

:deep(.dp__menu) {
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  background: var(--color-surface);
  padding: 1rem;
  overflow: hidden;
}

:deep(.dp__calendar_header) {
  background: transparent;
  padding: 0.5rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

:deep(.dp__month_year_select) {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1rem;
}

:deep(.dp__calendar_header_item) {
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

:deep(.dp__calendar_item) {
  margin: 2px;
}

:deep(.dp__cell_inner) {
  border-radius: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
  transition: all 0.15s ease;
  height: 36px;
  width: 36px;
}

:deep(.dp__cell_inner:hover) {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  transform: scale(1.05);
}

:deep(.dp__active_date .dp__cell_inner),
:deep(.dp__today .dp__cell_inner) {
  background: var(--color-primary);
  color: white;
  font-weight: 700;
}

:deep(.dp__cell_offset) {
  visibility: hidden !important;
  pointer-events: none !important;
}

:deep(.dp__cell_offset .dp__cell_inner) {
  opacity: 0 !important;
  cursor: default !important;
}

:deep(.dp__cell_disabled) {
  color: var(--color-text-disabled);
  text-decoration: line-through;
}

:deep(.dp__arrow_top),
:deep(.dp__arrow_bottom) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-text);
  transition: all 0.15s ease;
}

:deep(.dp__arrow_top:hover),
:deep(.dp__arrow_bottom:hover) {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
}

:deep(.dp__instance_calendar) {
  padding: 0.5rem;
}

/* Dark mode specific overrides */
[data-theme="dark"] :deep(.dp__menu) {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] :deep(.dp__cell_inner) {
  color: var(--color-text);
}

[data-theme="dark"] :deep(.dp__active_date .dp__cell_inner),
[data-theme="dark"] :deep(.dp__today .dp__cell_inner) {
  background: var(--color-primary);
  color: white;
}

[data-theme="dark"] :deep(.dp__cell_inner:hover) {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
}
</style>
