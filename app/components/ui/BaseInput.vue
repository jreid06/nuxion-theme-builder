<script setup lang="ts">
import { fieldId } from '~/services/utils/dom'

const model = defineModel<string>()
const props = defineProps<{
    path: string
    mono?: boolean
    /** Set to render a textarea with this many rows. */
    rows?: number
    placeholder?: string
    ariaLabel?: string
    list?: string
}>()

const state = useFieldState(() => props.path)
</script>

<template>
    <textarea
        v-if="rows"
        :id="fieldId(path)"
        v-model="model"
        :rows="rows"
        :class="[{ mono }, state]"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
    ></textarea>
    <input
        v-else
        :id="fieldId(path)"
        v-model="model"
        type="text"
        :class="[{ mono }, state]"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        :list="list"
        :spellcheck="mono ? false : undefined"
    />
</template>
