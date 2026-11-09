<script setup lang="ts">
const model = defineModel<boolean>()
defineProps<{ id: string; label: string; sub?: string }>()
</script>

<template>
    <label class="check">
        <input :id="id" v-model="model" type="checkbox" />
        <span>
            {{ label }}
            <code v-if="sub">{{ sub }}</code>
        </span>
    </label>
</template>
