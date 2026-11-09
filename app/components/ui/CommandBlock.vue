<script setup lang="ts">
defineProps<{ command: string }>()
</script>

<template>
    <div class="cmd">
        <pre>{{ command }}</pre>
        <CopyButton :text="command" />
    </div>
</template>
