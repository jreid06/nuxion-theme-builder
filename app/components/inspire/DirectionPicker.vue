<script setup lang="ts">
import {
    MAX_VIBES,
    SECTOR_IDS,
    SECTOR_LABELS,
    toggleVibe,
    VIBE_IDS,
    VIBE_LABELS,
} from '~/services/inspire/direction'

const { brief } = storeToRefs(useBriefStore())
const direction = computed(() => brief.value.direction)

const pickSector = (sector: string) => {
    direction.value.sector = direction.value.sector === sector ? '' : sector
}
</script>

<template>
    <SectionBlock
        title="Direction"
        note="Pick up to three mood words and a sector. Ideas on later steps that suit them come first, marked with a dot, and Claude reads them too."
        field="direction"
    >
        <div class="field">
            <span class="idea-title">
                Mood words ({{ direction.vibes.length }} of {{ MAX_VIBES }})
            </span>
            <div class="ichips">
                <button
                    v-for="vibe in VIBE_IDS"
                    :key="vibe"
                    type="button"
                    class="ichip"
                    :class="{ on: direction.vibes.includes(vibe) }"
                    :aria-pressed="direction.vibes.includes(vibe)"
                    :disabled="
                        !direction.vibes.includes(vibe) &&
                        direction.vibes.length >= MAX_VIBES
                    "
                    @click="direction.vibes = toggleVibe(direction.vibes, vibe)"
                >
                    {{ VIBE_LABELS[vibe] }}
                </button>
            </div>
        </div>
        <div class="field">
            <span class="idea-title">Sector</span>
            <div class="ichips">
                <button
                    v-for="sector in SECTOR_IDS"
                    :key="sector"
                    type="button"
                    class="ichip"
                    :class="{ on: direction.sector === sector }"
                    :aria-pressed="direction.sector === sector"
                    @click="pickSector(sector)"
                >
                    {{ SECTOR_LABELS[sector] }}
                </button>
            </div>
        </div>
    </SectionBlock>
</template>
