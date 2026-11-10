<script setup lang="ts">
import { rankForDirection } from '~/services/inspire/direction'
import {
    applyScale,
    buildScale,
    describeScale,
    slotOf,
    TYPE_SCALE_PRESETS,
    type TypeScalePreset,
} from '~/services/inspire/typeScales'
import { typeStyle } from '~/services/preview/styles'

const store = useBriefStore()

const presets = computed(() =>
    rankForDirection(TYPE_SCALE_PRESETS, store.brief).map((ranked) => {
        const rows = buildScale(ranked.item.spec)
        const display = rows[0]!
        const body = rows.find((row) => slotOf(row.cls) === 'body')!
        return {
            ...ranked,
            summary: describeScale(rows),
            heading: {
                ...typeStyle(store.brief, display, false),
                fontSize: `min(${display.desktop} * 0.5, 40px)`,
            },
            body: typeStyle(store.brief, body, false),
        }
    })
)

const use = (preset: TypeScalePreset) =>
    store.change(`Type scale: ${preset.name}`, (brief) =>
        applyScale(brief, buildScale(preset.spec))
    )
</script>

<template>
    <SectionBlock
        title="Start from a type scale"
        note="Each one fills the mobile and desktop size, line height, tracking and weight of every row, in one go. Your fonts and class names stay, and you can edit any cell afterwards."
    >
        <div class="pals">
            <div
                v-for="{ item, suits, summary, heading, body } in presets"
                :key="item.name"
                class="pal-c"
            >
                <div class="ts-sample" aria-hidden="true">
                    <div :style="heading">Aa Heading</div>
                    <div :style="body">Body text reads at this size.</div>
                </div>
                <b>{{ item.name }}</b>
                <span class="n2">{{ item.note }}</span>
                <code class="n2">{{ summary }}</code>
                <span v-if="suits" class="tag ok">Suits your direction</span>
                <button
                    class="btn sm add"
                    type="button"
                    :aria-label="`Use type scale ${item.name}`"
                    @click="use(item)"
                >
                    Use this scale
                </button>
            </div>
        </div>
    </SectionBlock>
</template>
