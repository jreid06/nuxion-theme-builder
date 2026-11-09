<script setup lang="ts">
import { renderBriefSections } from '~/services/export/renderBrief'

const store = useBriefStore()
const sections = computed(() => renderBriefSections(store.brief))
const list = useTemplateRef('list')

const showCurrentSection = async () => {
    await nextTick()
    list.value?.querySelector('span.on')?.scrollIntoView({ block: 'nearest' })
}

onMounted(showCurrentSection)
watch(() => store.stepId, showCurrentSection)
</script>

<template>
    <pre ref="list" class="md" tabindex="0"><span
        v-for="section in sections"
        :key="section.step"
        :class="{ on: section.step === store.stepId }"
    >{{ section.text }}
</span></pre>
</template>
