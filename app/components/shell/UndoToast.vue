<script setup lang="ts">
const store = useBriefStore()
</script>

<template>
    <div v-if="store.lastChange" class="toast" role="status">
        <span>Applied: {{ store.lastChange.label }}</span>
        <button type="button" @click="store.undoChange()">Undo</button>
        <button
            type="button"
            aria-label="Dismiss"
            @click="store.lastChange = null"
        >
            ×
        </button>
    </div>
</template>
