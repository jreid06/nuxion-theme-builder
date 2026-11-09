<script setup lang="ts">
import { fieldId } from '~/services/utils/dom'

export interface SelectOption {
    value: string
    label: string
}

const model = defineModel<string>()
const props = defineProps<{
    path: string
    options: SelectOption[]
    mono?: boolean
    ariaLabel?: string
}>()

const state = useFieldState(() => props.path)
</script>

<template>
    <select
        :id="fieldId(path)"
        v-model="model"
        :class="[{ mono }, state]"
        :aria-label="ariaLabel"
    >
        <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
        >
            {{ option.label }}
        </option>
    </select>
</template>
