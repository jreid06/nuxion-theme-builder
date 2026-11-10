<script setup lang="ts">
import type { Ranked } from '~/services/inspire/direction'
import type { Choice } from '~/services/inspire/fieldGuides'

/** `selected` makes the chips toggles: one text, or a list for several. */
const props = defineProps<{
    choices: Ranked<Choice>[]
    selected?: string | string[]
}>()
defineEmits<{ pick: [text: string] }>()

const isOn = (text: string) =>
    Array.isArray(props.selected)
        ? props.selected.includes(text)
        : props.selected === text
</script>

<template>
    <div class="ichips">
        <button
            v-for="{ item, suits } in choices"
            :key="item.text"
            type="button"
            class="ichip"
            :class="{ on: isOn(item.text), suits }"
            :aria-pressed="selected === undefined ? undefined : isOn(item.text)"
            :title="suits ? 'Suits your direction' : undefined"
            @click="$emit('pick', item.text)"
        >
            {{ item.text }}
        </button>
        <slot />
    </div>
</template>
