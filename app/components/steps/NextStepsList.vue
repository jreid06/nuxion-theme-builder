<script setup lang="ts">
import { nextSteps } from '~/services/export/nextSteps'

const { brief } = storeToRefs(useBriefStore())
const steps = computed(() => nextSteps(brief.value))
</script>

<template>
    <ol class="nx">
        <template v-for="(step, index) in steps" :key="step.id">
            <li class="s" :class="{ done: brief.next[step.id] }">
                <input
                    :id="`next-${step.id}`"
                    v-model="brief.next[step.id]"
                    type="checkbox"
                />
                <div class="nx-head">
                    <label :for="`next-${step.id}`">
                        {{ index + 1 }}. {{ step.title }}
                    </label>
                    <span class="tag">{{ step.where }}</span>
                </div>
                <div class="nx-b">
                    <p v-if="step.body">{{ step.body }}</p>
                    <ul v-if="step.items">
                        <li v-for="item in step.items" :key="item">
                            {{ item }}
                        </li>
                    </ul>
                    <CommandBlock v-if="step.command" :command="step.command" />
                </div>
            </li>
            <li v-if="step.milestone" class="mile">{{ step.milestone }}</li>
        </template>
    </ol>
</template>
