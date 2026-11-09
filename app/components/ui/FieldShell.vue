<script setup lang="ts">
import { fieldId } from '~/services/utils/dom'

defineProps<{ path: string; label: string; hint?: string }>()
</script>

<template>
    <div class="field" :data-field="path">
        <label :for="fieldId(path)">{{ label }}</label>
        <slot />
        <div v-if="hint" class="hint">{{ hint }}</div>
    </div>
</template>
