<script setup lang="ts">
import { prefixFor, slugify } from '~/services/brief/names'

const { brief } = storeToRefs(useBriefStore())

const setTitle = (title?: string) => {
    brief.value.title = title ?? ''
    if (brief.value.autoName) {
        brief.value.name = slugify(title)
        brief.value.px = prefixFor(title ?? '')
    }
}

const stopAutoName = () => {
    brief.value.autoName = false
}

const STATUS_OPTIONS = [
    'brief',
    'building',
    'demo',
    'release candidate',
    'shipped',
].map((value) => ({ value, label: value }))

const DARK_HINTS = {
    full: 'Every Color Theme gets dark slots.',
    none: 'Light only. Dark slots are switched off.',
    pinned: 'One scheme only. Dark slots are switched off.',
}

const nameHint = computed(() => {
    const { name, px } = brief.value
    return name
        ? `Blocks: ${name}.*  ·  Classes: .${px || '??'}-*  ·  Variables: --${px || '??'}-*`
        : 'Filled in from the theme name.'
})
</script>

<template>
    <div class="grid2">
        <TextField
            :model-value="brief.title"
            path="title"
            label="Theme name"
            placeholder="Driftwire"
            @update:model-value="setTitle"
        />
        <TextField
            v-model="brief.px"
            path="px"
            label="CSS prefix"
            mono
            placeholder="dw"
            hint="Two or three letters."
            @update:model-value="stopAutoName"
        />
        <TextField
            v-model="brief.name"
            path="name"
            label="Codename"
            mono
            placeholder="driftwire"
            :hint="nameHint"
            @update:model-value="stopAutoName"
        />
        <TextField
            v-model="brief.release"
            path="release"
            label="Target release"
            mono
            placeholder="1.10"
            hint="The Nuxion version this ships in."
        />
    </div>
    <TextField
        v-model="brief.mood"
        path="mood"
        label="One line of mood"
        :rows="2"
        placeholder="A ship’s chart room: paper, navy ink and signal flags."
        hint="Be concrete. Name a place, a material or an object."
    />
    <AssistBar v-model="brief.mood" field="mood" label="Mood line" />
    <DirectionPicker />
    <div class="grid2">
        <SegmentedField
            v-model="brief.scheme"
            path="scheme"
            label="Default scheme"
            :options="[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                {
                    value: 'system',
                    label: 'System',
                    disabled: brief.dark === 'pinned',
                },
            ]"
        />
        <SegmentedField
            v-model="brief.dark"
            path="dark"
            label="Dark scheme"
            :hint="DARK_HINTS[brief.dark]"
            :options="[
                { value: 'full', label: 'Full' },
                { value: 'none', label: 'None' },
                {
                    value: 'pinned',
                    label: 'Pinned',
                    disabled: brief.scheme === 'system',
                },
            ]"
        />
    </div>
    <SelectField
        v-model="brief.status"
        path="status"
        label="Status"
        :options="STATUS_OPTIONS"
    />
</template>
