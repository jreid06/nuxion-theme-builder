<script setup lang="ts">
import type { ThemeBlock } from '~/services/brief/model'
import { blockType, pascalCase, parseFields } from '~/services/brief/names'
import { markdownRole } from '~/services/brief/nuxion'

const props = defineProps<{ block: ThemeBlock; index: number }>()
defineEmits<{ remove: [] }>()

const { brief } = storeToRefs(useBriefStore())

const type = computed(() => blockType(brief.value, props.block))
const fields = computed(() =>
    parseFields(props.block.fields).map((field) => ({
        field,
        role: markdownRole(field),
    }))
)
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
            />
        </div>
        <TextField
            v-model="block.fields"
            :path="path('fields')"
            label="Fields beyond the intro"
            mono
            placeholder="cells, title, body"
            hint="Separate names with commas."
        />
        <div v-if="fields.length" class="chips">
            <span
                v-for="({ field, role }, position) in fields"
                :key="position"
                class="tag"
                :class="{ ok: role }"
            >
                {{ role ? `${field} · ${role}` : field }}
            </span>
        </div>
        <div class="flex flex-wrap gap-[18px]">
            <CheckRow
                :id="`block-${index}-projection`"
                v-model="block.projection"
                label="Holds links or rich text"
            />
            <CheckRow
                :id="`block-${index}-full`"
                v-model="block.fullWidth"
                label="Full width only"
            />
        </div>
    </div>
</template>
