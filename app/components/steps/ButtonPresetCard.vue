<script setup lang="ts">
import type { ButtonPreset } from '~/services/brief/model'
import { schemesOf, themeColors } from '~/services/brief/resolve'
import { buttonStyle } from '~/services/preview/styles'

const props = defineProps<{ preset: ButtonPreset; index: number }>()
defineEmits<{ remove: [] }>()

const { brief } = storeToRefs(useBriefStore())

const STYLE_OPTIONS = [
    { value: 'button', label: 'Filled' },
    { value: 'outline', label: 'Outline' },
    { value: 'default', label: 'Text link' },
]
const SHAPE_OPTIONS = [
    { value: 'default', label: 'Square' },
    { value: 'rounded-soft', label: 'Slightly rounded' },
    { value: 'rounded', label: 'Fully rounded' },
]
const SOURCE_OPTIONS = [
    { value: 'seed', label: 'From one colour' },
    { value: 'manual', label: 'Manual' },
    { value: 'inherit', label: 'Inherit page theme' },
]

const swatchOptions = computed(() => [
    { value: '', label: 'Auto / none' },
    ...brief.value.swatches.map((swatch) => ({
        value: swatch.id,
        label: swatch.name || swatch.slug,
    })),
])

const samples = computed(() =>
    schemesOf(brief.value).flatMap((scheme) => {
        const theme = brief.value.themes[0]
        if (!theme) return []
        const colors = themeColors(brief.value, theme, scheme)
        return [
            {
                scheme,
                background: colors.bg,
                style: buttonStyle(brief.value, props.preset, colors, scheme),
            },
        ]
    })
)

const schemeLabel = (scheme: string) => (scheme === 'dark' ? 'Dark' : 'Light')
const path = (field: string) => `buttons.${props.index}.${field}`
</script>

<template>
    <div class="btn-card" :data-field="`buttons.${index}`">
        <div class="btn-show">
            <div
                v-for="sample in samples"
                :key="sample.scheme"
                :style="{ background: sample.background || undefined }"
            >
                <span class="pv-b" :style="sample.style">
                    {{ preset.name || 'Button' }}
                </span>
            </div>
        </div>
        <div class="grid2">
            <TextField
                v-model="preset.name"
                :path="path('name')"
                label="Preset"
            />
            <SelectField
                v-model="preset.style"
                :path="path('style')"
                label="Style"
                :options="STYLE_OPTIONS"
            />
            <SelectField
                v-model="preset.shape"
                :path="path('shape')"
                label="Shape"
                :options="SHAPE_OPTIONS"
            />
            <SelectField
                v-model="preset.source"
                :path="path('source')"
                label="Colour source"
                :options="SOURCE_OPTIONS"
            />
        </div>
        <div v-if="preset.source !== 'inherit'" class="grid2">
            <template v-for="sample in samples" :key="sample.scheme">
                <SelectField
                    v-model="preset[sample.scheme].fill"
                    :path="path(`${sample.scheme}.fill`)"
                    :label="`${schemeLabel(sample.scheme)}: ${preset.source === 'seed' ? 'seed' : 'fill'}`"
                    :options="swatchOptions"
                />
                <SelectField
                    v-if="preset.source === 'manual'"
                    v-model="preset[sample.scheme].text"
                    :path="path(`${sample.scheme}.text`)"
                    :label="`${schemeLabel(sample.scheme)}: label`"
                    :options="swatchOptions"
                />
            </template>
        </div>
        <div class="flex items-end gap-2">
            <div class="flex-1">
                <TextField
                    v-model="preset.use"
                    :path="path('use')"
                    label="Use"
                />
            </div>
            <button class="btn sm ghost" type="button" @click="$emit('remove')">
                Remove
            </button>
        </div>
    </div>
</template>
