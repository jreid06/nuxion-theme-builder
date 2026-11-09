<script setup lang="ts">
import { DESKTOP_WIDTH, PHONE_WIDTH } from '~/services/preview/sitePreview'
import type { LivePanel } from '~/stores/brief'

const store = useBriefStore()

const tabs = computed((): { key: LivePanel; label: string }[] => [
    { key: 'preview', label: 'Preview' },
    { key: 'brief', label: 'BRIEF.md' },
    { key: 'issues', label: `Readiness (${store.issues.length})` },
])

const WIDTHS = [
    { value: PHONE_WIDTH, label: '375' },
    { value: DESKTOP_WIDTH, label: '1280' },
]

const schemes = computed(() => [
    { value: 'light' as const, label: 'Light' },
    {
        value: 'dark' as const,
        label: 'Dark',
        disabled: store.brief.dark !== 'full',
    },
])

const notReady = computed(() => !store.brief.themes[0]?.light.bg)
</script>

<template>
    <aside class="live" aria-label="Live output">
        <div class="tabs" role="tablist">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                role="tab"
                type="button"
                :class="{ on: store.panel === tab.key }"
                :aria-selected="store.panel === tab.key"
                @click="store.panel = tab.key"
            >
                {{ tab.label }}
            </button>
        </div>
        <div class="live-body">
            <template v-if="store.panel === 'preview'">
                <div class="pv-ctl">
                    <SegmentedField
                        v-model="store.previewScheme"
                        path="preview.scheme"
                        :options="schemes"
                    />
                    <SegmentedField
                        v-model="store.previewWidth"
                        path="preview.width"
                        :options="WIDTHS"
                    />
                </div>
                <ThemePreview />
                <p v-if="notReady" class="pv-note">
                    Showing neutral colours until a Color Theme has a ground and
                    text colour.
                </p>
            </template>
            <BriefPreview v-else-if="store.panel === 'brief'" />
            <ReadinessList v-else />
        </div>
    </aside>
</template>
