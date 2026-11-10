<script setup lang="ts">
import { ruleFromAnswer } from '~/services/ai/proposals'
import { rulesRequest } from '~/services/ai/prompts'
import type { RuleAnswer } from '~/services/ai/schemas'
import { rankForDirection } from '~/services/inspire/direction'
import {
    fillPlaceholders,
    RULE_IDEAS,
    ruleFromIdea,
} from '~/services/inspire/ideas'

const store = useBriefStore()
const { loading, error, run } = useClaudeTask()

const tab = ref<'library' | 'claude'>('library')
const fromClaude = ref<RuleAnswer[]>([])

const cards = computed(() =>
    tab.value === 'claude'
        ? fromClaude.value.map((answer) => ({
              rule: answer.rule,
              how: fillPlaceholders(answer.how, store.brief),
              suits: false,
              add: () => ruleFromAnswer(store.brief, answer),
          }))
        : rankForDirection(RULE_IDEAS, store.brief).map(({ item, suits }) => ({
              rule: item.rule,
              how: fillPlaceholders(item.how, store.brief),
              suits,
              add: () => ruleFromIdea(store.brief, item),
          }))
)

const added = (rule: string) =>
    store.brief.rules.some((existing) => existing.rule === rule)

const askClaude = async () => {
    const answer = await run(
        'Connect Claude to get rules written for your theme.',
        (caller) => caller.run(rulesRequest(store.brief))
    )
    if (answer) fromClaude.value = answer.rules
}

const choose = (key: 'library' | 'claude') => {
    tab.value = key
    if (key === 'claude' && !fromClaude.value.length) askClaude()
}
</script>

<template>
    <div class="idea">
        <span class="idea-title">Rule library: tap a card to add it</span>
        <div class="ichips" role="group" aria-label="Where the rules come from">
            <button
                type="button"
                class="ichip"
                :class="{ on: tab === 'library' }"
                :aria-pressed="tab === 'library'"
                @click="choose('library')"
            >
                Common rules
            </button>
            <button
                type="button"
                class="ichip"
                :class="{ on: tab === 'claude' }"
                :aria-pressed="tab === 'claude'"
                @click="choose('claude')"
            >
                From Claude
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
                :key="card.rule"
                type="button"
                class="card-i"
                :class="{ suits: card.suits }"
                :disabled="added(card.rule)"
                @click="
                    store.change('Rule', (brief) =>
                        brief.rules.push(card.add())
                    )
                "
            >
                <span>{{
                    added(card.rule) ? `Added: ${card.rule}` : card.rule
                }}</span>
                <code>{{ card.how }}</code>
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
