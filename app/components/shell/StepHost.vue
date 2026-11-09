<script setup lang="ts">
import type { Component } from 'vue'
import { stepNavigation, type StepId } from '~/services/brief/steps'
import StepArt from '../steps/StepArt.vue'
import StepBlocks from '../steps/StepBlocks.vue'
import StepButtons from '../steps/StepButtons.vue'
import StepConcept from '../steps/StepConcept.vue'
import StepIdentity from '../steps/StepIdentity.vue'
import StepProduct from '../steps/StepProduct.vue'
import StepReview from '../steps/StepReview.vue'
import StepShape from '../steps/StepShape.vue'
import StepSwatches from '../steps/StepSwatches.vue'
import StepThemes from '../steps/StepThemes.vue'
import StepType from '../steps/StepType.vue'

const STEP_COMPONENTS: Record<StepId, Component> = {
    concept: StepConcept,
    product: StepProduct,
    identity: StepIdentity,
    swatches: StepSwatches,
    themes: StepThemes,
    buttons: StepButtons,
    type: StepType,
    shape: StepShape,
    art: StepArt,
    blocks: StepBlocks,
    review: StepReview,
}

const store = useBriefStore()
const focusIssue = useIssueFocus()
const form = useTemplateRef('form')

const issues = computed(() =>
    store.issues.filter((issue) => issue.step === store.stepId)
)
const navigation = computed(() => stepNavigation(store.stepId, store.brief))
const lands = computed(() =>
    store.step.lands.replace(/<name>/g, store.brief.name || '<name>')
)

watch(
    () => store.stepId,
    () => form.value?.scrollTo({ top: 0 })
)

const seePreview = () => document.querySelector('.live')?.scrollIntoView()
</script>

<template>
    <main ref="form" class="form">
        <div class="form-in">
            <div class="step-head">
                <h1>{{ store.step.title }}</h1>
                <p>{{ store.step.lede }}</p>
                <div class="lands">
                    Lands in <b>{{ lands }}</b>
                </div>
                <div
                    v-if="store.step.id === 'swatches' && store.brief.example"
                    class="tip"
                >
                    Try it: rename a slug to “violet”, or darken Paper until the
                    text fails, and watch Readiness respond.
                </div>
                <button class="btn sm jump" type="button" @click="seePreview">
                    See the preview
                </button>
            </div>
            <IssueList
                v-if="issues.length"
                :issues="issues"
                @open="focusIssue"
            />
            <component :is="STEP_COMPONENTS[store.stepId]" />
        </div>
        <div class="foot">
            <button
                v-if="navigation.previous"
                class="btn"
                type="button"
                @click="store.stepId = navigation.previous.id"
            >
                Back: {{ navigation.previous.title }}
            </button>
            <span v-else></span>
            <div class="foot-r">
                <button
                    v-if="navigation.skipped"
                    class="btn ghost"
                    type="button"
                    @click="store.stepId = navigation.skipped.id"
                >
                    Plan {{ navigation.skipped.title.toLowerCase() }} (optional)
                </button>
                <button
                    v-if="navigation.next"
                    class="btn pri"
                    type="button"
                    @click="store.stepId = navigation.next.id"
                >
                    Next: {{ navigation.next.title }}
                </button>
            </div>
        </div>
    </main>
</template>
