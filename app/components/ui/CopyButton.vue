<script setup lang="ts">
const props = defineProps<{ text: string; label?: string; primary?: boolean }>()

const state = ref<'idle' | 'copied' | 'failed'>('idle')
let reset: ReturnType<typeof setTimeout> | undefined

const copy = async () => {
    try {
        await navigator.clipboard.writeText(props.text)
        state.value = 'copied'
    } catch {
        state.value = 'failed'
    }
    clearTimeout(reset)
    reset = setTimeout(() => (state.value = 'idle'), 1600)
}

onBeforeUnmount(() => clearTimeout(reset))
</script>

<template>
    <button
        class="btn sm"
        :class="{ pri: primary }"
        type="button"
        @click="copy"
    >
        {{
            state === 'copied'
                ? 'Copied'
                : state === 'failed'
                  ? 'Copy failed'
                  : (label ?? 'Copy')
        }}
    </button>
</template>
