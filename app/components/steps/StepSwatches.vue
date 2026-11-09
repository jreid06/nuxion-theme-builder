<script setup lang="ts">
import { isHex } from '~/services/brief/colour'
import type { Swatch } from '~/services/brief/model'
import { fieldId } from '~/services/utils/dom'

const { brief } = storeToRefs(useBriefStore())

const makeSwatch = (): Swatch => ({
    id: `swatch-${Date.now()}-${brief.value.swatches.length}`,
    name: '',
    hex: '#888888',
    slug: '',
    role: '',
    readBy: '',
})

const COLUMNS = [
    { key: 'hex', label: 'Colour', width: '116px' },
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'role', label: 'Role' },
    { key: 'readBy', label: 'Read by', width: '1.1fr' },
]

const pickerValue = (hex: string) =>
    isHex(hex) ? hex.toLowerCase() : '#000000'

const setHex = (row: Swatch, event: Event) => {
    row.hex = (event.target as HTMLInputElement).value.toUpperCase()
}
</script>

<template>
    <EditableRows
        path="swatches"
        :rows="brief.swatches"
        :columns="COLUMNS"
        :make="makeSwatch"
        add-label="Add swatch"
        empty="No swatches yet. Add your ground, text and accent colours first."
    >
        <template #cell-hex="{ row, path }">
            <div class="hexcell">
                <input
                    :id="`${fieldId(path)}-c`"
                    type="color"
                    :aria-label="`${row.name || 'Swatch'} colour`"
                    :value="pickerValue(row.hex)"
                    @input="setHex(row, $event)"
                />
                <BaseInput
                    v-model="row.hex"
                    :path="path"
                    mono
                    aria-label="Hex"
                />
            </div>
        </template>
        <template #cell-slug="{ row, path }">
            <div class="pfx">
                <span>{{ brief.px || '??' }}-</span>
                <BaseInput
                    v-model="row.slug"
                    :path="path"
                    mono
                    aria-label="Slug"
                />
            </div>
        </template>
    </EditableRows>
    <SectionBlock
        title="Contrast"
        note="Filled cells are pairs your Color Themes actually use. Body text needs 4.5:1. Accents, large text and UI need 3:1."
    >
        <ContrastMatrix />
    </SectionBlock>
    <TextField
        v-model="brief.gradients"
        path="gradients"
        label="Gradients and effects"
        :rows="2"
        hint="A named gradient is a swatch. Scanlines, grain and glow are art primitives, in the Art step."
    />
</template>
