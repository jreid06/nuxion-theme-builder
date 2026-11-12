<script setup lang="ts">
import { checkFields } from '~/services/brief/blockFields'
import type { ThemeBlock } from '~/services/brief/model'
import { blockType, pascalCase, themeName } from '~/services/brief/names'
import {
    scaffoldBlockCommand,
    scaffoldThemeCommand,
} from '~/services/export/renderCommands'

const props = defineProps<{ block: ThemeBlock; index: number }>()
defineEmits<{ remove: [] }>()

const { brief } = storeToRefs(useBriefStore())

const type = computed(() => blockType(brief.value, props.block))
const issues = computed(() => checkFields(props.block.fields))
const isHero = computed(() => props.block.slug === 'hero')
const command = computed(() =>
    isHero.value
        ? scaffoldThemeCommand(brief.value)
        : scaffoldBlockCommand(
              type.value,
              themeName(brief.value),
              props.block.fields
          )
)
/** Open until the block has fields, so a new block starts with the questions. */
const interviewOpen = ref(!props.block.fields.length)
const path = (field: string) => `blocks.${props.index}.${field}`
</script>

<template>
    <div class="bc" :data-field="`blocks.${index}`">
        <div class="bc-head">
            <div class="bc-id">
                {{ block.slug ? type : 'New block' }}
                <small>
                    {{
                        block.slug
                            ? `${pascalCase(type)}.vue`
                            : 'Name it to see its files'
                    }}
                </small>
            </div>
            <button
                class="x"
                type="button"
                aria-label="Remove block"
                @click="$emit('remove')"
            >
                ×
            </button>
        </div>
        <div class="grid2">
            <FieldShell :path="path('slug')" label="Block name">
                <div class="pfx">
                    <span>{{ brief.name || 'theme' }}.</span>
                    <BaseInput v-model="block.slug" :path="path('slug')" mono />
                </div>
            </FieldShell>
            <TextField
                v-model="block.purpose"
                :path="path('purpose')"
                label="Purpose"
                placeholder="One line on what it looks like"
            />
        </div>

        <details class="bc-step" :open="interviewOpen">
            <summary @click.prevent="interviewOpen = !interviewOpen">
                Design this block
                <small>
                    Answer a few questions and the fields are made for you
                </small>
            </summary>
            <BlockInterview :block="block" :index="index" />
        </details>

        <div class="field">
            <span class="flabel">
                Fields
                <small class="hint">
                    after the eyebrow, heading, description and buttons every
                    theme block has
                </small>
            </span>
            <BlockFieldsEditor
                :fields="block.fields"
                :path="path('fields')"
                :issues="issues"
            />
        </div>

        <CheckRow
            :id="`block-${index}-full`"
            v-model="block.fullWidth"
            label="Full width only (it won’t be offered inside grid columns)"
        />

        <div v-if="block.slug" class="field">
            <span class="flabel">
                {{
                    isHero
                        ? 'Created with the theme, by'
                        : 'Creates this block with its fields'
                }}
            </span>
            <CommandBlock :command="command" />
            <div v-if="issues.length" class="hint bf-bad" role="alert">
                Fix the fields marked above first, or the scaffolder will stop.
            </div>
        </div>
    </div>
</template>
