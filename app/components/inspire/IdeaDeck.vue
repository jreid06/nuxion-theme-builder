<script setup lang="ts">
import { featureFromAnswer } from '~/services/ai/proposals'
import { featuresRequest } from '~/services/ai/prompts'
import type { FeatureAnswer } from '~/services/ai/schemas'
import { rankForDirection } from '~/services/inspire/direction'
import {
    FEATURE_IDEAS,
    FEATURE_KINDS,
    featureFromIdea,
    fillPlaceholders,
    type FeatureKind,
} from '~/services/inspire/ideas'

const store = useBriefStore()
const { loading, error, run } = useClaudeTask()

type Tab = FeatureKind | 'claude'
const tab = ref<Tab>('block')
const fromClaude = ref<FeatureAnswer[]>([])

const TABS: { key: Tab; label: string }[] = [
    ...FEATURE_KINDS.map(({ kind, label }) => ({ key: kind, label })),
    { key: 'claude', label: 'From Claude' },
]

const cards = computed(() => {
    if (tab.value === 'claude') {
        return fromClaude.value.map((answer) => ({
            text: answer.text,
            ref: fillPlaceholders(answer.ref, store.brief),
            suits: false,
            add: () => featureFromAnswer(store.brief, answer),
        }))
    }
    const kind = tab.value
    return rankForDirection(
        FEATURE_IDEAS.filter((idea) => idea.kind === kind),
        store.brief
    ).map(({ item, suits }) => ({
        text: item.text,
        ref: fillPlaceholders(item.ref, store.brief),
        suits,
        add: () => featureFromIdea(store.brief, item),
    }))
})

const added = (text: string) =>
    store.brief.features.some((feature) => feature.text === text)

const askClaude = async () => {
    const answer = await run(
        'Connect Claude to get feature ideas written for your theme.',
        (caller) => caller.run(featuresRequest(store.brief))
    )
    if (answer) fromClaude.value = answer.features
}

const choose = (key: Tab) => {
    tab.value = key
    if (key === 'claude' && !fromClaude.value.length) askClaude()
}
</script>

<template>
    <div class="idea">
        <span class="idea-title">Idea deck: tap a card to add it</span>
        <div class="ichips" role="group" aria-label="Kind of feature">
            <button
                v-for="item in TABS"
                :key="item.key"
                type="button"
                class="ichip"
                :class="{ on: tab === item.key }"
                :aria-pressed="tab === item.key"
                @click="choose(item.key)"
            >
                {{ item.label }}
            </button>
        </div>
        <div v-if="tab === 'claude' && loading" class="loading">
            Claude is reading your concept
        </div>
        <div v-else-if="tab === 'claude' && error" class="hint" role="alert">
            {{ error }}
        </div>
        <div class="cards">
            <button
                v-for="card in cards"
                :key="card.text"
                type="button"
                class="card-i"
                :class="{ suits: card.suits }"
                :disabled="added(card.text)"
                @click="
                    store.change('Feature idea', (brief) =>
                        brief.features.push(card.add())
                    )
                "
            >
                <span>{{
                    added(card.text) ? `Added: ${card.text}` : card.text
                }}</span>
                <code>{{ card.ref }}</code>
            </button>
        </div>
        <button
            v-if="tab === 'claude' && !loading"
            class="btn sm add"
            type="button"
            @click="askClaude"
        >
            Ask for three more
        </button>
    </div>
</template>
