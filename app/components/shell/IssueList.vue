<script setup lang="ts">
import type { Issue } from '~/services/brief/checks'

defineProps<{ issues: Issue[] }>()
defineEmits<{ open: [issue: Issue] }>()
</script>

<template>
    <div class="step-issues">
        <button
            v-for="(issue, index) in issues"
            :key="index"
            class="iss"
            :class="issue.severity"
            type="button"
            @click="$emit('open', issue)"
        >
            <i class="dot" :class="issue.severity"></i>
            <span>{{ issue.message }}</span>
        </button>
    </div>
</template>
