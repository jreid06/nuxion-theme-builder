<script setup lang="ts">
import { isHex } from '~/services/brief/colour'

const store = useBriefStore()
const confirming = ref(false)

const warnings = computed(() => store.issues.length - store.errorCount)
const readiness = computed(() => {
    if (store.errorCount) return 'error'
    return warnings.value ? 'warn' : ''
})
const colourBar = computed(() =>
    store.brief.swatches.filter((swatch) => isHex(swatch.hex))
)

const replaceWith = (action: () => void) => {
    action()
    confirming.value = false
}
</script>

<template>
    <header class="top">
        <div class="brand">
            Theme Builder
            <small>
                {{
                    store.brief.title
                        ? `${store.brief.title} · ${store.brief.status}`
                        : 'New theme'
                }}
            </small>
        </div>
        <span v-if="store.brief.example" class="tag">
            Example: Nuxion’s Driftwire
        </span>
        <span class="sp"></span>
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
        <template v-if="confirming">
            <span class="hint">Replace this brief?</span>
            <button
                class="btn sm pri"
                type="button"
                @click="replaceWith(store.startBlank)"
            >
                Start blank
            </button>
            <button
                class="btn sm"
                type="button"
                @click="replaceWith(store.loadExample)"
            >
                Reload example
            </button>
            <button
                class="btn sm ghost"
                type="button"
                @click="confirming = false"
            >
                Keep editing
            </button>
        </template>
        <button v-else class="btn sm" type="button" @click="confirming = true">
            New brief
        </button>
        <div class="bar" aria-hidden="true">
            <i
                v-for="swatch in colourBar"
                :key="swatch.id"
                :style="{ background: swatch.hex }"
            ></i>
        </div>
    </header>
</template>
