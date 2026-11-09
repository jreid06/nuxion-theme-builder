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
    loadBrief,
    parseBriefFile,
    saveBrief,
} from '~/services/brief/persistence'
import { STEPS, type StepId } from '~/services/brief/steps'
import type { ExportKey } from '~/services/export/kit'
import { PHONE_WIDTH } from '~/services/preview/sitePreview'
import { canvasTextMeasure } from '~/services/utils/dom'

export type LivePanel = 'preview' | 'brief' | 'issues'

export const useBriefStore = defineStore('brief', () => {
    const storageAvailable = ref(true)

    const readSaved = () => {
        try {
            return loadBrief(localStorage)
        } catch {
            storageAvailable.value = false
            return null
        }
    }

    const brief = ref<Brief>(readSaved() ?? exampleBrief())
    const stepId = ref<StepId>('concept')
    const panel = ref<LivePanel>('preview')
    const exportKey = ref<ExportKey>('brief')
    const previewWidth = ref<number>(PHONE_WIDTH)
    const previewScheme = ref<RenderScheme>('light')
    /** Bumped when web fonts arrive, so text measurements are redone. */
    const fontVersion = ref(0)

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
            try {
                saveBrief(localStorage, value)
                storageAvailable.value = true
            } catch {
                storageAvailable.value = false
            }
        },
        { deep: true }
    )

    const replaceBrief = (next: Brief) => {
        brief.value = next
        stepId.value = 'concept'
    }

    const startBlank = () => replaceBrief(blankBrief())
    const loadExample = () => replaceBrief(exampleBrief())

    /** Opens a saved brief. Returns why it couldn't, or null when it could. */
    const openFile = (text: string) => {
        const result = parseBriefFile(text)
        if (!result.ok) return result.error
        replaceBrief(result.brief)
        return null
    }

    return {
        brief,
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
        startBlank,
        loadExample,
        openFile,
    }
})
