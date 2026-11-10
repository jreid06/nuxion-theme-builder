<script setup lang="ts">
import { draftRequest, type DraftStep } from '~/services/ai/prompts'
import {
    applyProposals,
    defaultSelection,
    draftProposals,
    type Proposal,
} from '~/services/ai/proposals'

const props = defineProps<{ step: DraftStep }>()

const store = useBriefStore()
const { loading, error, run } = useClaudeTask()

const proposals = ref<Proposal[] | null>(null)
const selected = ref(new Set<string>())

const draft = async () => {
    const answer = await run(
        'Connect Claude to draft this step from what you’ve written so far.',
        (caller) => caller.run(draftRequest(props.step, store.brief))
    )
    if (!answer) return
    proposals.value = draftProposals(props.step, store.brief, answer)
    selected.value = defaultSelection(proposals.value)
}

const toggle = (id: string, on: boolean) => {
    const next = new Set(selected.value)
    if (on) next.add(id)
    else next.delete(id)
    selected.value = next
}

const accept = () => {
    const chosen = proposals.value ?? []
    store.change(`Claude’s draft (${selected.value.size})`, (brief) =>
        applyProposals(brief, chosen, selected.value)
    )
    proposals.value = null
}

const close = () => {
    proposals.value = null
    error.value = ''
}
</script>

<template>
    <button class="btn sm add" type="button" :disabled="loading" @click="draft">
        Draft this step with Claude
    </button>
    <div v-if="loading || error || proposals" class="draft" aria-live="polite">
        <h2 class="sub">Claude’s draft</h2>
        <div v-if="loading" class="loading">Claude is reading your brief</div>
        <div v-else-if="error" class="hint" role="alert">{{ error }}</div>
        <template v-else-if="proposals">
            <p class="sub-note mt-0">
                Tick what you want to keep. Anything that would replace what
                you’ve written starts unticked.
            </p>
            <label
                v-for="proposal in proposals"
                :key="proposal.id"
                class="draft-row"
            >
                <input
                    :id="`draft-${proposal.id}`"
                    type="checkbox"
                    :checked="selected.has(proposal.id)"
                    @change="
                        toggle(
                            proposal.id,
                            ($event.target as HTMLInputElement).checked
                        )
                    "
                />
                <span>
                    <small>
                        {{ proposal.label
                        }}{{ proposal.replaces ? ' · replaces yours' : '' }}
                    </small>
                    {{ proposal.text }}
                </span>
            </label>
        </template>
        <div v-if="!loading" class="actions">
            <button
                v-if="proposals"
                class="btn sm pri"
                type="button"
                :disabled="!selected.size"
                @click="accept"
            >
                Add {{ selected.size }} to the brief
            </button>
            <button v-if="error" class="btn sm" type="button" @click="draft">
                Try again
            </button>
            <button class="btn sm ghost" type="button" @click="close">
                {{ proposals ? 'Discard' : 'Close' }}
            </button>
        </div>
    </div>
</template>
