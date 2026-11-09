<script setup lang="ts">
defineProps<{ title: string; items: string[]; after?: string }>()
</script>

<template>
    <div class="how">
        <h2>{{ title }}</h2>
        <ol>
            <li v-for="item in items" :key="item">{{ item }}</li>
        </ol>
        <p v-if="after" class="hint">{{ after }}</p>
    </div>
</template>
