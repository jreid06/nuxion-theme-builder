<script setup lang="ts">
defineProps<{ title: string; note?: string; field?: string }>()
</script>

<template>
    <section class="blk" :data-field="field">
        <h2 class="sub">{{ title }}</h2>
        <p v-if="note" class="sub-note">{{ note }}</p>
        <slot />
    </section>
</template>
