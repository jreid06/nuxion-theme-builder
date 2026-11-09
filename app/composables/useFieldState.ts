import { computed, toValue, type MaybeRefOrGetter } from 'vue'

/** The class a control takes when Readiness has an issue with its field. */
export const useFieldState = (path: MaybeRefOrGetter<string>) => {
    const store = useBriefStore()
    return computed(() => {
        const severity = store.issueSeverity.get(toValue(path))
        if (severity === 'error') return 'bad'
        return severity === 'warn' ? 'warnf' : ''
    })
}
