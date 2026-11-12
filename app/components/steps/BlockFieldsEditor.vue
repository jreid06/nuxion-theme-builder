<script setup lang="ts">
import {
    FIELD_TYPE_OPTIONS,
    type FieldIssue,
} from '~/services/brief/blockFields'
import { blockField, type BlockField } from '~/services/brief/model'
import { markdownRole } from '~/services/brief/nuxion'
import { rowKey } from '~/services/utils/dom'

/**
 * A block's fields, or a list's item fields, one row each. `issues` are the
 * block's own (checkFields), and `at` is where these rows sit among them:
 * '' for the block, `2` for the item fields of its third field.
 */
const props = defineProps<{
    fields: BlockField[]
    path: string
    issues: FieldIssue[]
    at?: string
}>()

const nested = computed(() => Boolean(props.at))
const position = (index: number) =>
    props.at ? `${props.at}.${index}` : String(index)

const types = computed(() =>
    nested.value
        ? FIELD_TYPE_OPTIONS.filter((option) => option.value !== 'list')
        : FIELD_TYPE_OPTIONS
)

const messages = (index: number) =>
    props.issues
        .filter((issue) => issue.at === position(index))
        .map((issue) => issue.message)

const setType = (field: BlockField, type: string) => {
    field.type = type
    if (type === 'list') field.of ??= [blockField('title', 'string', true)]
    else delete field.of
}

const add = () => props.fields.push(blockField(''))
</script>

<template>
    <div
        class="rows bf"
        :class="{ 'bf-items': nested }"
        :style="{ '--cols': '1.5fr 1.2fr 64px 1fr 26px' }"
    >
        <div v-if="!fields.length" class="empty">
            {{
                nested
                    ? 'No item fields yet.'
                    : 'No fields beyond the intro yet. Answer the questions above, or add them here.'
            }}
        </div>
        <div v-else class="row-head" aria-hidden="true">
            <span>{{ nested ? 'Item field' : 'Field' }}</span>
            <span>Type</span>
            <span>Required</span>
            <span>Markdown</span>
            <span></span>
        </div>
        <template v-for="(field, index) in fields" :key="rowKey(field)">
            <div class="row" :data-field="`${path}.${index}`">
                <div class="cell">
                    <span class="cell-label">Field</span>
                    <BaseInput
                        v-model="field.name"
                        :path="`${path}.${index}`"
                        mono
                        placeholder="camelCase name"
                        :aria-label="nested ? 'Item field name' : 'Field name'"
                    />
                </div>
                <div class="cell">
                    <span class="cell-label">Type</span>
                    <BaseSelect
                        :model-value="field.type"
                        :path="`${path}.${index}.type`"
                        :options="types"
                        aria-label="Type"
                        @update:model-value="setType(field, $event ?? 'string')"
                    />
                </div>
                <div class="cell bf-req">
                    <span class="cell-label">Required</span>
                    <input
                        v-model="field.required"
                        type="checkbox"
                        :aria-label="`${field.name || 'Field'} is required`"
                    />
                </div>
                <div class="cell">
                    <span class="cell-label">Markdown</span>
                    <span
                        class="tag"
                        :class="{ ok: markdownRole(field.name) }"
                        :title="
                            markdownRole(field.name)
                                ? 'Reaches the page’s Markdown version and llms.txt'
                                : 'Works on the page, but stays out of the Markdown version'
                        "
                    >
                        {{ markdownRole(field.name) ?? 'page only' }}
                    </span>
                </div>
                <button
                    class="x"
                    type="button"
                    :aria-label="`Remove ${field.name || 'field'}`"
                    @click="fields.splice(index, 1)"
                >
                    ×
                </button>
            </div>
            <div
                v-for="message in messages(index)"
                :key="message"
                class="hint bf-bad"
                role="alert"
            >
                {{ message }}
            </div>
            <BlockFieldsEditor
                v-if="field.type === 'list' && field.of"
                :fields="field.of"
                :path="`${path}.${index}`"
                :issues="issues"
                :at="position(index)"
            />
        </template>
        <button class="btn sm add" type="button" @click="add">
            {{ nested ? 'Add item field' : 'Add field' }}
        </button>
    </div>
</template>
