<script setup lang="ts">
import { generatePalette, type GeneratedPalette } from '~/services/ai/palette'
import { rankForDirection } from '~/services/inspire/direction'
import {
    applyPalette,
    PALETTE_PRESETS,
    paletteSwatches,
    type Palette,
} from '~/services/inspire/palettes'

const store = useBriefStore()
const { loading, error, run } = useClaudeTask()

const presets = computed(() => rankForDirection(PALETTE_PRESETS, store.brief))
const generated = ref<GeneratedPalette | null>(null)

const strip = (palette: Palette) => paletteSwatches(palette.colours)

const use = (palette: Palette) =>
    store.change(`Palette: ${palette.name}`, (brief) =>
        applyPalette(brief, palette.colours)
    )

const generate = async () => {
    const result = await run(
        'Connect Claude to generate a palette from your concept.',
        (caller) => generatePalette(caller, store.brief)
    )
    if (result) generated.value = result
}
</script>

<template>
    <SectionBlock
        title="Start from a palette"
        note="Each one fills your swatches and Color Themes and passes the contrast checks. You can edit everything afterwards."
    >
        <div class="pals">
            <div
                v-for="{ item, suits } in presets"
                :key="item.name"
                class="pal-c"
            >
                <div class="strip" aria-hidden="true">
                    <i
                        v-for="swatch in strip(item)"
                        :key="swatch.id"
                        :style="{ background: swatch.hex }"
                    ></i>
                </div>
                <b>{{ item.name }}</b>
                <span class="n2">{{ item.note }}</span>
                <span v-if="suits" class="tag ok">Suits your direction</span>
                <button
                    class="btn sm add"
                    type="button"
                    :aria-label="`Use palette ${item.name}`"
                    @click="use(item)"
                >
                    Use this palette
                </button>
            </div>
        </div>
        <div class="assist-bar">
            <button
                class="lnk claude"
                type="button"
                :disabled="loading"
                @click="generate"
            >
                Generate a palette from my concept with Claude
            </button>
        </div>
        <div
            v-if="loading || error || generated"
            class="idea"
            aria-live="polite"
        >
            <div v-if="loading" class="loading">Claude is mixing a palette</div>
            <div v-else-if="error" class="hint" role="alert">{{ error }}</div>
            <template v-else-if="generated">
                <div class="strip" aria-hidden="true">
                    <i
                        v-for="swatch in strip(generated.palette)"
                        :key="swatch.id"
                        :style="{ background: swatch.hex }"
                    ></i>
                </div>
                <div>
                    <b>{{ generated.palette.name }}</b>
                    <span class="hint"> {{ generated.palette.note }}</span>
                </div>
                <span
                    class="tag w-fit"
                    :class="generated.contrast.failures.length ? 'bad' : 'ok'"
                >
                    {{ generated.contrast.passing }} of
                    {{ generated.contrast.total }}
                    colour pairs pass contrast
                </span>
                <div v-if="generated.retried" class="hint">
                    Claude’s first palette failed some checks, so it was asked
                    to fix them once.
                </div>
                <ul
                    v-if="generated.contrast.failures.length"
                    class="hint fails"
                >
                    <li
                        v-for="failure in generated.contrast.failures"
                        :key="failure"
                    >
                        {{ failure }}
                    </li>
                </ul>
            </template>
            <div v-if="!loading" class="actions">
                <button
                    v-if="generated && !error"
                    class="btn sm pri"
                    type="button"
                    @click="(use(generated.palette), (generated = null))"
                >
                    Use this palette
                </button>
                <button class="btn sm" type="button" @click="generate">
                    Try again
                </button>
                <button
                    class="btn sm ghost"
                    type="button"
                    @click="((generated = null), (error = ''))"
                >
                    Close
                </button>
            </div>
        </div>
    </SectionBlock>
</template>
