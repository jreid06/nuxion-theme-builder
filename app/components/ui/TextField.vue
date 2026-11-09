<script setup lang="ts">
const model = defineModel<string>()
defineProps<{
    path: string
    label: string
    hint?: string
    mono?: boolean
    rows?: number
    placeholder?: string
}>()
</script>

<template>
    <FieldShell :path="path" :label="label" :hint="hint">
        <BaseInput
            v-model="model"
            :path="path"
            :mono="mono"
            :rows="rows"
            :placeholder="placeholder"
        />
    </FieldShell>
</template>
