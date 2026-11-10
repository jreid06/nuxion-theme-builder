<script setup lang="ts">
const store = useBriefStore()
const { loadFont } = useFontLoader()

onMounted(() => {
    document.fonts.ready.then(() => store.fontVersion++)
    document.fonts.addEventListener('loadingdone', () => store.fontVersion++)
})

watch(
    () => store.currentId,
    () =>
        Object.values(store.brief.fonts).forEach((font) =>
            loadFont(font.family)
        )
)
</script>

<template>
    <div class="app">
        <AppHeader />
        <BriefLibrary v-if="!store.currentId" />
        <div
            v-else
            class="work"
            :class="{
                wide: store.previewWidth !== 375 && store.panel === 'preview',
            }"
        >
            <StepRail />
            <StepHost />
            <LivePanel />
        </div>
        <UndoToast />
        <ClaudeConnect />
    </div>
</template>
