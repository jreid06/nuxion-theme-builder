<script setup lang="ts" generic="T extends string | number | boolean">
import { fieldId } from '~/services/utils/dom'

const model = defineModel<T>()
defineProps<{
    path: string
    label?: string
    hint?: string
    options: { value: T; label: string; disabled?: boolean }[]
}>()
</script>

<template>
    <div class="field" :data-field="path">
        <span v-if="label" :id="`${fieldId(path)}-l`" class="flabel">
            {{ label }}
        </span>
        <div
            class="seg"
            role="radiogroup"
            :aria-labelledby="label ? `${fieldId(path)}-l` : undefined"
            :aria-label="label ? undefined : path"
        >
            <label
                v-for="option in options"
                :key="String(option.value)"
                :class="{ on: model === option.value, off: option.disabled }"
            >
                <input
                    :id="`${fieldId(path)}-${String(option.value)}`"
                    type="radio"
                    :name="fieldId(path)"
                    :checked="model === option.value"
                    :disabled="option.disabled"
                    @change="model = option.value"
                />
                {{ option.label }}
            </label>
        </div>
        <div v-if="hint" class="hint">{{ hint }}</div>
    </div>
</template>
