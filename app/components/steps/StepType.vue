<script setup lang="ts">
import { headlineLines } from '~/services/brief/checks/typography'
import { typeRow, type TypeRow } from '~/services/brief/model'
import { typeClass } from '~/services/brief/names'
import { PHONE_WIDTH } from '~/services/preview/sitePreview'
import { typeStyle } from '~/services/preview/styles'
import { canvasTextMeasure, rowKey } from '~/services/utils/dom'

const store = useBriefStore()
const { brief } = storeToRefs(store)

const COLUMNS = [
    { key: 'cls', label: 'Class', width: '1.5fr', mono: true },
    { key: 'role', label: 'Role' },
    { key: 'mobile', label: 'Mobile', width: '.9fr', mono: true },
    { key: 'desktop', label: 'Desktop', width: '.9fr', mono: true },
    { key: 'lh', label: 'Line ht', width: '.7fr', mono: true },
    { key: 'tracking', label: 'Track', width: '.9fr', mono: true },
    { key: 'weight', label: 'Wt', width: '.6fr', mono: true },
]

const specimens = computed(() =>
    brief.value.scale.filter((row) => row.desktop || row.mobile)
)

const atPhone = computed(() => store.previewWidth === PHONE_WIDTH)

const specimenText = (row: TypeRow) => {
    if (/eyebrow|label/.test(row.cls)) return 'SIGNAL BOARD'
    if (/paragraph/.test(row.cls)) return 'Body copy sits at this size.'
    return `${brief.value.title || 'Heading'} specimen`
}

const lines = computed(() => {
    void store.fontVersion
    return headlineLines(brief.value, canvasTextMeasure)
})

const headlineStyle = computed(() => {
    const row = brief.value.scale[0]
    return row ? typeStyle(brief.value, row, true) : undefined
})
</script>

<template>
    <div class="grid2">
        <FontPicker role-key="heading" title="Heading" />
        <FontPicker role-key="body" title="Body" />
        <FontPicker role-key="code" title="Code and labels" />
    </div>
    <SectionBlock
        title="Type scale"
        note="Delete rows you don’t need. Heading weight is one token, taken from the first row. {px} becomes your CSS prefix."
    >
        <EditableRows
            path="scale"
            :rows="brief.scale"
            :columns="COLUMNS"
            :make="() => typeRow('')"
            add-label="Add row"
        />
    </SectionBlock>
    <SectionBlock title="Specimen">
        <div class="spec">
            <div v-for="row in specimens" :key="rowKey(row)" class="spec-row">
                <code
                    >{{ typeClass(brief, row) }}<br />{{
                        row.desktop || row.mobile
                    }}</code
                >
                <div
                    class="break-words"
                    :style="typeStyle(brief, row, atPhone)"
                >
                    {{ specimenText(row) }}
                </div>
            </div>
        </div>
    </SectionBlock>
    <SectionBlock
        title="Headline fit at 375px"
        note="If the reference gives one desktop size only, pick the mobile size so the longest headline fits in three lines."
    >
        <TextField
            v-model="brief.headline"
            path="headline"
            label="Longest headline"
        />
        <div class="fit">
            <div class="fit-box">
                <div :style="headlineStyle">
                    {{ brief.headline || 'Your longest headline' }}
                </div>
            </div>
            <div>
                <span v-if="lines === null" class="tag">
                    Set a heading font and a mobile size
                </span>
                <span v-else class="tag" :class="lines > 3 ? 'bad' : 'ok'">
                    {{ lines }} line{{ lines > 1 ? 's' : '' }} at 343px
                </span>
            </div>
        </div>
    </SectionBlock>
</template>
