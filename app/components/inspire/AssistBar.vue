<script setup lang="ts">
import { fieldRequest } from '~/services/ai/prompts'
import { rankForDirection } from '~/services/inspire/direction'
import {
    buildSentence,
    FIELD_GUIDES,
    rankedStarters,
    type AssistField,
} from '~/services/inspire/fieldGuides'
import { surpriseMoods } from '~/services/inspire/surprise'

const model = defineModel<string>({ default: '' })
const props = defineProps<{ field: AssistField; label: string }>()

const store = useBriefStore()
const { loading, error, run } = useClaudeTask()

const guide = computed(() => FIELD_GUIDES[props.field])
const hasText = computed(() => Boolean(model.value.trim()))
const showIdeas = ref(false)
const moods = ref<string[]>([])
const frameValues = reactive<Record<string, string>>({})
const suggestions = ref<string[] | null>(null)
const rewriting = ref(false)

const frameSlots = computed(() =>
    (guide.value.frame?.slots ?? []).map((slot) => ({
        ...slot,
        ranked: rankForDirection(slot.options, store.brief),
    }))
)
const sentence = computed(() =>
    guide.value.frame ? buildSentence(guide.value.frame, frameValues) : ''
)
const starters = computed(() => rankedStarters(props.field, store.brief))

const use = (text: string, appendTo = false) => {
    store.change(props.label, () => {
        model.value =
            appendTo && hasText.value ? `${model.value} ${text}` : text
    })
}

const surprise = () => {
    moods.value = surpriseMoods(store.brief, Math.random)
}

const suggest = async () => {
    rewriting.value = hasText.value
    const answer = await run(
        `Connect Claude to get suggestions for ${props.label.toLowerCase()}.`,
        (caller) =>
            caller.run(fieldRequest(props.field, store.brief, model.value))
    )
    if (answer) suggestions.value = answer.options.slice(0, 3)
}

const REWRITE_LABELS = ['Tighter', 'Warmer', 'Bolder']
</script>

<template>
    <div class="assist">
        <div class="assist-bar">
            <button
                class="lnk"
                type="button"
                :aria-expanded="showIdeas"
                @click="showIdeas = !showIdeas"
            >
                {{ showIdeas ? 'Hide ideas' : 'Need ideas?' }}
            </button>
            <button
                class="lnk claude"
                type="button"
                :disabled="loading"
                @click="suggest"
            >
                {{ hasText ? 'Improve with Claude' : 'Suggest with Claude' }}
            </button>
        </div>

        <div v-if="showIdeas" class="idea">
            <span class="idea-title">Ask yourself</span>
            <ul>
                <li v-for="question in guide.questions" :key="question">
                    {{ question }}
                </li>
            </ul>
            <div v-if="guide.note" class="hint">{{ guide.note }}</div>

            <template v-if="guide.surprise">
                <button class="btn sm add" type="button" @click="surprise">
                    {{ moods.length ? 'Surprise me again' : 'Surprise me' }}
                </button>
                <div v-if="moods.length" class="opt-list">
                    <div v-for="mood in moods" :key="mood" class="sug">
                        <span>{{ mood }}</span>
                        <button class="btn sm" type="button" @click="use(mood)">
                            Use
                        </button>
                    </div>
                </div>
            </template>

            <template v-if="guide.frame">
                <div v-for="slot in frameSlots" :key="slot.id" class="field">
                    <span class="idea-title">{{ slot.label }}</span>
                    <ChoiceChips
                        :choices="slot.ranked"
                        :selected="frameValues[slot.id] ?? ''"
                        @pick="frameValues[slot.id] = $event"
                    />
                </div>
                <div class="built" :class="{ 'empty-b': !sentence }">
                    {{
                        sentence ||
                        'Pick one from each row to build a sentence.'
                    }}
                </div>
                <button
                    v-if="sentence"
                    class="btn sm pri add"
                    type="button"
                    @click="use(sentence)"
                >
                    Use this sentence
                </button>
            </template>

            <template v-if="starters.length">
                <span class="idea-title">Starters</span>
                <ChoiceChips :choices="starters" @pick="use($event, true)" />
            </template>
            <div
                v-if="
                    starters.some((starter) => starter.suits) ||
                    frameSlots.length
                "
                class="hint"
            >
                Options with a dot suit your direction from the Concept step.
            </div>
        </div>

        <div
            v-if="loading || error || suggestions"
            class="idea"
            aria-live="polite"
        >
            <div v-if="loading" class="loading">
                {{
                    rewriting
                        ? 'Claude is reworking your text'
                        : 'Claude is thinking of options'
                }}
            </div>
            <div v-else-if="error" class="hint" role="alert">{{ error }}</div>
            <template v-else-if="suggestions">
                <div class="opt-list">
                    <div
                        v-for="(option, index) in suggestions"
                        :key="option"
                        class="sug"
                    >
                        <div>
                            <small v-if="rewriting">{{
                                REWRITE_LABELS[index]
                            }}</small>
                            {{ option }}
                        </div>
                        <button
                            class="btn sm"
                            type="button"
                            @click="(use(option), (suggestions = null))"
                        >
                            Use
                        </button>
                    </div>
                </div>
            </template>
            <div v-if="!loading" class="actions">
                <button class="btn sm" type="button" @click="suggest">
                    Try again
                </button>
                <button
                    class="btn sm ghost"
                    type="button"
                    @click="((suggestions = null), (error = ''))"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
