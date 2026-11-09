<script setup lang="ts">
import { ORIGINALITY_CHECKS } from '~/services/brief/content'
import type { Feature } from '~/services/brief/model'

const { brief } = storeToRefs(useBriefStore())

const makeFeature = (): Feature => ({ text: '', kind: '', ref: '' })

const COLUMNS = [
    { key: 'text', label: 'Feature', width: '2fr' },
    {
        key: 'kind',
        label: 'Type',
        width: '130px',
        options: [
            { value: '', label: 'Choose…' },
            { value: 'block', label: 'Theme block' },
            { value: 'art', label: 'Art primitive' },
            { value: 'site', label: 'Site-wide' },
        ],
    },
    { key: 'ref', label: 'Delivered by', width: '1.4fr', mono: true },
]

const CHECKS = ORIGINALITY_CHECKS.map((check, index) => ({
    index,
    text: check.text,
    shown: !('demoOnly' in check),
})).filter((check) => check.shown)
</script>

<template>
    <TextField
        v-model="brief.positioning"
        path="positioning"
        label="Positioning"
        :rows="2"
        hint="Who builds what with it."
    />
    <TextField
        v-model="brief.audience"
        path="audience"
        label="Audience"
        :rows="2"
        hint="Who will build sites with it, and how well they know the stack."
    />
    <SectionBlock
        title="Signature features"
        note="Three to five. Each has to be a theme block, an art primitive or a site-wide treatment."
    >
        <EditableRows
            path="features"
            :rows="brief.features"
            :columns="COLUMNS"
            :make="makeFeature"
            add-label="Add feature"
            empty="No features yet. What would someone recognise this theme by?"
        />
    </SectionBlock>
    <TextField
        v-model="brief.refs"
        path="refs"
        label="Reference brands"
        :rows="2"
        hint="For orientation only. Never have one open while drawing."
    />
    <SectionBlock
        title="Originality"
        note="A theme ships on real sites, so it has to be its own thing."
        field="originality"
    >
        <CheckRow
            v-for="check in CHECKS"
            :id="`orig-${check.index}`"
            :key="check.index"
            v-model="brief.originality[check.index]"
            :label="check.text"
        />
    </SectionBlock>
</template>
