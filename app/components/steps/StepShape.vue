<script setup lang="ts">
import {
    activeCornerPreset,
    CORNER_PRESETS,
    CORNERS,
    MEASURES,
    measureToken,
    SPACING,
} from '~/services/brief/layout'

const { brief } = storeToRefs(useBriefStore())
const layout = computed(() => brief.value.layout)

const activePreset = computed(() => activeCornerPreset(brief.value))

const applyPreset = (name?: string) => {
    const preset = name ? CORNER_PRESETS[name] : undefined
    if (preset) Object.assign(layout.value.radius, preset)
}

const CORNER_STYLES = [
    { value: 'default', label: 'Nuxion default' },
    { value: 'sharp', label: 'Sharp' },
    { value: 'soft', label: 'Soft' },
    { value: 'round', label: 'Round' },
]

const DEPTH_HINTS = {
    shadows: 'Hero images keep Nuxion’s drop shadow.',
    flat: 'Hero images lose their drop shadow. Separate things with colour or lines instead.',
}

const spacingHint = computed(() => {
    const [phone, tablet, desktop] = SPACING[layout.value.spacing]
    return `${phone} on phones, ${tablet} on tablets and ${desktop} on desktops. Two sections next to each other get double this gap.`
})
</script>

<template>
    <SectionBlock
        title="Page width"
        note="The widest your navigation, sections and footer can go."
    >
        <div class="narrow-f">
            <TextField
                v-model="layout.width"
                path="layout.width"
                label="Maximum width"
                mono
                placeholder="88rem"
                hint="Leave empty to keep Nuxion’s 88rem."
            />
        </div>
    </SectionBlock>
    <SectionBlock
        title="Corners"
        note="Pick a style for all four, then adjust any one of them."
    >
        <SegmentedField
            :model-value="activePreset"
            path="corners.preset"
            label="Corner style"
            :options="CORNER_STYLES"
            :hint="activePreset ? undefined : 'Using your own values.'"
            @update:model-value="applyPreset"
        />
        <div class="corners-wrap">
            <div class="corners">
                <div v-for="corner in CORNERS" :key="corner.key" class="corner">
                    <div
                        class="corner-demo"
                        aria-hidden="true"
                        :style="{
                            borderRadius:
                                layout.radius[corner.key] || corner.shipped,
                        }"
                    ></div>
                    <TextField
                        v-model="layout.radius[corner.key]"
                        :path="`layout.radius.${corner.key}`"
                        :label="corner.title"
                        mono
                        :placeholder="corner.shipped"
                        :hint="corner.used"
                    />
                </div>
            </div>
        </div>
    </SectionBlock>
    <SectionBlock
        title="Depth"
        note="How something looks when it sits above the page."
    >
        <SegmentedField
            v-model="layout.depth"
            path="layout.depth"
            label="Depth style"
            :hint="DEPTH_HINTS[layout.depth]"
            :options="[
                { value: 'shadows', label: 'Shadows' },
                { value: 'flat', label: 'Flat' },
            ]"
        />
    </SectionBlock>
    <SectionBlock
        title="Section spacing"
        note="The space above and below each section."
    >
        <SegmentedField
            v-model="layout.spacing"
            path="layout.spacing"
            label="Spacing"
            :hint="spacingHint"
            :options="[
                { value: 'compact', label: 'Compact' },
                { value: 'default', label: 'Default' },
                { value: 'spacious', label: 'Spacious' },
            ]"
        />
    </SectionBlock>
    <details class="adv">
        <summary>Advanced: text line lengths</summary>
        <p class="hint">
            How wide blocks of text can get. Most themes leave these alone.
        </p>
        <div class="grid2">
            <TextField
                v-for="measure in MEASURES"
                :key="measure.key"
                v-model="layout.measure[measure.key]"
                :path="`layout.measure.${measure.key}`"
                :label="measureToken(measure.key)"
                mono
                :placeholder="measure.shipped"
                :hint="measure.use"
            />
        </div>
    </details>
</template>
