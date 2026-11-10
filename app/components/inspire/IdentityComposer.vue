<script setup lang="ts">
import { rankForDirection } from '~/services/inspire/direction'
import {
    COMPOSER_QUESTIONS,
    composeIdentity,
    type ComposerKey,
} from '~/services/inspire/ideas'

const store = useBriefStore()

const answers = reactive<Record<ComposerKey, string>>({
    metaphor: '',
    colour: '',
    depth: '',
    tension: '',
})

const questions = computed(() =>
    COMPOSER_QUESTIONS.map((question) => ({
        ...question,
        ranked: rankForDirection(question.options, store.brief),
    }))
)
const draft = computed(() => composeIdentity(answers))
const replacing = computed(() => Boolean(store.brief.identity.trim()))

const useDraft = () =>
    store.change('Composed idea', (brief) => {
        brief.identity = draft.value
    })
</script>

<template>
    <div class="idea compose">
        <span class="idea-title">Guided composer: answer four questions</span>
        <div v-for="question in questions" :key="question.key" class="field">
            <label :for="`composer-${question.key}`">{{
                question.question
            }}</label>
            <input
                :id="`composer-${question.key}`"
                v-model="answers[question.key]"
                type="text"
                placeholder="Type your own, or tap one below"
            />
            <ChoiceChips
                :choices="question.ranked"
                :selected="answers[question.key]"
                @pick="answers[question.key] = $event"
            />
        </div>
        <div class="built" :class="{ 'empty-b': !draft }">
            {{ draft || 'Your draft builds here as you answer.' }}
        </div>
        <button
            v-if="draft"
            class="btn sm pri add"
            type="button"
            @click="useDraft"
        >
            {{
                replacing
                    ? 'Replace “The idea” with this'
                    : 'Use this as “The idea”'
            }}
        </button>
    </div>
</template>
