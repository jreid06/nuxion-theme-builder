<script setup lang="ts">
import { isHex } from '~/services/brief/colour'

const store = useBriefStore()
const claude = useClaudeStore()

const open = computed(() => store.currentId !== null)
const warnings = computed(() => store.issues.length - store.errorCount)
const readiness = computed(() => {
    if (store.errorCount) return 'error'
    return warnings.value ? 'warn' : ''
})
const colourBar = computed(() =>
    open.value ? store.brief.swatches.filter((swatch) => isHex(swatch.hex)) : []
)
</script>

<template>
    <header class="top">
        <div class="brand">
            Theme Builder
            <small>
                {{
                    !open
                        ? 'Your briefs'
                        : store.brief.title
                          ? `${store.brief.title} · ${store.brief.status}`
                          : 'Untitled theme'
                }}
            </small>
        </div>
        <span v-if="open && store.brief.example" class="tag">
            Example: Nuxion’s Driftwire
        </span>
        <span class="sp"></span>
        <button
            class="pill"
            :class="claude.connected ? 'ai' : 'plain'"
            type="button"
            @click="claude.openSheet()"
        >
            {{ claude.connected ? 'Claude connected' : 'Connect Claude' }}
        </button>
        <template v-if="open">
            <span class="hint">
                {{
                    store.storageAvailable
                        ? 'Saved in this browser'
                        : 'Not saved: browser storage is off'
                }}
            </span>
            <button
                class="pill"
                :class="readiness"
                type="button"
                @click="store.panel = 'issues'"
            >
                Readiness: {{ store.errorCount }} blocking · {{ warnings }} to
                review
            </button>
            <button class="btn sm" type="button" @click="store.closeBrief()">
                All briefs
            </button>
        </template>
        <div class="bar" aria-hidden="true">
            <i
                v-for="swatch in colourBar"
                :key="swatch.id"
                :style="{ background: swatch.hex }"
            ></i>
        </div>
    </header>
</template>
