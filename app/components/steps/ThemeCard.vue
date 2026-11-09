<script setup lang="ts">
import {
    BODY_CONTRAST,
    contrastRatio,
    UI_CONTRAST,
} from '~/services/brief/colour'
import type {
    ColorRole,
    ColorTheme,
    RenderScheme,
} from '~/services/brief/model'
import { fontStack } from '~/services/brief/names'
import {
    schemesOf,
    swatchHex,
    swatchName,
    themeColors,
} from '~/services/brief/resolve'

const props = defineProps<{ theme: ColorTheme; index: number }>()
defineEmits<{ remove: [] }>()

const { brief } = storeToRefs(useBriefStore())

const ROLES: { role: ColorRole; label: string }[] = [
    { role: 'bg', label: 'Ground' },
    { role: 'text', label: 'Text' },
    { role: 'accent', label: 'Accent' },
]

const open = ref<{ scheme: RenderScheme; role: ColorRole } | null>(null)
const isOpen = (scheme: RenderScheme, role: ColorRole) =>
    open.value?.scheme === scheme && open.value.role === role
const toggle = (scheme: RenderScheme, role: ColorRole) => {
    open.value = isOpen(scheme, role) ? null : { scheme, role }
}
const choose = (id: string) => {
    if (open.value) props.theme[open.value.scheme][open.value.role] = id
    open.value = null
}

const columns = computed(() =>
    schemesOf(brief.value).map((scheme) => {
        const colors = themeColors(brief.value, props.theme, scheme)
        return {
            scheme,
            colors,
            label:
                brief.value.dark === 'full'
                    ? scheme === 'dark'
                        ? 'Dark'
                        : 'Light'
                    : 'Colours',
            text: contrastRatio(colors.text, colors.bg),
            accent: contrastRatio(colors.accent, colors.bg),
        }
    })
)

const headingFont = computed(
    () => fontStack(brief.value.fonts.heading) || 'inherit'
)

const slotLabel = (scheme: RenderScheme, role: ColorRole) => {
    const id = props.theme[scheme][role]
    if (id) return swatchName(brief.value, id)
    return scheme === 'dark' ? 'Reuses light' : 'Choose'
}
</script>

<template>
    <div class="tc" :data-field="`themes.${index}`">
        <div class="tc-head">
            <div class="w-[130px]">
                <BaseInput
                    v-model="theme.key"
                    :path="`themes.${index}.key`"
                    mono
                    aria-label="Theme key"
                />
            </div>
            <div class="flex-[1_1_120px]">
                <BaseInput
                    v-model="theme.note"
                    :path="`themes.${index}.note`"
                    aria-label="Description"
                    placeholder="Description"
                />
            </div>
            <div class="flex-[1_1_140px]">
                <BaseInput
                    v-model="theme.used"
                    :path="`themes.${index}.used`"
                    aria-label="Used on"
                    placeholder="Used on"
                />
            </div>
            <button
                class="x"
                type="button"
                aria-label="Remove theme"
                @click="$emit('remove')"
            >
                ×
            </button>
        </div>
        <div class="tc-cols">
            <div v-for="column in columns" :key="column.scheme" class="tc-col">
                <span class="flabel">{{ column.label }}</span>
                <div
                    class="sample"
                    :style="{
                        background: column.colors.bg || 'transparent',
                        color: column.colors.text || 'inherit',
                    }"
                >
                    <strong :style="{ fontFamily: headingFont }">
                        Aa {{ theme.key }}
                    </strong>
                    <span>Body copy on this canvas.</span>
                    <span
                        class="font-semibold"
                        :style="{ color: column.colors.accent || 'inherit' }"
                    >
                        Accent link
                    </span>
                </div>
                <button
                    v-for="{ role, label } in ROLES"
                    :key="role"
                    class="slot"
                    :class="{ open: isOpen(column.scheme, role) }"
                    type="button"
                    :aria-expanded="isOpen(column.scheme, role)"
                    @click="toggle(column.scheme, role)"
                >
                    <em>{{ label }}</em>
                    <i
                        class="chip"
                        :class="{
                            none: !swatchHex(brief, theme[column.scheme][role]),
                        }"
                        :style="{
                            background:
                                swatchHex(brief, theme[column.scheme][role]) ||
                                undefined,
                        }"
                    ></i>
                    <span class="n">{{ slotLabel(column.scheme, role) }}</span>
                </button>
                <div class="chips">
                    <span
                        v-if="column.text !== null"
                        class="tag"
                        :class="column.text >= BODY_CONTRAST ? 'ok' : 'bad'"
                    >
                        text {{ column.text.toFixed(1) }}:1
                    </span>
                    <span
                        v-if="column.accent !== null"
                        class="tag"
                        :class="column.accent >= UI_CONTRAST ? 'ok' : 'bad'"
                    >
                        accent {{ column.accent.toFixed(1) }}:1
                    </span>
                </div>
            </div>
        </div>
        <div
            v-if="open"
            class="pal"
            role="group"
            aria-label="Choose a swatch"
            @keydown.esc="open = null"
        >
            <button
                v-if="open.scheme === 'dark'"
                class="reuse"
                type="button"
                @click="choose('')"
            >
                Reuse light
            </button>
            <button
                v-for="swatch in brief.swatches"
                :key="swatch.id"
                type="button"
                :class="{ cur: theme[open.scheme][open.role] === swatch.id }"
                :title="swatch.name"
                :aria-label="swatch.name"
                :style="{ background: swatch.hex }"
                @click="choose(swatch.id)"
            ></button>
        </div>
    </div>
</template>
