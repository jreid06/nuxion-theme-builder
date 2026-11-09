<script setup lang="ts">
import { KEEP_OPTIONS } from '~/services/brief/content'
import type { DesignRule } from '~/services/brief/model'

const { brief } = storeToRefs(useBriefStore())

const makeRule = (): DesignRule => ({ rule: '', keep: 'token', how: '' })

const COLUMNS = [
    { key: 'rule', label: 'Rule', width: '1.3fr' },
    { key: 'keep', label: 'Kept by', width: '190px', options: KEEP_OPTIONS },
    { key: 'how', label: 'How', width: '1.5fr' },
]
</script>

<template>
    <TextField
        v-model="brief.identity"
        path="identity"
        label="The idea"
        :rows="7"
        hint="Two or three paragraphs: the metaphor, where colour comes from, how depth is made, and the one shape or type tension that makes it recognisable."
    />
    <SectionBlock
        title="Rules"
        note="Choose the strongest way to keep each one. 1 is best: the wrong thing becomes impossible."
    >
        <EditableRows
            path="rules"
            :rows="brief.rules"
            :columns="COLUMNS"
            :make="makeRule"
            add-label="Add rule"
            empty="No rules yet. Start with something the design never does."
        />
    </SectionBlock>
</template>
