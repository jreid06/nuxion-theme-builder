<script setup lang="ts">
const store = useBriefStore()
const { loadFont } = useFontLoader()

onMounted(() => {
    Object.values(store.brief.fonts).forEach((font) => loadFont(font.family))
    document.fonts.ready.then(() => store.fontVersion++)
    document.fonts.addEventListener('loadingdone', () => store.fontVersion++)
})
</script>

<template>
    <div class="app">
        <AppHeader />
        <div
            class="work"
            :class="{
                wide: store.previewWidth !== 375 && store.panel === 'preview',
            }"
        >
            <StepRail />
            <StepHost />
            <LivePanel />
        </div>
    </div>
</template>
