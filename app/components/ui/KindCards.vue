<script setup lang="ts">
defineProps<{
    kinds: { title: string; description: string; rows: [string, string][] }[]
}>()
</script>

<template>
    <div class="kinds">
        <div v-for="(kind, index) in kinds" :key="kind.title" class="kind">
            <slot name="thumb" :index="index" />
            <h3>{{ kind.title }}</h3>
            <p>{{ kind.description }}</p>
            <dl>
                <template v-for="[term, detail] in kind.rows" :key="term">
                    <dt>{{ term }}</dt>
                    <dd>{{ detail }}</dd>
                </template>
            </dl>
        </div>
    </div>
</template>
