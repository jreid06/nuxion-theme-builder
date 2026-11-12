<script setup lang="ts">
import { designFields, type DesignedFields } from '~/services/ai/blockDesign'
import { fieldSpec } from '~/services/brief/blockFields'
import type { ThemeBlock } from '~/services/brief/model'
import {
    ACTIONS,
    fieldsFromAnswers,
    ITEM_PARTS,
    JOBS,
    pickJob,
    SECTION_PARTS,
    SHAPES,
    type InterviewOption,
} from '~/services/inspire/blockInterview'
import { rankForDirection } from '~/services/inspire/direction'

/** The questions a block designer asks, and the two ways to turn them into fields. */
const props = defineProps<{ block: ThemeBlock; index: number }>()

const store = useBriefStore()
const { loading, error, run } = useClaudeTask()
const designed = ref<DesignedFields | null>(null)

const answers = computed(() => props.block.answers)
const hasList = computed(() => answers.value.shape !== 'single')

/** ChoiceChips works in labels; the answers keep ids. */
const chips = (options: InterviewOption[], rank = false) =>
    rank
        ? rankForDirection(
              options.map((option) => ({ ...option, text: option.label })),
              store.brief
          )
        : options.map((option) => ({
              item: { text: option.label },
              suits: false,
          }))
const idOf = (options: InterviewOption[], label: string) =>
    options.find((option) => option.label === label)?.id ?? ''
const labelsOf = (options: InterviewOption[], ids: string[]) =>
    options.filter((option) => ids.includes(option.id)).map((o) => o.label)
const labelOf = (options: InterviewOption[], id: string) =>
    options.find((option) => option.id === id)?.label ?? ''

const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id]

const chooseJob = (label: string) => {
    props.block.answers = pickJob(answers.value, idOf(JOBS, label))
}
const chooseShape = (label: string) => {
    answers.value.shape = idOf(SHAPES, label) as typeof answers.value.shape
}
const pickPart = (
    key: 'itemParts' | 'sectionParts' | 'actions',
    options: InterviewOption[],
    label: string
) => {
    answers.value[key] = toggle(answers.value[key], idOf(options, label))
}

const answered = computed(() =>
    Boolean(answers.value.job || answers.value.shape)
)

const fromAnswers = () =>
    store.change(`Fields for ${props.block.slug || 'block'}`, (brief) => {
        const target = brief.blocks[props.index]
        if (target) target.fields = fieldsFromAnswers(target.answers)
    })

const design = async () => {
    const result = await run(
        'Connect Claude to design this block’s fields from your answers.',
        (caller) => designFields(caller, store.brief, props.block)
    )
    if (result) designed.value = result
}

const useDesigned = () => {
    const fields = designed.value?.fields
    if (!fields) return
    store.change(
        `Claude’s fields for ${props.block.slug || 'block'}`,
        (brief) => {
            const target = brief.blocks[props.index]
            if (target) target.fields = JSON.parse(JSON.stringify(fields))
        }
    )
    designed.value = null
}
</script>

<template>
    <div class="interview">
        <div class="field">
            <span class="idea-title">1. What job does this section do?</span>
            <ChoiceChips
                :choices="chips(JOBS, true)"
                :selected="labelOf(JOBS, answers.job)"
                @pick="chooseJob"
            />
        </div>
        <div class="field">
            <span class="idea-title">2. What’s in it, besides the intro?</span>
            <ChoiceChips
                :choices="chips(SHAPES)"
                :selected="labelOf(SHAPES, answers.shape)"
                @pick="chooseShape"
            />
        </div>
        <div v-if="answers.shape && hasList" class="field">
            <span class="idea-title">3. What does each item hold?</span>
            <ChoiceChips
                :choices="chips(ITEM_PARTS)"
                :selected="labelsOf(ITEM_PARTS, answers.itemParts)"
                @pick="pickPart('itemParts', ITEM_PARTS, $event)"
            />
        </div>
        <div class="field">
            <span class="idea-title">
                {{ answers.shape && hasList ? '4.' : '3.' }} Does the section
                itself hold anything else?
            </span>
            <ChoiceChips
                :choices="chips(SECTION_PARTS)"
                :selected="labelsOf(SECTION_PARTS, answers.sectionParts)"
                @pick="pickPart('sectionParts', SECTION_PARTS, $event)"
            />
        </div>
        <div class="field">
            <span class="idea-title">
                {{ answers.shape && hasList ? '5.' : '4.' }} What can a visitor
                do here?
            </span>
            <ChoiceChips
                :choices="chips(ACTIONS)"
                :selected="labelsOf(ACTIONS, answers.actions)"
                @pick="pickPart('actions', ACTIONS, $event)"
            />
        </div>
        <TextField
            v-model="answers.special"
            :path="`blocks.${index}.answers.special`"
            label="Anything special about it? (Claude reads this)"
            placeholder="e.g. a monthly/yearly switch, and a comparison table under the tiers"
        />
        <div class="actions">
            <button
                class="btn sm pri"
                type="button"
                :disabled="!answered"
                @click="fromAnswers"
            >
                {{ block.fields.length ? 'Remake fields' : 'Make fields' }} from
                my answers
            </button>
            <button
                class="lnk claude"
                type="button"
                :disabled="loading"
                @click="design"
            >
                Design fields with Claude
            </button>
        </div>
        <div
            v-if="loading || error || designed"
            class="idea"
            aria-live="polite"
        >
            <div v-if="loading" class="loading">
                Claude is designing the fields
            </div>
            <div v-else-if="error" class="hint" role="alert">{{ error }}</div>
            <template v-else-if="designed">
                <span class="idea-title">Claude suggests</span>
                <ul class="bf-list">
                    <li v-for="field in designed.fields" :key="field.name">
                        <code>{{ fieldSpec([field]) }}</code>
                        <span v-if="designed.notes[field.name]" class="hint">
                            {{ designed.notes[field.name] }}
                        </span>
                    </li>
                </ul>
                <div v-if="designed.dropped.length" class="hint">
                    Left out, because the scaffolder wouldn’t accept them:
                    {{ designed.dropped.join('; ') }}
                </div>
            </template>
            <div v-if="!loading" class="actions">
                <button
                    v-if="designed?.fields.length"
                    class="btn sm pri"
                    type="button"
                    @click="useDesigned"
                >
                    Use these fields
                </button>
                <button class="btn sm" type="button" @click="design">
                    Try again
                </button>
                <button
                    class="btn sm ghost"
                    type="button"
                    @click="((designed = null), (error = ''))"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
