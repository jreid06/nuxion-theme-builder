<script setup lang="ts">
import type { StudioOption } from '~/services/brief/model'
import {
    STUDIO_OPTION_GROUPS,
    STUDIO_OPTIONS,
    studioContentPath,
    studioDocuments,
    studioOptionOn,
    type StudioOptionMeta,
} from '~/services/export/studioContent'

const { brief } = storeToRefs(useBriefStore())

const documents = computed(() => studioDocuments(brief.value))

const counts = computed((): Record<StudioOption, string> => ({
    colours: `${brief.value.swatches.length + 1} documents`,
    themes: `${brief.value.themes.length} documents`,
    buttons: `${brief.value.buttons.length} documents`,
    settings: '1 document',
    home: '1 document',
    siteSeo: 'in Site Settings',
}))

const titleOf = (key: StudioOption) =>
    STUDIO_OPTIONS.find((option) => option.key === key)?.title

const blocked = (option: StudioOptionMeta) =>
    Boolean(option.needs && !studioOptionOn(brief.value, option.needs))

const description = (option: StudioOptionMeta) =>
    blocked(option) && option.needs
        ? `Needs ${titleOf(option.needs)} ticked`
        : option.description
</script>

<template>
    <div class="opts" data-field="studio">
        <div class="hint">
            Tick what the file should create. Anything you leave out, you enter
            by hand in the Studio.
        </div>
        <div
            v-for="group in STUDIO_OPTION_GROUPS"
            :key="group.title"
            class="opt-g"
        >
            <span class="flabel">
                {{ group.title }}
                <span class="hint">{{ group.note }}</span>
            </span>
            <template v-for="option in group.items" :key="option.key">
                <label class="opt" :class="{ off: blocked(option) }">
                    <input
                        :id="`studio-${option.key}`"
                        type="checkbox"
                        :checked="studioOptionOn(brief, option.key)"
                        :disabled="blocked(option)"
                        @change="
                            brief.studio[option.key] = (
                                $event.target as HTMLInputElement
                            ).checked
                        "
                    />
                    <span>
                        {{ option.title }}
                        <small>{{ description(option) }}</small>
                    </span>
                    <span class="tag">{{ counts[option.key] }}</span>
                </label>
                <div
                    v-if="option.seo && studioOptionOn(brief, option.key)"
                    class="opt-sub grid2"
                >
                    <TextField
                        v-model="brief.siteSeo.title"
                        path="siteSeo.title"
                        label="Default title"
                        :placeholder="brief.title || 'Site title'"
                    />
                    <TextField
                        v-model="brief.siteSeo.description"
                        path="siteSeo.description"
                        label="Default description"
                        :placeholder="
                            brief.mood || 'One sentence about the site'
                        "
                    />
                </div>
            </template>
        </div>
        <div class="opt-sum">
            <span>
                {{
                    documents.length
                        ? `${documents.length} documents in one file`
                        : 'Nothing selected'
                }}
            </span>
            <span v-if="documents.length" class="mono hint break-words">
                {{ studioContentPath(brief) }}
            </span>
        </div>
    </div>
</template>
