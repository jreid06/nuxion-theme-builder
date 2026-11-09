<script setup lang="ts">
import { BODY_CONTRAST } from '~/services/brief/colour'
import { contrastGrid } from '~/services/brief/contrast'
import { swatchHex, swatchName } from '~/services/brief/resolve'

const { brief } = storeToRefs(useBriefStore())
const grid = computed(() => contrastGrid(brief.value))

const cellStyle = (background: string, foreground: string) => {
    const { used, ratio } = grid.value.cell(background, foreground)
    return used && ratio !== null
        ? {
              background: swatchHex(brief.value, background),
              color: swatchHex(brief.value, foreground),
          }
        : undefined
}

const verdict = (background: string, foreground: string) => {
    const { fails, ratio } = grid.value.cell(background, foreground)
    if (fails) return 'FAILS'
    return (ratio ?? 0) >= BODY_CONTRAST ? 'AA' : 'AA large'
}
</script>

<template>
    <div
        v-if="grid.backgrounds.length && grid.foregrounds.length"
        class="scroll"
    >
        <table class="mx">
            <thead>
                <tr>
                    <th>text ↓ on →</th>
                    <th
                        v-for="background in grid.backgrounds"
                        :key="background"
                    >
                        {{ swatchName(brief, background) }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="foreground in grid.foregrounds" :key="foreground">
                    <th>{{ swatchName(brief, foreground) }}</th>
                    <td
                        v-for="background in grid.backgrounds"
                        :key="background"
                        :class="{
                            used: grid.cell(background, foreground).used,
                            fail: grid.cell(background, foreground).fails,
                        }"
                        :style="cellStyle(background, foreground)"
                    >
                        {{
                            grid
                                .cell(background, foreground)
                                .ratio?.toFixed(2) ?? '–'
                        }}
                        <b v-if="cellStyle(background, foreground)">
                            {{ verdict(background, foreground) }}
                        </b>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else class="empty">
        Assign swatches in Color Themes and the pairs you use appear here.
    </div>
</template>
