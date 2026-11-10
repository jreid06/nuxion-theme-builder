<script setup lang="ts">
import { isHex } from '~/services/brief/colour'
import type {
    ArtAsset,
    ArtElement,
    ArtPrimitive,
    ImageryPolicy,
} from '~/services/brief/model'

const { brief } = storeToRefs(useBriefStore())
const art = computed(() => brief.value.art)
const px = computed(() => brief.value.px || '??')
const name = computed(() => brief.value.name || '<name>')

const POLICY_HINTS: Record<ImageryPolicy, string | undefined> = {
    '': undefined,
    photography:
        'You will need photos you own or have licensed. Patterns and elements become optional accents.',
    illustration:
        'Illustrations are image files, so most of your rows go under Generated assets.',
    'generated abstract':
        'The art is drawn from your palette. CSS and Vue art follows a recolour by itself, and image files need redrawing.',
    'product UI':
        'The art is mock screens of a product. Build these as Vue elements so they follow the theme.',
    none: 'Type and colour carry the design. You can leave the lists below empty, apart from the logo and favicon.',
}

const POLICIES: { value: ImageryPolicy; label: string }[] = [
    { value: 'photography', label: 'Photography' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'generated abstract', label: 'Generated' },
    { value: 'product UI', label: 'Product UI' },
    { value: 'none', label: 'None' },
]

const kinds = computed(() => [
    {
        title: 'CSS primitive',
        description: 'A reusable class that draws a pattern with CSS alone.',
        rows: [
            ['USE IT FOR', 'Stripes, grids, ruled lines, flat shapes'],
            ['LIVES IN', `themes/${name.value}/app/theme.css §3`],
            [
                'YOU GET',
                `An empty .${px.value}-… rule for each row, ready to write`,
            ],
        ] as [string, string][],
    },
    {
        title: 'Vue element',
        description: 'A decorative component, for art CSS can’t draw.',
        rows: [
            ['USE IT FOR', 'SVG scenes, animated panels, mock widgets'],
            ['LIVES IN', `themes/${name.value}/app/elements/`],
            ['YOU GET', 'A line in BRIEF.md. You build the component'],
        ] as [string, string][],
    },
    {
        title: 'Image file',
        description: 'A finished picture, uploaded to Sanity.',
        rows: [
            ['USE IT FOR', 'Logo, favicon, social image, blog covers, avatars'],
            ['LIVES IN', 'Sanity'],
            ['YOU GET', 'A checklist in BRIEF.md. You make the files'],
        ] as [string, string][],
    },
])

const thumbColours = computed(() => {
    const valid = brief.value.swatches.filter((swatch) => isHex(swatch.hex))
    const art = valid.filter((swatch) => /art|accent/.test(swatch.slug))
    return [
        (art[0] ?? valid[0])?.hex ?? 'var(--accent)',
        (art[1] ?? valid[1])?.hex ?? 'var(--line)',
    ] as const
})

const makePrimitive = (): ArtPrimitive => ({
    cls: '',
    draws: '',
    variants: '',
    motion: 'none',
})
const makeElement = (): ArtElement => ({ name: '', draws: '', used: '' })
const makeAsset = (): ArtAsset => ({ name: '', count: '', size: '', notes: '' })

const PRIMITIVE_COLUMNS = [
    { key: 'cls', label: 'Class', width: '.8fr' },
    { key: 'draws', label: 'What it draws', width: '1.6fr' },
    { key: 'variants', label: 'Variants', mono: true },
    { key: 'motion', label: 'Motion', width: '.5fr' },
]
const ELEMENT_COLUMNS = [
    { key: 'name', label: 'Component', mono: true },
    { key: 'draws', label: 'What it draws', width: '1.6fr' },
    { key: 'used', label: 'Used in', width: '.8fr' },
]
const ASSET_COLUMNS = [
    { key: 'name', label: 'Asset', width: '1.3fr' },
    { key: 'count', label: 'Count', width: '.4fr', mono: true },
    { key: 'size', label: 'Size', width: '.6fr', mono: true },
    { key: 'notes', label: 'Notes', width: '1.4fr' },
]
</script>

<template>
    <KindCards :kinds="kinds">
        <template #thumb="{ index }">
            <div
                v-if="index === 0"
                class="thumb"
                aria-hidden="true"
                :style="{
                    background: `repeating-linear-gradient(90deg, ${thumbColours[0]} 0 14px, ${thumbColours[1]} 14px 28px)`,
                }"
            ></div>
            <div v-else-if="index === 1" class="thumb" aria-hidden="true">
                <svg viewBox="0 0 120 64" width="100%" height="100%">
                    <line
                        x1="44"
                        y1="6"
                        x2="44"
                        y2="60"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <polygon
                        points="44,8 92,19 44,30"
                        :fill="thumbColours[0]"
                    />
                    <polygon
                        points="44,33 76,41 44,49"
                        :fill="thumbColours[1]"
                    />
                </svg>
            </div>
            <div v-else class="thumb" aria-hidden="true">1200×630</div>
        </template>
    </KindCards>
    <HowToCard
        title="How to use this step"
        :items="[
            'Pick the imagery policy: the kind of pictures this theme uses.',
            'Add one row for each pattern or graphic the design repeats, in the list that matches its kind.',
            'Under Generated assets, say how many of each image the theme needs.',
        ]"
        after="Each row is a plan. The wizard doesn’t draw anything for you."
    />
    <SegmentedField
        v-model="art.policy"
        path="art.policy"
        label="Imagery policy"
        :options="POLICIES"
        :hint="POLICY_HINTS[art.policy]"
    />
    <TextField
        v-model="art.note"
        path="art.note"
        label="Describe it in one sentence"
        :rows="2"
        hint="This goes straight into the brief."
    />
    <AssistBar v-model="art.note" field="artNote" label="Imagery note" />
    <SectionBlock
        title="CSS primitives"
        :note="`One row per pattern. Colour it with the generated variables, such as --${px}-art-1, so a recolour reaches it. Any motion must stop under prefers-reduced-motion.`"
    >
        <EditableRows
            path="art.primitives"
            :rows="art.primitives"
            :columns="PRIMITIVE_COLUMNS"
            :make="makePrimitive"
            add-label="Add primitive"
            empty="None yet."
        >
            <template #cell-cls="{ row, path }">
                <div class="pfx">
                    <span>.{{ px }}-</span>
                    <BaseInput
                        v-model="row.cls"
                        :path="path"
                        mono
                        aria-label="Class"
                    />
                </div>
            </template>
        </EditableRows>
    </SectionBlock>
    <SectionBlock
        title="Vue elements"
        note="One row per decorative component. “Used in” says which blocks show it."
    >
        <EditableRows
            path="art.elements"
            :rows="art.elements"
            :columns="ELEMENT_COLUMNS"
            :make="makeElement"
            add-label="Add element"
            empty="None yet."
        />
    </SectionBlock>
    <SectionBlock
        title="Generated assets"
        note="The image files the theme needs. Draw them from the palette where you can, so a rebrand is a redraw."
    >
        <EditableRows
            path="art.assets"
            :rows="art.assets"
            :columns="ASSET_COLUMNS"
            :make="makeAsset"
            add-label="Add asset"
        />
    </SectionBlock>
</template>
