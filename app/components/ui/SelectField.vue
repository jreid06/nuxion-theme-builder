<script setup lang="ts">
import type { SelectOption } from './BaseSelect.vue'

const model = defineModel<string>()
defineProps<{
    path: string
    label: string
    options: SelectOption[]
    hint?: string
    mono?: boolean
}>()
</script>

<template>
    <FieldShell :path="path" :label="label" :hint="hint">
        <BaseSelect
            v-model="model"
            :path="path"
            :options="options"
            :mono="mono"
        />
    </FieldShell>
</template>
