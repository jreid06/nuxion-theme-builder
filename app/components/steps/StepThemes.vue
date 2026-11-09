<script setup lang="ts">
import { colorTheme } from '~/services/brief/model'
import { rowKey } from '~/services/utils/dom'

const store = useBriefStore()
const { brief } = storeToRefs(store)
</script>

<template>
    <template v-if="brief.swatches.length">
        <ThemeCard
            v-for="(theme, index) in brief.themes"
            :key="rowKey(theme)"
            :theme="theme"
            :index="index"
            @remove="brief.themes.splice(index, 1)"
        />
        <button
            class="btn sm add"
            type="button"
            @click="brief.themes.push(colorTheme('new', '', ''))"
        >
            Add Color Theme
        </button>
    </template>
    <template v-else>
        <div class="empty">Add swatches first, then assign them here.</div>
        <button
            class="btn add"
            type="button"
            @click="store.stepId = 'swatches'"
        >
            Go to Swatches
        </button>
    </template>
</template>
