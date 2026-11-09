<script setup lang="ts" generic="T extends object">
import { rowKey } from '~/services/utils/dom'
import type { SelectOption } from './BaseSelect.vue'

export interface RowColumn {
    key: string
    label: string
    width?: string
    mono?: boolean
    options?: SelectOption[]
    placeholder?: string
    list?: string
}

const props = defineProps<{
    path: string
    rows: T[]
    columns: RowColumn[]
    make: () => T
    addLabel: string
    empty?: string
}>()

const template = computed(
    () =>
        `${props.columns.map((column) => column.width ?? '1fr').join(' ')} 26px`
)

const values = (row: T) => row as Record<string, string>
</script>

<template>
    <div class="rows" :data-field="path" :style="{ '--cols': template }">
        <div v-if="rows.length" class="row-head" aria-hidden="true">
            <span v-for="column in columns" :key="column.key">
                {{ column.label }}
            </span>
            <span></span>
        </div>
        <div v-else-if="empty" class="empty">{{ empty }}</div>
        <div v-for="(row, index) in rows" :key="rowKey(row)" class="row">
            <div
                v-for="column in columns"
                :key="column.key"
                class="cell"
                :data-field="`${path}.${index}.${column.key}`"
            >
                <span class="cell-label">{{ column.label }}</span>
                <slot
                    :name="`cell-${column.key}`"
                    :row="row"
                    :path="`${path}.${index}.${column.key}`"
                >
                    <BaseSelect
                        v-if="column.options"
                        v-model="values(row)[column.key]"
                        :path="`${path}.${index}.${column.key}`"
                        :options="column.options"
                        :aria-label="column.label"
                        :mono="column.mono"
                    />
                    <BaseInput
                        v-else
                        v-model="values(row)[column.key]"
                        :path="`${path}.${index}.${column.key}`"
                        :aria-label="column.label"
                        :mono="column.mono"
                        :placeholder="column.placeholder"
                        :list="column.list"
                    />
                </slot>
            </div>
            <button
                class="x"
                type="button"
                aria-label="Remove row"
                @click="rows.splice(index, 1)"
            >
                ×
            </button>
        </div>
        <button class="btn sm add" type="button" @click="rows.push(make())">
            {{ addLabel }}
        </button>
    </div>
</template>
