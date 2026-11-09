<script setup lang="ts">
import type { RestyledBlock, ThemeBlock } from '~/services/brief/model'
import { pascalCase, themeName } from '~/services/brief/names'
import { SHIPPED_BLOCKS } from '~/services/brief/nuxion'
import { scaffoldBlockCommand } from '~/services/export/renderCommands'
import { rowKey } from '~/services/utils/dom'

const { brief } = storeToRefs(useBriefStore())

const name = computed(() => themeName(brief.value))
const laterCommand = computed(() =>
    scaffoldBlockCommand(`${name.value}.<block>`, name.value)
)

const kinds = computed(() => [
    {
        title: 'Restyle a shipped block',
        description: 'Keep its layout and fields, and change how it looks.',
        rows: [
            ['CHOOSE WHEN', 'The content fits and only the styling differs'],
            ['WORK INVOLVED', 'CSS only'],
            ['YOU GET', 'An empty rule for it in theme.css §5'],
        ] as [string, string][],
    },
    {
        title: 'Build a theme block',
        description: 'A new page-builder block that only this theme has.',
        rows: [
            [
                'CHOOSE WHEN',
                'The design needs a layout or fields nothing shipped offers',
            ],
            ['WORK INVOLVED', 'Schema, Vue component and styles'],
            [
                'YOU GET',
                `One command that creates its files under themes/${name.value}/`,
            ],
        ] as [string, string][],
    },
    {
        title: 'Navigation and footer',
        description: 'The chrome around every page. Always decide these.',
        rows: [
            [
                'CHOOSE WHEN',
                'Restyle the shipped ones unless the structure has to change',
            ],
            ['WORK INVOLVED', 'CSS, or a new component'],
            ['YOU GET', 'A command, only if you pick your own bar or footer'],
        ] as [string, string][],
    },
])

const fieldGuide = computed((): [string, string][] => {
    const example = `${brief.value.name || 'theme'}.pricing`
    return [
        [
            'Block name',
            `Short and lowercase. “pricing” becomes ${example} and ${pascalCase(example)}.vue.`,
        ],
        [
            'Purpose',
            'One line on what the block looks like or does, for whoever builds it.',
        ],
        [
            'Fields beyond the intro',
            'What editors will fill in. Every theme block already has an eyebrow, heading, description and buttons, so don’t list those.',
        ],
        [
            'Green and grey names',
            'Green names also appear in the page’s Markdown version and llms.txt. Grey names work on the page but stay out of those files.',
        ],
        [
            'Holds links or rich text',
            'Tick it if a field holds links, rich text, or a button group not named ctas or buttons. Internal links then resolve properly.',
        ],
        [
            'Full width only',
            'Tick it if the block needs a whole section. It won’t be offered inside grid columns.',
        ],
    ]
})

const RESTYLE_COLUMNS = [
    { key: 'type', label: '_type', mono: true, list: 'shipped-blocks' },
    { key: 'treatment', label: 'Treatment', width: '2fr' },
]
const makeRestyle = (): RestyledBlock => ({ type: '', treatment: '' })
const makeBlock = (): ThemeBlock => ({
    slug: '',
    purpose: '',
    fields: '',
    projection: false,
    fullWidth: false,
})

const chromeThemes = computed(() => [
    { value: '', label: 'Page theme' },
    ...brief.value.themes.map(({ key }) => ({ value: key, label: key })),
])
</script>

<template>
    <SegmentedField
        v-model="brief.blocksOn"
        path="blocksOn"
        label="Plan the theme’s blocks here?"
        :options="[
            { value: false, label: 'Not now' },
            { value: true, label: 'Yes, plan them' },
        ]"
    />
    <template v-if="!brief.blocksOn">
        <div class="none-left">
            Skipped. Your export still sets up the theme with a starter
            {{ name }}.hero block, and nothing else depends on this step.
        </div>
        <div class="field">
            <span class="flabel">When you’re ready, add each block with</span>
            <CommandBlock :command="laterCommand" />
        </div>
    </template>
    <template v-else>
        <datalist id="shipped-blocks">
            <option
                v-for="block in SHIPPED_BLOCKS"
                :key="block"
                :value="block"
            />
        </datalist>
        <KindCards :kinds="kinds" />
        <HowToCard
            title="How to use this step"
            :items="[
                'List each shipped block the design uses, and write one line on how it should change.',
                'For anything a shipped block can’t do, add a theme block and fill in its card.',
                'Choose the navigation and footer at the bottom of this step.',
            ]"
        />
        <SectionBlock
            title="Shipped blocks, restyled"
            note="Pick a block from the list, then describe the change. Any shipped block you leave out keeps the site-wide type, colour and shape."
        >
            <EditableRows
                path="restyled"
                :rows="brief.restyled"
                :columns="RESTYLE_COLUMNS"
                :make="makeRestyle"
                add-label="Add restyle"
                empty="Nothing restyled yet."
            />
        </SectionBlock>
        <SectionBlock
            title="Theme blocks"
            note="One card per new block."
            field="blocks"
        >
            <dl class="guide">
                <template v-for="[term, detail] in fieldGuide" :key="term">
                    <dt>{{ term }}</dt>
                    <dd>{{ detail }}</dd>
                </template>
            </dl>
            <div v-if="!brief.blocks.length" class="empty">
                No theme blocks yet. Most themes start with a hero.
            </div>
            <ThemeBlockCard
                v-for="(block, index) in brief.blocks"
                :key="rowKey(block)"
                :block="block"
                :index="index"
                @remove="brief.blocks.splice(index, 1)"
            />
            <button
                class="btn sm add"
                type="button"
                @click="brief.blocks.push(makeBlock())"
            >
                Add theme block
            </button>
        </SectionBlock>
        <SectionBlock
            title="Navigation and footer"
            note="Choose Shipped to restyle Nuxion’s own, or Theme to build yours. “On Color Theme” fixes its colours, which is useful if the logo needs a set background."
        >
            <div class="grid2">
                <div class="field">
                    <SegmentedField
                        v-model="brief.chrome.nav"
                        path="chrome.nav"
                        label="Navigation"
                        :options="[
                            { value: 'shipped', label: 'Shipped' },
                            { value: 'theme', label: 'Theme bar' },
                        ]"
                    />
                    <SelectField
                        v-model="brief.chrome.navTheme"
                        path="chrome.navTheme"
                        label="On Color Theme"
                        :options="chromeThemes"
                        mono
                    />
                    <TextField
                        v-model="brief.chrome.navNote"
                        path="chrome.navNote"
                        label="Notes"
                    />
                </div>
                <div class="field">
                    <SegmentedField
                        v-model="brief.chrome.footer"
                        path="chrome.footer"
                        label="Footer"
                        :options="[
                            { value: 'shipped', label: 'Shipped' },
                            { value: 'theme', label: 'Theme footer' },
                        ]"
                    />
                    <SelectField
                        v-model="brief.chrome.footerTheme"
                        path="chrome.footerTheme"
                        label="On Color Theme"
                        :options="chromeThemes"
                        mono
                    />
                    <TextField
                        v-model="brief.chrome.footerNote"
                        path="chrome.footerNote"
                        label="Notes"
                    />
                </div>
            </div>
            <TextField
                v-model="brief.chrome.safari"
                path="chrome.safari"
                label="Mobile Safari tint"
                hint="Top-pinned chrome hijacks the iOS status-bar colour unless it carries the touch-device rule."
            />
        </SectionBlock>
    </template>
</template>
