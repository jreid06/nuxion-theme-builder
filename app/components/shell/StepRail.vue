<script setup lang="ts">
import { coreSteps, STEPS, stepStatus } from '~/services/brief/steps'
import type { StepMeta } from '~/services/brief/steps'

const store = useBriefStore()

const statusOf = (step: StepMeta) => stepStatus(step, store.brief, store.issues)

const done = computed(
    () => coreSteps.filter((step) => statusOf(step) === 'done').length
)
</script>

<template>
    <nav class="rail" aria-label="Brief steps">
        <div class="rail-head">
            {{ done }} of {{ coreSteps.length }} steps complete
        </div>
        <button
            v-for="step in STEPS"
            :key="step.id"
            class="st"
            :class="{ on: step.id === store.stepId }"
            type="button"
            :aria-current="step.id === store.stepId ? 'step' : undefined"
            @click="store.stepId = step.id"
        >
            <span class="sec">{{ step.sec }}</span>
            <span>
                {{ step.title }}
                <small v-if="step.optional">Optional</small>
            </span>
            <i class="dot" :class="statusOf(step)"></i>
        </button>
    </nav>
</template>
