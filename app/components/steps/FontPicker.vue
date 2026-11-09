<script setup lang="ts">
import type { FontRole } from '~/services/brief/model'
import { fontStack } from '~/services/brief/names'
import { catalogFont, FONT_CATALOG } from '~/services/brief/nuxion'
import { fieldId } from '~/services/utils/dom'

const props = defineProps<{ roleKey: FontRole; title: string }>()

const { brief } = storeToRefs(useBriefStore())
const { loadFont } = useFontLoader()
const OTHER = '__other'

const font = computed(() => brief.value.fonts[props.roleKey])
const path = computed(() => `fonts.${props.roleKey}`)
const state = useFieldState(path)
const isCustom = computed(
    () => Boolean(font.value.family) && !catalogFont(font.value.family)
)
const choices = computed(() =>
    FONT_CATALOG.filter(
        ({ fallback }) => props.roleKey !== 'code' || fallback === 'monospace'
    )
)

const pick = (event: Event) => {
    const family = (event.target as HTMLSelectElement).value
    if (family === OTHER) {
        font.value.family = 'New Font'
        font.value.licence = ''
        font.value.fallback =
            props.roleKey === 'code' ? 'monospace' : 'sans-serif'
        return
    }
    font.value.family = family
    const known = catalogFont(family)
    if (known) {
        font.value.fallback = known.fallback
        font.value.licence = known.licence
    }
}

const commitCustomName = (event: Event) => {
    font.value.family = (event.target as HTMLInputElement).value
    loadFont(font.value.family)
}
</script>

<template>
    <div class="bc" :data-field="path">
        <div class="field">
            <label :for="fieldId(path)">{{ title }}</label>
            <select
                :id="fieldId(path)"
                :class="state"
                :value="isCustom ? OTHER : font.family"
                @change="pick"
            >
                <option value="">Choose…</option>
                <option
                    v-for="choice in choices"
                    :key="choice.name"
                    :value="choice.name"
                >
                    {{ choice.name }}
                </option>
                <option :value="OTHER">Other…</option>
            </select>
        </div>
        <div v-if="isCustom" class="field">
            <label :for="`${fieldId(path)}-n`">Family name</label>
            <input
                :id="`${fieldId(path)}-n`"
                type="text"
                :value="font.family"
                @change="commitCustomName"
            />
        </div>
        <div
            v-if="font.family"
            class="text-xl leading-tight break-words"
            :style="{ fontFamily: fontStack(font) }"
        >
            {{ font.family }}
        </div>
        <div v-if="isCustom" class="grid2">
            <TextField
                v-model="font.licence"
                :path="`${path}.licence`"
                label="Licence"
                placeholder="OFL 1.1"
            />
            <TextField
                v-model="font.fallback"
                :path="`${path}.fallback`"
                label="Fallback"
                mono
            />
        </div>
        <div v-else-if="font.family" class="chips">
            <span class="tag ok">{{ font.licence }}</span>
            <span class="tag">in fonts.js</span>
        </div>
        <TextField
            v-model="font.weights"
            :path="`${path}.weights`"
            label="Weights"
            mono
            placeholder="400–600"
        />
    </div>
</template>
