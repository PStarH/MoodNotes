<template>
    <div
        ref="wrapper"
        class="relative w-full"
        role="presentation"
    >
        <button
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl border border-[#D3C9A6] bg-gradient-to-br from-[#FCF7EA]/90 to-[#F3E8CE]/90 px-4 py-3 text-left text-[#4E3B2B] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D5A36]"
            :aria-expanded="isOpen"
            :aria-controls="listboxId"
            :aria-haspopup="'listbox'"
            :disabled="disabled"
            @click="toggleDropdown"
            @keydown.down.prevent="openAndHighlight(1)"
            @keydown.up.prevent="openAndHighlight(-1)"
            @keydown.enter.prevent="commitCurrentHighlight"
            @keydown.space.prevent="commitCurrentHighlight"
            @keydown.esc.stop.prevent="closeDropdown"
        >
            <span class="text-2xl" aria-hidden="true">{{ selectedOption?.emoji ?? '🙂' }}</span>
            <div class="flex-1">
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#7D5A36]/70">Choose a mood</p>
                <p class="text-base font-semibold leading-tight">{{ selectedOption?.label ?? '\n' }}</p>
                <p class="text-xs text-[#7D5A36]/70">{{ selectedOption?.caption ?? defaultCaption }}</p>
            </div>
            <ChevronDown
                class="shrink-0 text-[#7D5A36]/70 transition-transform"
                :class="{ 'rotate-180': isOpen }"
                :size="20"
                aria-hidden="true"
            />
        </button>

        <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <ul
                v-if="isOpen"
                :id="listboxId"
                class="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#E2D6B8] bg-[#FCF7EA] p-2 text-[#4E3B2B] shadow-xl ring-1 ring-black/5"
                role="listbox"
                :aria-activedescendant="activeOptionId"
                tabindex="-1"
                @keydown.down.prevent="highlightRelative(1)"
                @keydown.up.prevent="highlightRelative(-1)"
                @keydown.enter.prevent="commitCurrentHighlight"
                @keydown.space.prevent="commitCurrentHighlight"
                @keydown.esc.stop.prevent="closeDropdown"
            >
                <li
                    v-for="(option, index) in options"
                    :id="optionId(index)"
                    :key="option.value"
                    role="option"
                    :aria-selected="option.value === modelValue"
                    @mouseenter="highlightIndex = index"
                    @mouseleave="highlightIndex = selectedIndex"
                    @click="selectOption(option)"
                    class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all"
                    :class="[
                        option.value === modelValue ? 'bg-[#7D5A36]/10 font-semibold shadow-inner' : 'hover:bg-[#7D5A36]/10',
                        highlightIndex === index ? 'ring-2 ring-[#7D5A36]/40' : ''
                    ]"
                >
                    <span class="text-xl" aria-hidden="true">{{ option.emoji }}</span>
                    <div class="flex flex-col">
                        <span>{{ option.label }}</span>
                        <span class="text-xs text-[#7D5A36]/70">{{ option.caption }}</span>
                    </div>
                </li>
            </ul>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

interface MoodOption {
    value: string
    label: string
    emoji: string
    caption: string
}

const props = defineProps<{
    modelValue: string
    options: MoodOption[]
    disabled?: boolean
    defaultCaption?: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string]
}>()

const wrapper = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const highlightIndex = ref(-1)
const listboxId = `mood-picker-${Math.random().toString(36).slice(2)}`

const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue))
const selectedIndex = computed(() => props.options.findIndex(option => option.value === props.modelValue))
const activeOptionId = computed(() => highlightIndex.value >= 0 ? optionId(highlightIndex.value) : undefined)
const defaultCaption = computed(() => props.defaultCaption ?? 'Tap to set how the day feels')

const optionId = (index: number) => `${listboxId}-option-${index}`

const openDropdown = () => {
    if (props.disabled) return
    isOpen.value = true
    highlightIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
    nextTick(() => {
        const listNode = document.getElementById(listboxId)
        listNode?.focus({ preventScroll: true })
    })
}

const closeDropdown = () => {
    isOpen.value = false
    highlightIndex.value = selectedIndex.value
}

const toggleDropdown = () => {
    if (isOpen.value) {
        closeDropdown()
    } else {
        openDropdown()
    }
}

const selectOption = (option: MoodOption) => {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    highlightIndex.value = props.options.findIndex(opt => opt.value === option.value)
    closeDropdown()
}

const highlightRelative = (delta: number) => {
    if (!isOpen.value) {
        openDropdown()
        return
    }
    const count = props.options.length
    if (count === 0) return
    const start = highlightIndex.value >= 0 ? highlightIndex.value : 0
    const nextIndex = (start + delta + count) % count
    highlightIndex.value = nextIndex
    ensureVisible(nextIndex)
}

const openAndHighlight = (delta: number) => {
    if (!isOpen.value) {
        openDropdown()
    }
    highlightRelative(delta)
}

const commitCurrentHighlight = () => {
    if (!isOpen.value) {
        openDropdown()
        return
    }
    const option = props.options[highlightIndex.value]
    if (option) {
        selectOption(option)
    }
}

const ensureVisible = (index: number) => {
    nextTick(() => {
        const optionElement = document.getElementById(optionId(index))
        optionElement?.scrollIntoView({ block: 'nearest' })
    })
}

const handleClickOutside = (event: MouseEvent) => {
    if (!wrapper.value) return
    if (!wrapper.value.contains(event.target as Node)) {
        closeDropdown()
    }
}

watch(() => props.modelValue, () => {
    if (!isOpen.value) {
        highlightIndex.value = selectedIndex.value
    }
})

onMounted(() => {
    document.addEventListener('click', handleClickOutside, { capture: true })
    highlightIndex.value = selectedIndex.value
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside, { capture: true })
})
</script>
