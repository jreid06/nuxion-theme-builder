import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { runChecks } from '~/services/brief/checks'
import { exampleBrief } from '~/services/brief/example'
import {
    blankBrief,
    type Brief,
    type RenderScheme,
} from '~/services/brief/model'
import {
    duplicateBrief,
    listBriefs,
    migrateLegacyBrief,
    parseBriefFile,
    readBrief,
    removeBrief,
    writeBrief,
    type SavedBrief,
} from '~/services/brief/persistence'
import { STEPS, type StepId } from '~/services/brief/steps'
import type { ExportKey } from '~/services/export/kit'
import { PHONE_WIDTH } from '~/services/preview/sitePreview'
import { canvasTextMeasure } from '~/services/utils/dom'

export type LivePanel = 'preview' | 'brief' | 'issues'

const newId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const useBriefStore = defineStore('brief', () => {
    const storageAvailable = ref(true)

    /** Runs a storage call, noting when the browser refuses it. */
    const withStorage = <T>(task: (storage: Storage) => T, fallback: T): T => {
        try {
            const result = task(localStorage)
            storageAvailable.value = true
            return result
        } catch {
            storageAvailable.value = false
            return fallback
        }
    }

    const library = ref<SavedBrief[]>([])
    const refreshLibrary = () => {
        library.value = withStorage(listBriefs, [])
    }
    withStorage(
        (storage) => migrateLegacyBrief(storage, newId(), Date.now()),
        null
    )
    refreshLibrary()

    /** The open brief's id, or null while the Your briefs screen shows. */
    const currentId = ref<string | null>(null)
    const brief = ref<Brief>(blankBrief())
    const stepId = ref<StepId>('concept')
    const panel = ref<LivePanel>('preview')
    const exportKey = ref<ExportKey>('brief')
    const previewWidth = ref<number>(PHONE_WIDTH)
    const previewScheme = ref<RenderScheme>('light')
    /** Bumped when web fonts arrive, so text measurements are redone. */
    const fontVersion = ref(0)
    /** The open brief as last written, so opening one doesn't count as an edit. */
    let lastSaved = ''

    const step = computed(
        () => STEPS.find(({ id }) => id === stepId.value) ?? STEPS[0]!
    )

    const issues = computed(() => {
        void fontVersion.value
        return runChecks(brief.value, canvasTextMeasure)
    })

    const issueSeverity = computed(() => {
        const severity = new Map<string, 'error' | 'warn'>()
        for (const issue of issues.value) {
            if (severity.get(issue.field) !== 'error') {
                severity.set(issue.field, issue.severity)
            }
        }
        return severity
    })

    const errorCount = computed(
        () => issues.value.filter((issue) => issue.severity === 'error').length
    )

    watch(
        brief,
        (value) => {
            const id = currentId.value
            const text = JSON.stringify(value)
            if (!id || text === lastSaved) return
            lastSaved = text
            withStorage(
                (storage) =>
                    writeBrief(storage, {
                        id,
                        updatedAt: Date.now(),
                        brief: value,
                    }),
                undefined
            )
        },
        { deep: true }
    )

    /** The one change that can be undone: idea cards, palettes and Claude's text. */
    const lastChange = ref<{ label: string; snapshot: string } | null>(null)

    const change = (label: string, edit: (target: Brief) => void) => {
        lastChange.value = { label, snapshot: JSON.stringify(brief.value) }
        edit(brief.value)
    }

    const undoChange = () => {
        if (!lastChange.value) return
        brief.value = JSON.parse(lastChange.value.snapshot) as Brief
        lastChange.value = null
    }

    const show = (id: string, next: Brief) => {
        lastSaved = JSON.stringify(next)
        brief.value = next
        currentId.value = id
        stepId.value = 'concept'
        lastChange.value = null
    }

    /** Saves a new brief and opens it. */
    const create = (next: Brief) => {
        const id = newId()
        withStorage(
            (storage) =>
                writeBrief(storage, { id, updatedAt: Date.now(), brief: next }),
            undefined
        )
        show(id, next)
    }

    const openBrief = (id: string) => {
        const saved = withStorage((storage) => readBrief(storage, id), null)
        if (saved) show(id, saved.brief)
    }

    const closeBrief = () => {
        currentId.value = null
        lastChange.value = null
        refreshLibrary()
    }

    const startBlank = () => create(blankBrief())
    const loadExample = () => create(exampleBrief())

    const duplicate = (id: string) => {
        const saved = library.value.find((item) => item.id === id)
        if (!saved) return
        const copy = {
            id: newId(),
            updatedAt: Date.now(),
            brief: duplicateBrief(saved.brief),
        }
        withStorage((storage) => writeBrief(storage, copy), undefined)
        refreshLibrary()
    }

    const remove = (id: string) => {
        withStorage((storage) => removeBrief(storage, id), undefined)
        refreshLibrary()
    }

    /** Adds a downloaded brief as a new one and opens it. Returns why it couldn't. */
    const openFile = (text: string) => {
        const result = parseBriefFile(text)
        if (!result.ok) return result.error
        create(result.brief)
        return null
    }

    return {
        brief,
        currentId,
        library,
        storageAvailable,
        stepId,
        step,
        panel,
        exportKey,
        previewWidth,
        previewScheme,
        fontVersion,
        issues,
        issueSeverity,
        errorCount,
        lastChange,
        change,
        undoChange,
        openBrief,
        closeBrief,
        startBlank,
        loadExample,
        duplicate,
        remove,
        openFile,
        refreshLibrary,
    }
})
