<script setup lang="ts">
import { STEPS } from '~/services/brief/steps'

const store = useBriefStore()
const focusIssue = useIssueFocus()

const groups = computed(() =>
    STEPS.map((step) => ({
        step,
        issues: store.issues.filter((issue) => issue.step === step.id),
    })).filter((group) => group.issues.length)
)
</script>

<template>
    <div v-if="!groups.length" class="none-left">
        Nothing to review. Every check passes.
    </div>
    <div v-for="{ step, issues } in groups" :key="step.id" class="step-issues">
        <span class="flabel">{{ step.sec }} {{ step.title }}</span>
        <IssueList :issues="issues" @open="focusIssue" />
    </div>
</template>
