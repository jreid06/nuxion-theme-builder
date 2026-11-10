<script setup lang="ts">
import type { RestyledBlock } from '~/services/brief/model'
import { rankForDirection } from '~/services/inspire/direction'
import {
    ANY_BLOCK_TREATMENTS,
    BLOCK_TREATMENTS,
    knownTreatments,
    splitTreatment,
    togglePick,
    withCustom,
} from '~/services/inspire/treatments'

const props = defineProps<{ block: RestyledBlock; index: number }>()
defineEmits<{ remove: [] }>()

const { brief } = storeToRefs(useBriefStore())

const path = (field: string) => `restyled.${props.index}.${field}`
const known = computed(() => knownTreatments(props.block.type))
const parts = computed(() => splitTreatment(props.block.treatment, known.value))
const own = computed(() =>
    rankForDirection(
        BLOCK_TREATMENTS[props.block.type.trim()] ?? [],
        brief.value
    )
)
const general = computed(() =>
    rankForDirection(ANY_BLOCK_TREATMENTS, brief.value)
)

/** Kept as typed here, so a space or semicolon isn't lost mid-word. */
const custom = ref(parts.value.custom)
const customOpen = ref(Boolean(custom.value))
watch(
    () => props.block.type,
    () => {
        custom.value = parts.value.custom
        customOpen.value ||= Boolean(custom.value)
    }
)

const pick = (option: string) => {
    props.block.treatment = togglePick(
        props.block.treatment,
        option,
        known.value
    )
}

const writeCustom = (value: string) => {
    custom.value = value
    props.block.treatment = withCustom(
        props.block.treatment,
        value,
        known.value
    )
}

const toggleCustom = () => {
    customOpen.value = !customOpen.value
    props.block.treatment = withCustom(
        props.block.treatment,
        customOpen.value ? custom.value : '',
        known.value
    )
}
</script>

<template>
    <div class="bc" :data-field="`restyled.${index}`">
        <div class="bc-head">
            <FieldShell :path="path('type')" label="Shipped block">
                <BaseInput
                    v-model="block.type"
                    :path="path('type')"
                    mono
                    list="shipped-blocks"
                    placeholder="Pick or type a _type"
                />
            </FieldShell>
            <button
                class="x"
                type="button"
                aria-label="Remove restyle"
                @click="$emit('remove')"
            >
                ×
            </button>
        </div>
        <template v-if="block.type.trim()">
            <div v-if="own.length" class="field">
                <span class="idea-title">For {{ block.type }}</span>
                <ChoiceChips
                    :choices="own"
                    :selected="parts.picks"
                    @pick="pick"
                />
            </div>
            <div class="field">
                <span class="idea-title">Any block</span>
                <ChoiceChips
                    :choices="general"
                    :selected="parts.picks"
                    @pick="pick"
                >
                    <button
                        type="button"
                        class="ichip"
                        :class="{ on: customOpen }"
                        :aria-pressed="customOpen"
                        @click="toggleCustom"
                    >
                        Custom…
                    </button>
                </ChoiceChips>
            </div>
            <FieldShell
                v-if="customOpen"
                :path="path('treatment')"
                label="In your own words"
            >
                <BaseInput
                    :model-value="custom"
                    :path="path('treatment')"
                    placeholder="e.g. questions set like a ship’s log, each with a date"
                    @update:model-value="writeCustom($event ?? '')"
                />
            </FieldShell>
            <div class="hint">
                <b>In the brief:</b>
                {{ block.treatment || 'Pick at least one change above.' }}
            </div>
        </template>
        <div v-else class="hint">
            Pick the shipped block first to see ways to change it.
        </div>
    </div>
</template>
