<script setup lang="ts">
import { buttonPreset } from '~/services/brief/model'
import { rowKey } from '~/services/utils/dom'

const { brief } = storeToRefs(useBriefStore())
</script>

<template>
    <div class="btn-grid" data-field="buttons">
        <ButtonPresetCard
            v-for="(preset, index) in brief.buttons"
            :key="rowKey(preset)"
            :preset="preset"
            :index="index"
            @remove="brief.buttons.splice(index, 1)"
        />
    </div>
    <button
        class="btn sm add"
        type="button"
        @click="
            brief.buttons.push(
                buttonPreset('New', 'button', 'default', 'inherit')
            )
        "
    >
        Add preset
    </button>
    <SectionBlock
        title="Button metrics"
        note="Set in theme.css. Leave a size empty to keep Nuxion’s default."
    >
        <div class="grid2">
            <TextField
                v-model="brief.metrics.radius"
                path="metrics.radius"
                label="--radius-button"
                mono
                placeholder="2px"
            />
            <TextField
                v-model="brief.metrics.border"
                path="metrics.border"
                label="--button-border-width"
                mono
                placeholder="1px"
            />
        </div>
        <div
            v-for="size in ['sm', 'md', 'lg'] as const"
            :key="size"
            class="grid2"
        >
            <TextField
                v-model="brief.metrics[size].py"
                :path="`metrics.${size}.py`"
                :label="`--button-py-${size}`"
                mono
            />
            <TextField
                v-model="brief.metrics[size].px"
                :path="`metrics.${size}.px`"
                :label="`--button-px-${size}`"
                mono
            />
            <TextField
                v-model="brief.metrics[size].text"
                :path="`metrics.${size}.text`"
                :label="`--button-text-${size}`"
                mono
            />
        </div>
    </SectionBlock>
</template>
